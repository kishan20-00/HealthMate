// screens/LifestyleAdviceScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const LifestyleAdviceScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  // Motivational quotes
  const motivationalQuotes = [
    {
      text: "Small steps each day lead to big results.",
      author: "HealthMate",
      category: "Progress",
      emoji: "🌟",
    },
    {
      text: "Your body can do it. It's your mind you need to convince.",
      author: "Fitness Wisdom",
      category: "Mindset",
      emoji: "💪",
    },
    {
      text: "Health is not about the weight you lose, but about the life you gain.",
      author: "Wellness Guide",
      category: "Health",
      emoji: "✨",
    },
    {
      text: "Every workout is progress, no matter how small.",
      author: "Fitness Journey",
      category: "Exercise",
      emoji: "🏃‍♂️",
    },
    {
      text: "Hydrate, move, and smile — your body will thank you.",
      author: "Daily Wellness",
      category: "Lifestyle",
      emoji: "💧",
    },
    {
      text: "Sleep is the golden chain that ties health and our bodies together.",
      author: "Sleep Science",
      category: "Rest",
      emoji: "😴",
    },
    {
      text: "Nourish your body. It's the only place you have to live.",
      author: "Nutrition Facts",
      category: "Nutrition",
      emoji: "🥗",
    },
    {
      text: "Stress less, live more. Your mental health matters.",
      author: "Mental Wellness",
      category: "Mental Health",
      emoji: "🧘‍♀️",
    },
  ];

  // Lifestyle advice
  const lifestyleAdvice = [
    {
      title: "Morning Routine",
      advice: "Start your day with a glass of water and 5 minutes of stretching to energize your body.",
      tips: ["Drink water immediately upon waking", "Do gentle stretches", "Take deep breaths"],
      emoji: "🌅",
      color: theme.colors.primary,
    },
    {
      title: "Healthy Eating",
      advice: "Fill half your plate with vegetables, quarter with lean protein, and quarter with whole grains.",
      tips: ["Eat colorful vegetables", "Choose lean proteins", "Opt for whole grains"],
      emoji: "🥗",
      color: theme.colors.success,
    },
    {
      title: "Stay Active",
      advice: "Take the stairs, park farther away, or do desk exercises to stay active throughout the day.",
      tips: ["Take regular breaks", "Use stairs instead of elevators", "Walk during phone calls"],
      emoji: "🚶‍♂️",
      color: theme.colors.secondary,
    },
    {
      title: "Better Sleep",
      advice: "Create a bedtime routine and avoid screens 1 hour before sleep for better rest.",
      tips: ["Set a consistent bedtime", "Avoid screens before bed", "Keep room cool and dark"],
      emoji: "😴",
      color: theme.colors.purple,
    },
    {
      title: "Stress Management",
      advice: "Practice deep breathing, meditation, or gentle yoga to manage daily stress effectively.",
      tips: ["Practice deep breathing", "Try meditation apps", "Do gentle yoga"],
      emoji: "🧘‍♀️",
      color: theme.colors.accent,
    },
    {
      title: "Hydration Habits",
      advice: "Carry a water bottle and set reminders to drink water throughout the day.",
      tips: ["Carry a water bottle", "Set hydration reminders", "Flavor water with fruits"],
      emoji: "💧",
      color: theme.colors.hydration.water,
    },
  ];

  useEffect(() => {
    // Randomly select initial content
    setCurrentQuoteIndex(Math.floor(Math.random() * motivationalQuotes.length));
    setCurrentAdviceIndex(Math.floor(Math.random() * lifestyleAdvice.length));
  }, []);

  const animateTransition = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(callback, 150);
  };

  const nextQuote = () => {
    animateTransition(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    });
  };

  const nextAdvice = () => {
    animateTransition(() => {
      setCurrentAdviceIndex((prev) => (prev + 1) % lifestyleAdvice.length);
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Simulate refresh and get new random content
    setTimeout(() => {
      setCurrentQuoteIndex(Math.floor(Math.random() * motivationalQuotes.length));
      setCurrentAdviceIndex(Math.floor(Math.random() * lifestyleAdvice.length));
      setRefreshing(false);
    }, 1000);
  };

  const currentQuote = motivationalQuotes[currentQuoteIndex];
  const currentAdvice = lifestyleAdvice[currentAdviceIndex];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌟 Daily Inspiration</Text>
        <Text style={styles.subtitle}>Motivate your wellness journey</Text>
      </View>

      {/* Motivational Quote Card */}
      <Animated.View style={[styles.quoteSection, { opacity: fadeAnim }]}>
        <View style={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <Text style={styles.quoteEmoji}>{currentQuote.emoji}</Text>
            <Text style={styles.quoteCategory}>{currentQuote.category}</Text>
          </View>
          
          <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
          
          <TouchableOpacity style={styles.nextButton} onPress={nextQuote}>
            <Text style={styles.nextButtonText}>Next Quote →</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Lifestyle Advice Card */}
      <Animated.View style={[styles.adviceSection, { opacity: fadeAnim }]}>
        <View style={[styles.adviceCard, { borderLeftColor: currentAdvice.color }]}>
          <View style={styles.adviceHeader}>
            <Text style={styles.adviceEmoji}>{currentAdvice.emoji}</Text>
            <Text style={styles.adviceTitle}>{currentAdvice.title}</Text>
          </View>
          
          <Text style={styles.adviceText}>{currentAdvice.advice}</Text>
          
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Quick Tips:</Text>
            {currentAdvice.tips.map((tip, index) => (
              <Text key={index} style={styles.tipItem}>• {tip}</Text>
            ))}
          </View>
          
          <TouchableOpacity style={styles.nextButton} onPress={nextAdvice}>
            <Text style={styles.nextButtonText}>Next Advice →</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Daily Wellness Checklist */}
      <View style={styles.checklistSection}>
        <Text style={styles.checklistTitle}>🎯 Daily Wellness Goals</Text>
        <View style={styles.checklistCard}>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistEmoji}>💧</Text>
            <Text style={styles.checklistText}>Drink 8 glasses of water</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistEmoji}>🚶‍♂️</Text>
            <Text style={styles.checklistText}>Take 10,000 steps</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistEmoji}>🥗</Text>
            <Text style={styles.checklistText}>Eat 5 servings of fruits/vegetables</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistEmoji}>😴</Text>
            <Text style={styles.checklistText}>Get 7-9 hours of sleep</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistEmoji}>🧘‍♀️</Text>
            <Text style={styles.checklistText}>Practice 5 minutes of mindfulness</Text>
          </View>
        </View>
      </View>

      {/* Wellness Facts */}
      <View style={styles.factsSection}>
        <Text style={styles.factsTitle}>💡 Did You Know?</Text>
        <View style={styles.factCard}>
          <Text style={styles.factText}>
            Regular physical activity can reduce the risk of chronic diseases by up to 50% and improve mental health significantly.
          </Text>
        </View>
        
        <View style={styles.factCard}>
          <Text style={styles.factText}>
            Drinking water before meals can help with weight management and improve digestion.
          </Text>
        </View>
        
        <View style={styles.factCard}>
          <Text style={styles.factText}>
            Getting adequate sleep improves immune function, memory consolidation, and emotional regulation.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme) => StyleSheet.create({
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
  },
  quoteSection: {
    padding: theme.spacing.lg,
  },
  quoteCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.medium,
  },
  quoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  quoteEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  quoteCategory: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textLight,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.small,
  },
  quoteText: {
    fontSize: theme.typography.sizes.lg,
    fontStyle: "italic",
    color: theme.colors.text,
    lineHeight: 26,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  quoteAuthor: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    textAlign: "right",
    marginBottom: theme.spacing.lg,
  },
  nextButton: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
  },
  nextButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  adviceSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  adviceCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 4,
    ...theme.shadows.small,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  adviceEmoji: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  adviceTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  adviceText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  tipsContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.lg,
  },
  tipsTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tipItem: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: 4,
    lineHeight: 18,
  },
  checklistSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  checklistTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  checklistCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  checklistEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    width: 30,
  },
  checklistText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    flex: 1,
  },
  factsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  factsTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  factCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    ...theme.shadows.small,
  },
  factText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
});

export default LifestyleAdviceScreen;
