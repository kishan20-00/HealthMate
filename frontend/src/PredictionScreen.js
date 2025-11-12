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
    workout: ['duration_minutes', 'calories_burned'],
    lifestyle: ['sleep_hours', 'water_intake_liters', 'stress_level', 'screen_time_hours'],
    meal: ['goal', 'meal_type'],
};

const PredictionScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme(); 
  const styles = createStyles(theme); 

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("workout");
  const [predictions, setPredictions] = useState({
    workout: null,
    lifestyle: null,
    meal: null,
  });

  // State to hold the necessary input data for API calls, pre-filled from DB
  const [apiInputData, setApiInputData] = useState(null);
  
  // --- Data Fetching and Auto-Trigger Logic ---
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
      // Automatically run predictions after user data and last inputs are ready
      if (apiInputData && !loading) {
          handleAutoPrediction();
      } else if (!apiInputData && !loading) {
          // Set loading to false if no input data, preventing infinite loading state
          setLoading(false); 
      }
  }, [apiInputData]);

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 22.5; // Default BMI
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
    setLoading(true);
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
        const runRecords = data.runHistory || []; // Ensure array fallback
        const hydrationData = data.hydrationData || {};
        const screenTimeHistory = data.screenTimeHistory || []; // Ensure array fallback
        const foodHistory = data.foodHistory || []; // Ensure array fallback

        const dateKeys = Object.keys(hydrationData);
        dateKeys.sort(); 
        const latestDateKey = dateKeys[dateKeys.length - 1]; 
        const latestRecord = hydrationData[latestDateKey] || {};

        // Set initial predictions state with the latest results (for quick display)
        setPredictions({
          workout: aiRecs.workout || null,
          lifestyle: aiRecs.lifestyle || null,
          meal: aiRecs.meal || null,
        });

        // Extract last successful input data or use profile/default values
        const wIn = runRecords[runRecords.length - 1] || {};
        // Lifestyle input from profile or previous successful prediction
        // Using profile data directly for sleep, activity, health conditions
        // Using latest tracking data for water/screen time
        const sIn = screenTimeHistory[screenTimeHistory.length - 1] || {};
        const fIn = foodHistory[foodHistory.length - 1] || {};

        // Prepare the standardized input data object for API calls
        // Use ?? to default to null if the value is missing or 0, making validation easier
        // Note: parseInt/parseFloat on null/undefined/non-numeric gives NaN, so we handle that
        const waterIntake = parseFloat(latestRecord.cups) ? (latestRecord.cups * 200 / 1000).toFixed(1) : null;
        const screenTime = parseFloat(sIn.screen_time_hours);
        const workoutDuration = parseInt(wIn.duration_minutes);
        const caloriesBurned = parseInt(wIn.calories_burned);

        setApiInputData({
            // Base User Data - CRITICAL FOR ALL
            age: data.age ?? null,
            gender: data.gender ?? null,
            activity_level: data.activityLevel || "Medium", // Has default
            health_condition: data.healthConditions || "None", // Has default
            bmi_status: bmiStatus,
            bmi: parseFloat(currentBMI),

            // Workout Defaults (Last successful run or default values)
            workout: {
                // Must be a number for API, null if not available
                duration_minutes: isNaN(workoutDuration) ? null : workoutDuration,
                calories_burned: isNaN(caloriesBurned) ? null : caloriesBurned,
            },

            // Lifestyle Defaults
            lifestyle: {
                sleep_hours: parseFloat(data.sleepHours) ?? null,
                recommended_sleep: 8.0, // Fixed
                water_intake_liters: parseFloat(waterIntake) ?? null,
                stress_level: data.stressLevel || "Moderate", // Check DB, use moderate if missing
                screen_time_hours: isNaN(screenTime) ? null : screenTime,
            },

            // Meal Defaults 
            meal: {
                goal: fIn.goal ?? null,
                meal_type: fIn.meal_type ?? null,
            }
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data for prediction.");
    } finally {
        // The auto-prediction useEffect will set loading to false after data is ready/not ready
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPredictions({ workout: null, lifestyle: null, meal: null }); 
    await fetchUserData(); 
    setRefreshing(false);
  };
  
  // Helper to structure input data for API (using pre-filled apiInputData)
  const getPredictionInputData = (type) => {
      if (!apiInputData) {
          return { missingData: true, reason: 'Profile data is missing.' };
      }
      
      const input = {};
      const requiredBase = REQUIRED_FIELDS.base;
      const requiredType = REQUIRED_FIELDS[type];
      const missingFields = [];

      // Combine base and type-specific required fields
      const allRequired = [...requiredBase];
      if (type === 'workout') {
          // Workout needs base + workout fields
          allRequired.push(...REQUIRED_FIELDS.workout);
          Object.assign(input, apiInputData.workout);
      } else if (type === 'lifestyle') {
          // Lifestyle needs base + lifestyle fields
          allRequired.push(...REQUIRED_FIELDS.lifestyle.filter(f => f !== 'stress_level')); // Stress has a default
          Object.assign(input, apiInputData.lifestyle);
      } else if (type === 'meal') {
          // Meal needs base + meal fields
          allRequired.push(...REQUIRED_FIELDS.meal);
          Object.assign(input, apiInputData.meal);
      }

      // Add base data to the input object
      Object.assign(input, {
          age: apiInputData.age,
          gender: apiInputData.gender,
          activity_level: apiInputData.activity_level,
          health_condition: apiInputData.health_condition,
          bmi_status: apiInputData.bmi_status,
          bmi: apiInputData.bmi,
      });

      // 1. Validation Check: Ensure all required fields have valid values
      for (const field of allRequired) {
          // Check if value is null, undefined, or NaN (from parseInt/parseFloat on missing data)
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

      // 2. Return validated, structured input data
      return input;
  }

  // Store recommendation helper (unchanged)
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
          timestamp: new Date(), // Use client-side date for array element
          inputData: inputData,
      };

      aiRecommendations[type] = record;
      recommendationHistory[type].unshift(record);

      // Keep only latest 5 entries
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
        // Set prediction state to an object indicating missing data to be rendered
        setPredictions((prev) => ({
            ...prev,
            [type]: { status: "missing_input", error: inputData.reason },
        }));
        return; 
    }

    // Check if the current prediction is an error/missing state, and skip loading if it's already there
    const isErrorState = predictions[type]?.status === "missing_input" || predictions[type] === null;

    // Skip showing loading indicator for auto-run if a successful prediction already exists
    const shouldShowLoading = !predictions[type] || isErrorState;

    if (shouldShowLoading) setLoading(true);

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
        // API returned an error/failure
        setPredictions((prev) => ({
            ...prev,
            [type]: { status: "api_error", error: result.error || `Failed to get ${type} recommendation.` },
        }));
        Alert.alert("Prediction Error", result.error || `Failed to get ${type} recommendation.`);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      // Catch network/service call error
      setPredictions((prev) => ({
          ...prev,
          [type]: { status: "service_error", error: "Failed to communicate with prediction service." },
      }));
      Alert.alert(
        "Error",
        "Failed to communicate with prediction service."
      );
    } finally {
        if (shouldShowLoading) setLoading(false);
    }
  };

  // --- New function to handle running all predictions automatically ---
  const handleAutoPrediction = () => {
      // Run prediction for the active tab first, then run the rest silently
      handlePrediction(activeTab);
      setLoading(false);
  }

  // --- Simplified Render Functions ---

  const renderPredictionResult = (type, predictionData) => {
      
      // 1. Loading state (only show if we don't have existing data)
      if (loading && (!predictionData || predictionData.status === "missing_input" || predictionData.status === "api_error" || predictionData.status === "service_error")) {
          return (
              <View style={styles.loadingResultContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingResultText}>Generating new recommendation...</Text>
              </View>
          );
      }
      
      // 2. Missing Input Data / Error State
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
                      disabled={loading || isMissing} // Disable retry if data is missing
                  >
                      <Text style={styles.retryButtonText}>
                          {isMissing ? 'Cannot Run Prediction' : 'Retry Prediction Now'}
                      </Text>
                  </TouchableOpacity>
              </View>
          );
      }

      // 3. Successful Result
      const mainResult = predictionData.recommended_workout || predictionData.recommendation || predictionData.recommended_meal;
      const confidence = predictionData.confidence;
      const calories = predictionData.estimated_calories;

      return (
          <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                  {type === 'workout' ? 'Recommended Workout' : type === 'lifestyle' ? 'Lifestyle Recommendation' : 'Meal Recommendation'}
              </Text>
              <Text style={styles.resultMain}>{mainResult}</Text>

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
                              <Text> {rec.workout || rec.meal}</Text>
                              <Text style={styles.subResultConfidence}> ({((rec.confidence || 0) * 100).toFixed(1)}%)</Text>
                          </Text>
                      ))}
                  </>
              )}
          </View>
      );
  };
  
  // The render functions (renderWorkoutTab, renderLifestyleTab, renderMealTab) 
  // are essentially unchanged, as the rendering logic is all in renderPredictionResult.

  const renderWorkoutTab = () => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>
            <Text>💪 Workout Prediction</Text>
        </Text>
        <Text style={styles.description}>
            <Text>Automatically generated routine based on your latest profile data (Duration: {apiInputData?.workout?.duration_minutes ?? 'N/A'} min, Calories: {apiInputData?.workout?.calories_burned ?? 'N/A'}).</Text>
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

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]} // Use theme color
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

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "workout" && styles.activeTab]}
            onPress={() => { setActiveTab("workout"); handlePrediction("workout"); }} // Trigger prediction on tab switch
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

        {/* Tab Content */}
        {activeTab === "workout" && renderWorkoutTab()}
        {activeTab === "lifestyle" && renderLifestyleTab()}
        {activeTab === "meal" && renderMealTab()}

        {/* User Info Summary */}
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

// --- Styles using theme ---
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
    // --- Result Styles ---
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
        // Since this uses nested Text components, ensure wrapping for safety
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
        borderLeftColor: theme.colors.accent || 'orange', // New color for missing data
    },
    noResultEmoji: {
        fontSize: 32,
        marginBottom: theme.spacing.sm,
    },
    noResultText: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textLight,
        marginBottom: theme.spacing.md,
        textAlign: 'center', // Center the error message
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