import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../config";

const RunTrackerScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);

  const [duration, setDuration] = useState(""); // Duration in minutes
  const [calories, setCalories] = useState(""); // Calories burned
  const [loading, setLoading] = useState(false);
  const [WorkoutName, setWorkoutName] = useState("");

  // --- Input Change Handlers ---
  const handleDurationChange = (text) => {
    // Basic validation to only allow numbers and one decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    setDuration(cleanedText);
  };

  const handleCaloriesChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    setCalories(cleanedText);
  };

  // --- Save Logic: Corrected to use client-side Date for array element ---
  const handleSaveRun = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to record a run.");
      return;
    }
    
    const durationMinutes = parseFloat(duration);
    const caloriesBurned = parseInt(calories);
    const workoutName = workoutName || "Unnamed Workout";

    if (isNaN(durationMinutes) || durationMinutes <= 0 || isNaN(caloriesBurned) || caloriesBurned <= 0) {
      Alert.alert("Invalid Input", "Please enter valid, positive numbers for duration and calories.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the run record object. Use new Date() for the timestamp 
      //    to avoid the Firebase error when used inside arrayUnion().
      const newRunRecord = {
        duration_minutes: durationMinutes,
        calories_burned: caloriesBurned,
        workoutName: workoutName,
        timestamp: new Date(), // FIX: Client-side Date object
        date: new Date().toISOString().split('T')[0], 
      };

      // 2. Get the reference to the user's profile document
      const userDocRef = doc(db, "users", user.uid);
      
      // 3. Update the document, using arrayUnion to atomically add the new record to the 'runHistory' array
      await updateDoc(userDocRef, {
        runHistory: arrayUnion(newRunRecord),
        // Use serverTimestamp() directly on the top-level field
        lastRunRecordUpdate: serverTimestamp(), 
      });

      Alert.alert("Success 🎉", "Run successfully recorded to your profile!");
      setDuration("");
      setCalories("");

    } catch (error) {
      console.error("Error saving run record:", error);
      Alert.alert("Error", "Failed to save record to profile. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏃 Run Tracker</Text>
        <Text style={styles.subtitle}>Log your running and exercise activity</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manual Run Entry</Text>
          <Text style={styles.description}>
            Enter the details of your run. The record will be appended to your **runHistory** in your user profile.
          </Text>

          <TextInput
  style={styles.input}
  value={WorkoutName}
  onChangeText={setWorkoutName} 
  keyboardType="default"        
  placeholder="e.g., Morning Jog"
  placeholderTextColor={theme.colors.textLight}
/>

          {/* Duration Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={handleDurationChange}
              keyboardType="numeric"
              placeholder="e.g., 30.5"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          {/* Calories Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Calories Burned (estimated)</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={handleCaloriesChange}
              keyboardType="numeric"
              placeholder="e.g., 250"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSaveRun}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.saveButtonText}>Save Run Record →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info/Tip Card */}
        <View style={[styles.card, styles.tipCard]}>
          <Text style={styles.tipText}>
            💡 **Storage Method:** Data is saved using `arrayUnion` to the `runHistory` field in your Firestore user document.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

// --- Styles (Same as previous version, using the theme) ---
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
        paddingBottom: theme.spacing.xl,
    },
    header: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.xl,
      alignItems: "center",
      borderBottomLeftRadius: theme.borderRadius.large,
      borderBottomRightRadius: theme.borderRadius.large,
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.sizes.title,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textLight,
    },
    card: {
      backgroundColor: theme.colors.card,
      marginHorizontal: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.medium,
      ...theme.shadows.medium,
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    description: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textLight,
        marginBottom: theme.spacing.lg,
        lineHeight: 22,
    },
    formGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.small,
      borderWidth: 1,
      borderColor: theme.colors.border,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.secondary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.medium,
      alignItems: "center",
      marginTop: theme.spacing.md,
      ...theme.shadows.small,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.border,
    },
    tipCard: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.accent,
        paddingVertical: theme.spacing.md,
    },
    tipText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
        lineHeight: 18,
    }
  });

export default RunTrackerScreen;