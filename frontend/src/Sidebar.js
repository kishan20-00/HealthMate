import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const Sidebar = ({ isVisible, onClose, user, logout }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [aiRecommendations, setAiRecommendations] = useState(null);

  // Fetch AI recommendations
  const fetchAIRecommendations = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setAiRecommendations(userData.aiRecommendations || null);
      }
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
    }
  };

  React.useEffect(() => {
    if (isVisible) {
      // Fetch AI recommendations when sidebar opens
      fetchAIRecommendations();
    }
  }, [isVisible]);

  const menuItems = [
    { name: "Home", icon: "🏠", screen: "Home" },
    { name: "Profile", icon: "👤", screen: "Profile" },
    { name: "Hydration Tracker", icon: "💧", screen: "Hydration" },
    { name: "Daily Inspiration", icon: "🌟", screen: "LifestyleAdvice" },
    { name: "AI Recommendations", icon: "🤖", screen: "Predictions" },
    { name: "Run Tracker", icon: "🏃‍♂️", screen: "Run" },
    { name: "Screen Time Tracker", icon: "🖥️", screen: "ScreenTime" },
    { name: "Food Tracker", icon: "🍜", screen: "FoodTracker" },
    { name: "Workouts", icon: "💪", screen: "Workout" },
    { name: "Progress", icon: "📊", screen: "Progress" },
    { name: "Settings", icon: "⚙️", screen: "Settings" },
  ];

  const handleNavigation = (screen) => {
    onClose();
    navigation.navigate(screen); // Use navigation from hook
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Background overlay */}
      <TouchableOpacity
        style={styles.overlay}
        onPress={() => {
          onClose();
        }}
        activeOpacity={1}
      />

      {/* Sidebar content */}
      <View style={styles.sidebar}>
        <ScrollView style={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menu}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.screen)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Recommendations Section */}
          {aiRecommendations && (
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>🤖 Latest AI Recommendations</Text>

              {aiRecommendations.workout && (
                <View style={styles.aiCard}>
                  <Text style={styles.aiCardTitle}>💪 Workout</Text>
                  <Text style={styles.aiCardText} numberOfLines={2}>
                    {aiRecommendations.workout.recommended_workout}
                  </Text>
                  <Text style={styles.aiCardTime}>
                    {new Date(aiRecommendations.workout.timestamp?.toDate()).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {aiRecommendations.lifestyle && (
                <View style={styles.aiCard}>
                  <Text style={styles.aiCardTitle}>🌱 Lifestyle</Text>
                  <Text style={styles.aiCardText} numberOfLines={2}>
                    {aiRecommendations.lifestyle.recommendation}
                  </Text>
                  <Text style={styles.aiCardTime}>
                    {new Date(aiRecommendations.lifestyle.timestamp?.toDate()).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {aiRecommendations.meal && (
                <View style={styles.aiCard}>
                  <Text style={styles.aiCardTitle}>🍽️ Meal</Text>
                  <Text style={styles.aiCardText} numberOfLines={2}>
                    {aiRecommendations.meal.recommended_meal}
                  </Text>
                  <Text style={styles.aiCardTime}>
                    {new Date(aiRecommendations.meal.timestamp?.toDate()).toLocaleDateString()}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => handleNavigation('Predictions')}
              >
                <Text style={styles.viewAllText}>View All Recommendations →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>HealthMate v1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.85,
    backgroundColor: theme.colors.card,
    elevation: 10, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  menu: {
    paddingVertical: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    width: 30,
  },
  menuText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  aiSection: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  aiSectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  aiCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  aiCardTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  aiCardText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    lineHeight: 16,
    marginBottom: 4,
  },
  aiCardTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    fontStyle: "italic",
  },
  viewAllButton: {
    marginTop: theme.spacing.sm,
    alignSelf: "flex-end",
  },
  viewAllText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  logoutButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.error,
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  logoutText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  versionText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    textAlign: "center",
  },
});

export default Sidebar;
