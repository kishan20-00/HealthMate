// screens/HydrationScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config";
import { useTheme } from "../context/ThemeContext";

const HydrationScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [cupsToday, setCupsToday] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(8);
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Hydration tips
  const hydrationTips = [
    "💧 Drinking water boosts your energy levels!",
    "🌟 Start your day with a glass of water to kickstart your metabolism",
    "🏃‍♂️ Drink water before, during, and after exercise",
    "🍎 Eat water-rich foods like watermelon, cucumber, and oranges",
    "⏰ Set reminders to drink water throughout the day",
    "🌡️ Drink more water in hot weather or when you're sick",
    "💪 Proper hydration helps maintain muscle function",
    "🧠 Stay hydrated to improve concentration and mood",
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (user) {
      fetchHydrationData();
    }
  }, [user]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(animatedValue, {
      toValue: cupsToday / dailyGoal,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [cupsToday, dailyGoal]);

  const fetchHydrationData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const today = new Date().toISOString().split("T")[0];
        
        // Check if we have hydration data for today
        const hydrationData = data.hydrationData || {};
        const todayData = hydrationData[today] || { cups: 0, goal: 8 };
        
        setCupsToday(todayData.cups);
        setDailyGoal(todayData.goal);
      }
    } catch (error) {
      console.error("Error fetching hydration data:", error);
    }
  };

  const updateHydrationData = async (newCups) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const userDocRef = doc(db, "users", user.uid);
      
      // Get current data
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      const hydrationData = userData.hydrationData || {};
      
      // Update today's data
      hydrationData[today] = {
        cups: newCups,
        goal: dailyGoal,
        timestamp: new Date(),
      };
      
      await updateDoc(userDocRef, {
        hydrationData: hydrationData,
      });
      
      setCupsToday(newCups);
    } catch (error) {
      console.error("Error updating hydration data:", error);
      Alert.alert("Error", "Failed to update hydration data");
    }
  };

  const addCup = () => {
    const newCups = cupsToday + 1;
    updateHydrationData(newCups);
    
    if (newCups >= dailyGoal) {
      Alert.alert(
        "🎉 Goal Achieved!",
        "Congratulations! You've reached your daily hydration goal!",
        [{ text: "Awesome!", style: "default" }]
      );
    }
  };

  const removeCup = () => {
    if (cupsToday > 0) {
      updateHydrationData(cupsToday - 1);
    }
  };

  const resetDay = () => {
    Alert.alert(
      "Reset Today's Progress",
      "Are you sure you want to reset today's water intake?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => updateHydrationData(0) },
      ]
    );
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % hydrationTips.length);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHydrationData();
    setRefreshing(false);
  };

  const progressPercentage = Math.min((cupsToday / dailyGoal) * 100, 100);
  const isGoalReached = cupsToday >= dailyGoal;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.hydration.water]}
          tintColor={theme.colors.hydration.water}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💧 Hydration Tracker</Text>
        <Text style={styles.subtitle}>Stay hydrated, stay healthy!</Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          
          {/* Water Cups Visual */}
          <View style={styles.cupsContainer}>
            {Array.from({ length: dailyGoal }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.cup,
                  index < cupsToday ? styles.cupFilled : styles.cupEmpty,
                ]}
              >
                <Text style={styles.cupIcon}>
                  {index < cupsToday ? "💧" : "🥤"}
                </Text>
              </View>
            ))}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {cupsToday} / {dailyGoal} cups ({Math.round(progressPercentage)}%)
            </Text>
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, isGoalReached && styles.goalReached]}>
              {isGoalReached
                ? "🎉 Goal Achieved!"
                : `${dailyGoal - cupsToday} more cups to go!`}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={addCup}>
            <Text style={styles.actionButtonText}>➕ Add Cup</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.removeButton]} 
            onPress={removeCup}
            disabled={cupsToday === 0}
          >
            <Text style={[styles.actionButtonText, cupsToday === 0 && styles.disabledText]}>
              ➖ Remove Cup
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetDay}>
          <Text style={styles.resetButtonText}>🔄 Reset Today</Text>
        </TouchableOpacity>
      </View>

      {/* Hydration Tips */}
      <View style={styles.tipsSection}>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Hydration Tip</Text>
          <Text style={styles.tipText}>{hydrationTips[currentTip]}</Text>
          <TouchableOpacity style={styles.nextTipButton} onPress={nextTip}>
            <Text style={styles.nextTipText}>Next Tip →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Benefits of Staying Hydrated</Text>
        <View style={styles.benefitsList}>
          <Text style={styles.benefitItem}>🧠 Improves brain function and concentration</Text>
          <Text style={styles.benefitItem}>💪 Maintains muscle function and strength</Text>
          <Text style={styles.benefitItem}>✨ Keeps skin healthy and glowing</Text>
          <Text style={styles.benefitItem}>🔥 Boosts metabolism and energy levels</Text>
          <Text style={styles.benefitItem}>🛡️ Supports immune system function</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.hydration.background,
  },
  header: {
    backgroundColor: theme.colors.hydration.water,
    padding: theme.spacing.xl,
    alignItems: "center",
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
  },
  title: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
  },
  progressSection: {
    padding: theme.spacing.lg,
  },
  progressCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  progressTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  cupsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  cup: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.small,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  cupFilled: {
    backgroundColor: theme.colors.hydration.water,
    borderColor: theme.colors.hydration.progress,
  },
  cupEmpty: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.textLight,
  },
  cupIcon: {
    fontSize: 16,
  },
  progressBarContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.hydration.progress,
    borderRadius: 6,
  },
  progressText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  statusContainer: {
    alignItems: "center",
  },
  statusText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textLight,
  },
  goalReached: {
    color: theme.colors.success,
  },
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    backgroundColor: theme.colors.hydration.water,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    alignItems: "center",
    ...theme.shadows.small,
  },
  removeButton: {
    backgroundColor: theme.colors.accent,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  disabledText: {
    color: theme.colors.textLight,
  },
  resetButton: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    ...theme.shadows.small,
  },
  resetButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  tipsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  tipCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  tipTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  nextTipButton: {
    alignSelf: "flex-end",
  },
  nextTipText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.hydration.water,
  },
  benefitsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  benefitsTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  benefitsList: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  benefitItem: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
});

export default HydrationScreen;
