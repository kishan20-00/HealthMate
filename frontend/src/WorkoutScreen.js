// screens/WorkoutScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

const WorkoutScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Example data for workout categories/tiles
  const workoutCategories = [
    { title: "Full Body HIIT", duration: "20 min", level: "Intermediate", emoji: "🔥", color: theme.colors.primary },
    { title: "Strength Training", duration: "45 min", level: "All Levels", emoji: "🏋️", color: theme.colors.secondary },
    { title: "Gentle Yoga Flow", duration: "30 min", level: "Beginner", emoji: "🧘", color: theme.colors.success },
    { title: "Morning Cardio", duration: "15 min", level: "Beginner", emoji: "🏃", color: theme.colors.purple },
  ];

  // A focused workout tip/fact
  const workoutTip = {
    title: "The Power of Consistency",
    text: "Aim for 3-5 workout sessions per week, even if they are short. Consistency is the single most important factor for achieving long-term fitness results.",
    tip: "Remember to include rest days for muscle recovery!",
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💪 Your Workout Hub</Text>
        <Text style={styles.subtitle}>Find a routine that fits your day</Text>
      </View>

      {/* Workout Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Recommended Categories</Text>
        {workoutCategories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.categoryCard, { borderLeftColor: category.color }]}
            onPress={() => console.log(`Navigating to ${category.title} details`)}
          >
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.duration} • {category.level}</Text>
              </View>
            </View>
            <Text style={styles.categoryAction}>View →</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Workout Tip Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Workout Focus Tip</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>{workoutTip.title}</Text>
          <Text style={styles.tipText}>{workoutTip.text}</Text>
          <View style={styles.quickTipContainer}>
            <Text style={styles.quickTipText}>📌 Quick Tip: {workoutTip.tip}</Text>
          </View>
        </View>
      </View>
      
    </ScrollView>
  );
};

// Function to create themed styles
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.xl,
      alignItems: "center",
      borderBottomLeftRadius: theme.borderRadius.large,
      borderBottomRightRadius: theme.borderRadius.large,
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
    
    // --- New Section Styles ---
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    
    // --- Category Card Styles (Similar to Advice Card) ---
    categoryCard: {
      backgroundColor: theme.colors.card,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: 4,
      ...theme.shadows.small,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryEmoji: {
      fontSize: 28,
      marginRight: theme.spacing.md,
    },
    categoryTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
      marginBottom: 2,
    },
    categorySubtitle: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    categoryAction: {
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.secondary,
    },

    // --- Tip Card Styles (Similar to Fact Card) ---
    tipCard: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.medium,
        ...theme.shadows.small,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.accent,
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
    quickTipContainer: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.small,
    },
    quickTipText: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.text,
    }
  });

export default WorkoutScreen;