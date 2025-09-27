// src/PredictionScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config";
import { apiService } from "../services/api";

const PredictionScreen = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("workout");
  const [predictions, setPredictions] = useState({
    workout: null,
    lifestyle: null,
    meal: null,
  });

  // Workout form state
  const [workoutForm, setWorkoutForm] = useState({
    duration_minutes: "45",
    calories_burned: "300",
  });

  // Lifestyle form state
  const [lifestyleForm, setLifestyleForm] = useState({
    sleep_hours: "",
    recommended_sleep: "8.0",
    water_intake_liters: "",
    stress_level: "Moderate",
    screen_time_hours: "",
  });

  // Meal form state
  const [mealForm, setMealForm] = useState({
    bmi_status: "Normal",
    goal: "Maintenance",
    meal_type: "Lunch",
  });

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);

        // Pre-fill lifestyle form with user data
        setLifestyleForm((prev) => ({
          ...prev,
          sleep_hours: data.sleepHours?.toString() || "",
          water_intake_liters: "2.0", // Default value
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const calculateBMI = () => {
    if (!userData) return null;
    const weight = userData.currentWeight || userData.weight;
    const height = userData.height;
    if (!weight || !height) return null;

    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getWorkoutInputData = () => {
    if (!userData) return null;

    return {
      age: userData.age,
      gender: userData.gender,
      bmi: parseFloat(calculateBMI()) || 22.5,
      activity_level: userData.activityLevel || "Medium",
      health_condition: userData.healthConditions || "None",
      duration_minutes: parseInt(workoutForm.duration_minutes) || 45,
      calories_burned: parseInt(workoutForm.calories_burned) || 300,
    };
  };

  const getLifestyleInputData = () => {
    if (!userData) return null;

    return {
      age: userData.age,
      gender: userData.gender,
      sleep_hours: parseFloat(lifestyleForm.sleep_hours) || 7.0,
      recommended_sleep: parseFloat(lifestyleForm.recommended_sleep) || 8.0,
      water_intake_liters: parseFloat(lifestyleForm.water_intake_liters) || 2.0,
      stress_level: lifestyleForm.stress_level,
      screen_time_hours: parseFloat(lifestyleForm.screen_time_hours) || 5.0,
    };
  };

  const getMealInputData = () => {
    if (!userData) return null;

    return {
      age: userData.age,
      gender: userData.gender,
      bmi_status: mealForm.bmi_status,
      goal: mealForm.goal,
      meal_type: mealForm.meal_type,
    };
  };

  const handlePrediction = async (type) => {
    if (!userData) {
      Alert.alert("Error", "Please complete your profile first");
      return;
    }

    setLoading(true);
    try {
      let inputData, result;

      switch (type) {
        case "workout":
          inputData = getWorkoutInputData();
          result = await apiService.getWorkoutRecommendation(inputData);
          break;
        case "lifestyle":
          inputData = getLifestyleInputData();
          result = await apiService.getLifestyleRecommendation(inputData);
          break;
        case "meal":
          inputData = getMealInputData();
          result = await apiService.getMealRecommendation(inputData);
          break;
        default:
          throw new Error("Invalid prediction type");
      }

      if (result.status === "success") {
        setPredictions((prev) => ({
          ...prev,
          [type]: result,
        }));
        Alert.alert(
          "Success",
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } recommendation generated!`
        );
      } else {
        Alert.alert("Error", result.error || "Prediction failed");
      }
    } catch (error) {
      console.error("Prediction error:", error);
      Alert.alert(
        "Error",
        "Failed to get recommendation. Please check your connection."
      );
    }
    setLoading(false);
  };

  const renderWorkoutTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Workout Recommendation</Text>
      <Text style={styles.description}>
        Get personalized workout recommendations based on your profile and
        preferences.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={workoutForm.duration_minutes}
          onChangeText={(text) =>
            setWorkoutForm((prev) => ({ ...prev, duration_minutes: text }))
          }
          keyboardType="numeric"
          placeholder="45"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Calories Target</Text>
        <TextInput
          style={styles.input}
          value={workoutForm.calories_burned}
          onChangeText={(text) =>
            setWorkoutForm((prev) => ({ ...prev, calories_burned: text }))
          }
          keyboardType="numeric"
          placeholder="300"
        />
      </View>

      <TouchableOpacity
        style={[styles.predictButton, loading && styles.buttonDisabled]}
        onPress={() => handlePrediction("workout")}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.predictButtonText}>
            Get Workout Recommendation
          </Text>
        )}
      </TouchableOpacity>

      {predictions.workout && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Recommended Workout</Text>
          <Text style={styles.resultMain}>
            {predictions.workout.recommended_workout}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {(predictions.workout.confidence * 100).toFixed(1)}%
          </Text>

          <Text style={styles.subResultTitle}>Top Recommendations:</Text>
          {predictions.workout.top_recommendations?.map((rec, index) => (
            <Text key={index} style={styles.subResult}>
              {index + 1}. {rec.workout} ({(rec.confidence * 100).toFixed(1)}%)
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderLifestyleTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Lifestyle Recommendation</Text>
      <Text style={styles.description}>
        Get personalized lifestyle recommendations to improve your daily habits.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Sleep Hours (actual)</Text>
        <TextInput
          style={styles.input}
          value={lifestyleForm.sleep_hours}
          onChangeText={(text) =>
            setLifestyleForm((prev) => ({ ...prev, sleep_hours: text }))
          }
          keyboardType="numeric"
          placeholder="7.0"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Recommended Sleep Hours</Text>
        <TextInput
          style={styles.input}
          value={lifestyleForm.recommended_sleep}
          onChangeText={(text) =>
            setLifestyleForm((prev) => ({ ...prev, recommended_sleep: text }))
          }
          keyboardType="numeric"
          placeholder="8.0"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Water Intake (liters)</Text>
        <TextInput
          style={styles.input}
          value={lifestyleForm.water_intake_liters}
          onChangeText={(text) =>
            setLifestyleForm((prev) => ({ ...prev, water_intake_liters: text }))
          }
          keyboardType="numeric"
          placeholder="2.0"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Stress Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={lifestyleForm.stress_level}
            onValueChange={(value) =>
              setLifestyleForm((prev) => ({ ...prev, stress_level: value }))
            }
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Moderate" value="Moderate" />
            <Picker.Item label="High" value="High" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Screen Time (hours)</Text>
        <TextInput
          style={styles.input}
          value={lifestyleForm.screen_time_hours}
          onChangeText={(text) =>
            setLifestyleForm((prev) => ({ ...prev, screen_time_hours: text }))
          }
          keyboardType="numeric"
          placeholder="5.0"
        />
      </View>

      <TouchableOpacity
        style={[styles.predictButton, loading && styles.buttonDisabled]}
        onPress={() => handlePrediction("lifestyle")}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.predictButtonText}>
            Get Lifestyle Recommendation
          </Text>
        )}
      </TouchableOpacity>

      {predictions.lifestyle && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Lifestyle Recommendation</Text>
          <Text style={styles.resultMain}>
            {predictions.lifestyle.recommendation}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {(predictions.lifestyle.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderMealTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Meal Recommendation</Text>
      <Text style={styles.description}>
        Get personalized meal recommendations based on your goals and
        preferences.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>BMI Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={mealForm.bmi_status}
            onValueChange={(value) =>
              setMealForm((prev) => ({ ...prev, bmi_status: value }))
            }
          >
            <Picker.Item label="Underweight" value="Underweight" />
            <Picker.Item label="Normal" value="Normal" />
            <Picker.Item label="Overweight" value="Overweight" />
            <Picker.Item label="Obese" value="Obese" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Goal</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={mealForm.goal}
            onValueChange={(value) =>
              setMealForm((prev) => ({ ...prev, goal: value }))
            }
          >
            <Picker.Item label="Weight Loss" value="Weight Loss" />
            <Picker.Item label="Maintenance" value="Maintenance" />
            <Picker.Item label="Muscle Gain" value="Muscle Gain" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Meal Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={mealForm.meal_type}
            onValueChange={(value) =>
              setMealForm((prev) => ({ ...prev, meal_type: value }))
            }
          >
            <Picker.Item label="Breakfast" value="Breakfast" />
            <Picker.Item label="Lunch" value="Lunch" />
            <Picker.Item label="Dinner" value="Dinner" />
            <Picker.Item label="Snack" value="Snack" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.predictButton, loading && styles.buttonDisabled]}
        onPress={() => handlePrediction("meal")}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.predictButtonText}>Get Meal Recommendation</Text>
        )}
      </TouchableOpacity>

      {predictions.meal && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Meal Recommendation</Text>
          <Text style={styles.resultMain}>
            {predictions.meal.recommended_meal}
          </Text>
          <Text style={styles.confidence}>
            Estimated Calories: {predictions.meal.estimated_calories}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {(predictions.meal.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ff6b6b"]}
            tintColor="#ff6b6b"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>AI Recommendations</Text>
          <Text style={styles.subtitle}>
            Get personalized recommendations using AI
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "workout" && styles.activeTab]}
            onPress={() => setActiveTab("workout")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "workout" && styles.activeTabText,
              ]}
            >
              💪 Workout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "lifestyle" && styles.activeTab]}
            onPress={() => setActiveTab("lifestyle")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "lifestyle" && styles.activeTabText,
              ]}
            >
              🌱 Lifestyle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "meal" && styles.activeTab]}
            onPress={() => setActiveTab("meal")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "meal" && styles.activeTabText,
              ]}
            >
              🍽️ Meal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "workout" && renderWorkoutTab()}
        {activeTab === "lifestyle" && renderLifestyleTab()}
        {activeTab === "meal" && renderMealTab()}

        {/* User Info Summary */}
        {userData && (
          <View style={styles.userSummary}>
            <Text style={styles.summaryTitle}>Your Profile Summary</Text>
            <Text style={styles.summaryText}>
              Age: {userData.age} • Gender: {userData.gender} • BMI:{" "}
              {calculateBMI()}
            </Text>
            <Text style={styles.summaryText}>
              Activity: {userData.activityLevel} • Sleep: {userData.sleepHours}h
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#ff6b6b",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4ecdc4",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "white",
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  predictButton: {
    backgroundColor: "#4ecdc4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  predictButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  resultMain: {
    fontSize: 16,
    color: "#ff6b6b",
    fontWeight: "600",
    marginBottom: 5,
  },
  confidence: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  subResultTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  subResult: {
    fontSize: 13,
    color: "#666",
    marginBottom: 3,
  },
  userSummary: {
    backgroundColor: "white",
    margin: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
});

export default PredictionScreen;
