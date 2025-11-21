// src/PredictionScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config";
import { apiService } from "../services/api";

// Define required fields for each prediction type for validation
const REQUIRED_FIELDS = {
    base: ['age', 'gender', 'activity_level', 'bmi_status', 'bmi'],
    workout: ['calories_burned', 'health_condition'],
    lifestyle: ['sleep_hours', 'water_intake_liters', 'stress_level', 'screen_time_hours'],
    meal: ['goal', 'meal_type', 'bmi_status'],
};

const PredictionScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme(); 
  const styles = createStyles(theme); 

  const [userData, setUserData] = useState(null);
  
  // Split loading states to prevent useEffect loops
  const [profileLoading, setProfileLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("workout");
  const [predictions, setPredictions] = useState({
    workout: null,
    lifestyle: null,
    meal: null,
  });

  const [apiInputData, setApiInputData] = useState(null);
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
      // Only run if profile is done loading and we have data
      if (!profileLoading && apiInputData) {
          if (!predictions[activeTab]) {
              handleAutoPrediction();
          }
      }
  }, [profileLoading, apiInputData]); 

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 22.5;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmiValue) => {
    const bmi = parseFloat(bmiValue);
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const fetchUserData = async () => {
    setProfileLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);

        const currentWeight = data.currentWeight || data.weight;
        const height = data.height;
        const currentBMI = calculateBMI(currentWeight, height);
        const bmiStatus = getBMICategory(currentBMI);
        
        const aiRecs = data.aiRecommendations || {};
        const runRecords = data.runHistory || []; 
        const hydrationData = data.hydrationData || {};
        const screenTimeHistory = data.screenTimeHistory || []; 
        const foodHistory = data.foodHistory || []; 

        const dateKeys = Object.keys(hydrationData);
        dateKeys.sort(); 
        const latestDateKey = dateKeys[dateKeys.length - 1]; 
        const latestRecord = hydrationData[latestDateKey] || {};

        setPredictions({
          workout: aiRecs.workout || null,
          lifestyle: aiRecs.lifestyle || null,
          meal: aiRecs.meal || null,
        });

        const wIn = runRecords[runRecords.length - 1] || {};
        const sIn = screenTimeHistory[screenTimeHistory.length - 1] || {};
        const fIn = foodHistory[foodHistory.length - 1] || {};

        const waterIntake = parseFloat(latestRecord.cups) ? (latestRecord.cups * 200 / 1000).toFixed(1) : null;
        const screenTime = parseFloat(sIn.screen_time_hours);
        const caloriesBurned = parseInt(wIn.calories_burned);

        setApiInputData({
            age: data.age ?? null,
            gender: data.gender ?? null,
            activity_level: data.activityLevel || "Medium",
            health_condition: data.healthConditions || "None",
            bmi_status: bmiStatus,
            bmi: parseFloat(currentBMI),

            workout: {
                calories_burned: isNaN(caloriesBurned) ? null : caloriesBurned,
            },

            lifestyle: {
                sleep_hours: parseFloat(data.sleepHours) ?? null,
                recommended_sleep: 8.0,
                water_intake_liters: parseFloat(waterIntake) ?? null,
                stress_level: data.stressLevel || "Moderate",
                screen_time_hours: isNaN(screenTime) ? null : screenTime,
            },

            meal: {
                goal: fIn.goal ?? null,
                meal_type: fIn.meal_type ?? null,
            }
        });
      } else {
          Alert.alert("Profile Error", "User profile not found. Please complete your profile setup.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data for prediction.");
    } finally {
        setProfileLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPredictions({ workout: null, lifestyle: null, meal: null }); 
    await fetchUserData(); 
    setRefreshing(false);
  };
  
  const getPredictionInputData = (type) => {
      if (!apiInputData) {
          return { missingData: true, reason: 'Profile data is missing.' };
      }
      
      const input = {};
      const requiredBase = REQUIRED_FIELDS.base;
      const requiredType = REQUIRED_FIELDS[type];
      const missingFields = [];

      const allRequired = [...requiredBase];
      if (type === 'workout') {
          allRequired.push(...REQUIRED_FIELDS.workout);
          Object.assign(input, apiInputData.workout);
      } else if (type === 'lifestyle') {
          allRequired.push(...REQUIRED_FIELDS.lifestyle.filter(f => f !== 'stress_level'));
          Object.assign(input, apiInputData.lifestyle);
      } else if (type === 'meal') {
          allRequired.push(...REQUIRED_FIELDS.meal);
          Object.assign(input, apiInputData.meal);
      }

      Object.assign(input, {
          age: apiInputData.age,
          gender: apiInputData.gender,
          activity_level: apiInputData.activity_level,
          health_condition: apiInputData.health_condition,
          bmi_status: apiInputData.bmi_status,
          bmi: apiInputData.bmi,
      });

      for (const field of allRequired) {
          const value = input[field];
          if (value === null || value === undefined || (typeof value === 'number' && isNaN(value)) || value === '') {
              missingFields.push(field);
          }
      }
      
      if (missingFields.length > 0) {
          return { 
              missingData: true, 
              reason: `Missing fields: ${missingFields.join(', ')}. Please update your profile or activity data.`,
              missingFields: missingFields 
          };
      }

      return input;
  }

  const storeRecommendation = async (type, result, inputData) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      const aiRecommendations = userData.aiRecommendations || {};
      const recommendationHistory = userData.recommendationHistory || {};
      if (!recommendationHistory[type]) {
        recommendationHistory[type] = [];
      }

      const record = {
          ...result,
          timestamp: new Date(), 
          inputData: inputData,
      };

      aiRecommendations[type] = record;
      recommendationHistory[type].unshift(record);

      if (recommendationHistory[type].length > 5) {
        recommendationHistory[type] = recommendationHistory[type].slice(0, 5);
      }

      await updateDoc(userDocRef, {
        aiRecommendations,
        recommendationHistory,
        lastAIRecommendationUpdate: serverTimestamp(), 
      });

    } catch (error) {
      console.error("Error storing recommendation:", error);
    }
  };

  const handlePrediction = async (type) => {
    const inputData = getPredictionInputData(type);
    
    if (inputData.missingData) {
        setPredictions((prev) => ({
            ...prev,
            [type]: { status: "missing_input", error: inputData.reason },
        }));
        return; 
    }

    const isErrorState = predictions[type]?.status === "missing_input" || predictions[type] === null;
    const shouldShowLoading = !predictions[type] || isErrorState;

    if (shouldShowLoading) setPredictionLoading(true);

    try {
      let result;

      switch (type) {
        case "workout":
          result = await apiService.getWorkoutRecommendation(inputData);
          break;
        case "lifestyle":
          result = await apiService.getLifestyleRecommendation(inputData);
          break;
        case "meal":
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

        await storeRecommendation(type, result, inputData);
      } else {
        setPredictions((prev) => ({
            ...prev,
            [type]: { status: "api_error", error: result.error || `Failed to get ${type} recommendation.` },
        }));
        Alert.alert("Prediction Error", result.error || `Failed to get ${type} recommendation.`);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setPredictions((prev) => ({
          ...prev,
          [type]: { status: "service_error", error: "Failed to communicate with prediction service." },
      }));
      Alert.alert("Error", "Failed to communicate with prediction service.");
    } finally {
        if (shouldShowLoading) setPredictionLoading(false);
    }
  };

  const handleAutoPrediction = () => {
      handlePrediction(activeTab);
  }

  const renderPredictionResult = (type, predictionData) => {
      
      if (predictionLoading && (!predictionData || predictionData.status === "missing_input" || predictionData.status === "api_error" || predictionData.status === "service_error")) {
          return (
              <View style={styles.loadingResultContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingResultText}>Generating new recommendation...</Text>
              </View>
          );
      }
      
      if (!predictionData || predictionData.status === "missing_input" || predictionData.status === "api_error" || predictionData.status === "service_error") {
          const isMissing = predictionData?.status === "missing_input";
          const message = isMissing 
              ? predictionData.error || "Insufficient data in your profile for this prediction."
              : predictionData?.error || "No recent prediction found or failed to generate.";
          
          return (
              <View style={[styles.noResultContainer, isMissing && styles.missingInputContainer]}>
                  <Text style={styles.noResultEmoji}>{isMissing ? '❌' : '⚠️'}</Text>
                  <Text style={styles.noResultText}>
                      <Text style={{fontWeight: theme.typography.weights.bold}}>{isMissing ? 'Data Required: ' : 'Prediction Failed: '}</Text>
                      {message}
                  </Text>
                  <TouchableOpacity 
                      style={styles.retryButton} 
                      onPress={() => handlePrediction(type)}
                      disabled={predictionLoading || isMissing} 
                  >
                      <Text style={styles.retryButtonText}>
                          {isMissing ? 'Cannot Run Prediction' : 'Retry Prediction Now'}
                      </Text>
                  </TouchableOpacity>
              </View>
          );
      }

      const mainResult = predictionData.recommended_workout || predictionData.recommendation || predictionData.recommended_meal;
      const confidence = predictionData.confidence;
      const calories = predictionData.estimated_calories;
      const duration = predictionData.estimated_duration_minutes;

      return (
          <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                  {type === 'workout' ? 'Recommended Workout' : type === 'lifestyle' ? 'Lifestyle Recommendation' : 'Meal Recommendation'}
              </Text>
              <Text style={styles.resultMain}>{mainResult}</Text>

              {duration && (
                  <Text style={styles.confidence}>Estimated Duration: {duration} min</Text>
              )}

              {calories && (
                  <Text style={styles.confidence}>Estimated Calories: {calories}</Text>
              )}
              {confidence && (
                  <Text style={styles.confidence}>Confidence: {(confidence * 100).toFixed(1)}%</Text>
              )}

              {predictionData.top_recommendations?.length > 0 && (
                  <>
                      <Text style={styles.subResultTitle}>Top Recommendations:</Text>
                      {predictionData.top_recommendations.map((rec, index) => (
                          <Text key={index} style={styles.subResult}>
                              <Text style={styles.subResultNumber}>{index + 1}.</Text>
                              
                              {/* --- FIXED: Added 'rec.recommendation' to the list of text options --- */}
                              <Text> {rec.workout || rec.recommendation || rec.meal}</Text>
                              
                              <Text style={styles.subResultConfidence}> ({((rec.confidence || 0) * 100).toFixed(1)}%)</Text>
                              
                              {type === 'workout' && duration && (
                                  <Text style={styles.subResultConfidence}> • ~{duration} min</Text>
                              )}
                          </Text>
                      ))}
                  </>
              )}
          </View>
      );
  };

  const renderWorkoutTab = () => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>
            <Text>💪 Workout Prediction</Text>
        </Text>
        <Text style={styles.description}>
            <Text>Automatically generated routine based on your goal. (Target Calories: {apiInputData?.workout?.calories_burned ?? 'N/A'}).</Text>
        </Text>
        {renderPredictionResult("workout", predictions.workout)}
    </View>
  );

  const renderLifestyleTab = () => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>
            <Text>🌱 Lifestyle Prediction</Text>
        </Text>
        <Text style={styles.description}>
            <Text>Automatically generated tips based on your profile and habits (Sleep: {apiInputData?.lifestyle?.sleep_hours ?? 'N/A'}h, Water: {apiInputData?.lifestyle?.water_intake_liters ?? 'N/A'}L).</Text>
        </Text>
        {renderPredictionResult("lifestyle", predictions.lifestyle)}
    </View>
  );

  const renderMealTab = () => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>
            <Text>🍽️ Meal Prediction</Text>
        </Text>
        <Text style={styles.description}>
            <Text>Automatically generated meal based on your profile and goals (Goal: {apiInputData?.meal?.goal ?? 'N/A'}, Type: {apiInputData?.meal?.meal_type ?? 'N/A'}).</Text>
        </Text>
        {renderPredictionResult("meal", predictions.meal)}
    </View>
  );

  if (profileLoading && !userData) {
      return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
             <ActivityIndicator size="large" color={theme.colors.primary} />
             <Text style={{ marginTop: 10, color: theme.colors.textLight }}>Loading Profile Data...</Text>
        </View>
      );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]} 
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}><Text>🤖 AI Recommendations</Text></Text>
          <Text style={styles.subtitle}>
            <Text>Personalized recommendations using AI</Text>
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "workout" && styles.activeTab]}
            onPress={() => { setActiveTab("workout"); handlePrediction("workout"); }} 
          >
            <Text style={[styles.tabText, activeTab === "workout" && styles.activeTabText]}>
              <Text>💪 Workout</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "lifestyle" && styles.activeTab]}
            onPress={() => { setActiveTab("lifestyle"); handlePrediction("lifestyle"); }}
          >
            <Text style={[styles.tabText, activeTab === "lifestyle" && styles.activeTabText]}>
              <Text>🌱 Lifestyle</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "meal" && styles.activeTab]}
            onPress={() => { setActiveTab("meal"); handlePrediction("meal"); }}
          >
            <Text style={[styles.tabText, activeTab === "meal" && styles.activeTabText]}>
              <Text>🍽️ Meal</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "workout" && renderWorkoutTab()}
        {activeTab === "lifestyle" && renderLifestyleTab()}
        {activeTab === "meal" && renderMealTab()}

        {userData && (
          <View style={styles.userSummary}>
            <Text style={styles.summaryTitle}><Text>Your Profile Summary (used for AI)</Text></Text>
            <Text style={styles.summaryText}>
              <Text>Age: {userData.age} • Gender: {userData.gender} • BMI: {calculateBMI(userData.currentWeight || userData.weight, userData.height)}</Text>
            </Text>
            <Text style={styles.summaryText}>
              <Text>Activity: {userData.activityLevel} • Sleep: {userData.sleepHours}h</Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background || "#f5f5f5", 
    },
    header: {
        backgroundColor: theme.colors.primary || "#A8E6CF",
        padding: theme.spacing.xl || 20,
        alignItems: "center",
        borderBottomLeftRadius: theme.borderRadius.large || 10, 
        borderBottomRightRadius: theme.borderRadius.large || 10,
    },
    title: {
        fontSize: theme.typography.sizes.title || 24,
        fontWeight: theme.typography.weights.bold || "bold",
        color: theme.colors.text || "black",
        marginBottom: theme.spacing.sm || 5,
    },
    subtitle: {
        fontSize: theme.typography.sizes.md || 14,
        color: theme.colors.textLight || "gray",
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: theme.colors.card || "white",
        marginHorizontal: theme.spacing.lg || 20,
        marginTop: theme.spacing.lg || 20,
        borderRadius: theme.borderRadius.medium || 10,
        overflow: "hidden",
        ...theme.shadows.medium,
    },
    tab: {
        flex: 1,
        padding: theme.spacing.md || 15,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: theme.colors.secondary || "#4ecdc4",
    },
    tabText: {
        fontSize: theme.typography.sizes.md || 14,
        fontWeight: theme.typography.weights.medium || "600",
        color: theme.colors.textLight || "#666",
    },
    activeTabText: {
        color: theme.colors.text || "white",
    },
    tabContent: {
        padding: theme.spacing.lg || 20,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.xl || 22,
        fontWeight: theme.typography.weights.bold || "bold",
        color: theme.colors.text || "#333",
        marginBottom: theme.spacing.sm || 10,
    },
    description: {
        fontSize: theme.typography.sizes.md || 14,
        color: theme.colors.textLight || "#666",
        marginBottom: theme.spacing.lg || 20,
        lineHeight: 20,
    },
    resultContainer: {
        backgroundColor: theme.colors.card || "white",
        padding: theme.spacing.lg || 15,
        borderRadius: theme.borderRadius.medium || 10,
        marginTop: theme.spacing.sm || 10,
        ...theme.shadows.small,
    },
    resultTitle: {
        fontSize: theme.typography.sizes.lg || 18,
        fontWeight: theme.typography.weights.bold || "bold",
        color: theme.colors.text || "#333",
        marginBottom: theme.spacing.sm || 10,
    },
    resultMain: {
        fontSize: theme.typography.sizes.md || 16,
        color: theme.colors.primary || "#ff6b6b",
        fontWeight: theme.typography.weights.semibold || "600",
        marginBottom: theme.spacing.xs || 5,
        lineHeight: 22,
    },
    confidence: {
        fontSize: theme.typography.sizes.sm || 14,
        color: theme.colors.textLight || "#666",
        marginBottom: theme.spacing.xs || 5,
    },
    subResultTitle: {
        fontSize: theme.typography.sizes.sm || 14,
        fontWeight: theme.typography.weights.semibold || "600",
        color: theme.colors.text || "#333",
        marginTop: theme.spacing.md || 10,
        marginBottom: theme.spacing.xs || 5,
    },
    subResult: {
        fontSize: theme.typography.sizes.xs || 13,
        color: theme.colors.textLight || "#666",
        marginBottom: 3,
    },
    subResultNumber: {
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.secondary,
        marginRight: 5,
    },
    subResultConfidence: {
        fontStyle: 'italic',
        color: theme.colors.textLight,
    },
    loadingResultContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.medium,
        ...theme.shadows.small,
    },
    loadingResultText: {
        marginTop: theme.spacing.md,
        color: theme.colors.textLight,
        fontSize: theme.typography.sizes.md,
    },
    noResultContainer: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.medium,
        ...theme.shadows.small,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.error,
    },
    missingInputContainer: {
        borderLeftColor: theme.colors.accent || 'orange', 
    },
    noResultEmoji: {
        fontSize: 32,
        marginBottom: theme.spacing.sm,
    },
    noResultText: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textLight,
        marginBottom: theme.spacing.md,
        textAlign: 'center', 
    },
    retryButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.small,
    },
    retryButtonText: {
        color: theme.colors.text,
        fontWeight: theme.typography.weights.semibold,
        fontSize: theme.typography.sizes.md,
    },
    userSummary: {
        backgroundColor: theme.colors.card || "white",
        margin: theme.spacing.lg || 20,
        padding: theme.spacing.md || 15,
        borderRadius: theme.borderRadius.medium || 10,
        ...theme.shadows.small,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.accent,
    },
    summaryTitle: {
        fontSize: theme.typography.sizes.md || 16,
        fontWeight: theme.typography.weights.bold || "bold",
        color: theme.colors.text || "#333",
        marginBottom: theme.spacing.sm || 10,
    },
    summaryText: {
        fontSize: theme.typography.sizes.sm || 14,
        color: theme.colors.textLight || "#666",
        marginBottom: theme.spacing.xs || 5,
    },
});

export default PredictionScreen;