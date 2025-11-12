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

const ScreenTimeTrackerScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);

  const [screenTime, setScreenTime] = useState(""); // Screen time in hours
  const [loading, setLoading] = useState(false);

  // --- Input Change Handler ---
  const handleScreenTimeChange = (text) => {
    // Allows numbers and one decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    setScreenTime(cleanedText);
  };

  // --- Save Logic ---
  const handleSaveScreenTime = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to record screen time.");
      return;
    }
    
    const screenTimeHours = parseFloat(screenTime);

    if (isNaN(screenTimeHours) || screenTimeHours < 0) {
      Alert.alert("Invalid Input", "Please enter a valid, non-negative number for screen time.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the screen time record object.
      const newScreenTimeRecord = {
        screen_time_hours: screenTimeHours,
        // Use client-side Date object to avoid Firebase arrayUnion error
        timestamp: new Date(), 
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };

      // 2. Get the reference to the user's profile document
      const userDocRef = doc(db, "users", user.uid);
      
      // 3. Update the document, using arrayUnion to atomically add the new record 
      //    to the 'screenTimeHistory' array.
      await updateDoc(userDocRef, {
        screenTimeHistory: arrayUnion(newScreenTimeRecord),
        // Update a top-level timestamp for easy reference
        lastScreenTimeUpdate: serverTimestamp(), 
      });

      Alert.alert("Success 🎉", "Screen time successfully recorded!");
      // Clear the form
      setScreenTime("");

    } catch (error) {
      console.error("Error saving screen time record:", error);
      Alert.alert("Error", "Failed to save record to profile. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 Screen Time Tracker</Text>
        <Text style={styles.subtitle}>Log your digital usage for mindful living</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Screen Time Entry</Text>
          <Text style={styles.description}>
            Enter the total hours you spent looking at screens today (phone, computer, tablet, TV).
          </Text>

          {/* Screen Time Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Screen Time (hours)</Text>
            <TextInput
              style={styles.input}
              value={screenTime}
              onChangeText={handleScreenTimeChange}
              keyboardType="numeric"
              placeholder="e.g., 4.5"
              placeholderTextColor={theme.colors.textLight}
              maxLength={5} // Prevent overly long input
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSaveScreenTime}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.saveButtonText}>Record Screen Time →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info/Tip Card */}
        <View style={[styles.card, styles.tipCard]}>
          <Text style={styles.tipText}>
            💡 **Goal:** Aim for screen-free breaks. Excessive screen time, especially before bed, can impact sleep quality and mental health.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

// --- Styles (Adapted from RunTrackerScreen.js) ---
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

export default ScreenTimeTrackerScreen;