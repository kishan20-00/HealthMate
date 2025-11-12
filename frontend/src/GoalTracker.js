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
import { Picker } from "@react-native-picker/picker"; // Import Picker
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../config";

const FoodTrackerScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);

  // Default values based on your prediction input structure
  const [mealForm, setMealForm] = useState({
    meal_name: "",
    calories: "",
    meal_type: "Lunch", // Default from mIn.meal_type || "Lunch"
    goal: "Maintenance", // Default from mIn.goal || "Maintenance"
  });
  
  const [loading, setLoading] = useState(false);

  // --- Input Change Handlers ---
  const handleFormChange = (field, value) => {
    setMealForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCaloriesChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    setMealForm((prev) => ({ ...prev, calories: cleanedText }));
  };

  // --- Save Logic ---
  const handleSaveMeal = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to record a meal.");
      return;
    }
    
    const { meal_name, calories, meal_type, goal } = mealForm;
    const estimatedCalories = parseInt(calories);

    if (!meal_name || isNaN(estimatedCalories) || estimatedCalories <= 0) {
      Alert.alert("Invalid Input", "Please enter a meal name and valid, positive calories.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the meal record object.
      const newMealRecord = {
        meal_name: meal_name,
        calories: estimatedCalories,
        meal_type: meal_type,
        goal: goal,
        timestamp: new Date(), 
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };

      // 2. Get the reference to the user's profile document
      const userDocRef = doc(db, "users", user.uid);
      
      // 3. Update the document, adding the new record to the 'foodHistory' array.
      await updateDoc(userDocRef, {
        foodHistory: arrayUnion(newMealRecord),
        lastFoodRecordUpdate: serverTimestamp(), 
      });

      Alert.alert("Success 🎉", "Meal successfully recorded!");
      // Clear meal name and calories, keep default type/goal
      setMealForm((prev) => ({ ...prev, meal_name: "", calories: "" }));

    } catch (error) {
      console.error("Error saving meal record:", error);
      Alert.alert("Error", "Failed to save meal record. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍽️ Meal Tracker</Text>
        <Text style={styles.subtitle}>Log your meals and monitor your calorie goals</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Record a Meal</Text>
          <Text style={styles.description}>
            Add a meal to your daily log. You can specify the type and your overall diet goal.
          </Text>

          {/* Meal Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Meal Name or Description</Text>
            <TextInput
              style={styles.input}
              value={mealForm.meal_name}
              onChangeText={(text) => handleFormChange('meal_name', text)}
              placeholder="e.g., Chicken Salad with Quinoa"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          {/* Calories Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Estimated Calories (kcal)</Text>
            <TextInput
              style={styles.input}
              value={mealForm.calories}
              onChangeText={handleCaloriesChange}
              keyboardType="numeric"
              placeholder="e.g., 450"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          {/* Meal Type Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Meal Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={mealForm.meal_type}
                onValueChange={(value) => handleFormChange('meal_type', value)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Breakfast 🥞" value="Breakfast" />
                <Picker.Item label="Lunch 🥗" value="Lunch" />
                <Picker.Item label="Dinner 🍜" value="Dinner" />
                <Picker.Item label="Snack 🍎" value="Snack" />
              </Picker>
            </View>
          </View>

          {/* Goal Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Diet Goal</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={mealForm.goal}
                onValueChange={(value) => handleFormChange('goal', value)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Weight Loss" value="Weight Loss" />
                <Picker.Item label="Maintenance" value="Maintenance" />
                <Picker.Item label="Muscle Gain" value="Muscle Gain" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSaveMeal}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.saveButtonText}>Add Meal to Log →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info/Tip Card */}
        <View style={[styles.card, styles.tipCard]}>
          <Text style={styles.tipText}>
            💡 **Tip:** Tracking meals honestly helps the AI provide more accurate future meal recommendations!
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

// --- Styles (Adapted from previous trackers) ---
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
    pickerContainer: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.small,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    picker: {
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

export default FoodTrackerScreen;