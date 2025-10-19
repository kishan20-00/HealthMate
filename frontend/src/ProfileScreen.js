// screens/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config";
import { useTheme } from "../context/ThemeContext";

const ProfileScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");

  // Calculate BMI function
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    return Math.round(bmiValue * 10) / 10;
  };

  // Get BMI category
  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue < 25) return "Normal weight";
    if (bmiValue < 30) return "Overweight";
    return "Obese";
  };

  // Get BMI category color
  const getBMIColor = (bmiValue) => {
    if (bmiValue < 18.5) return theme.colors.bmi.underweight;
    if (bmiValue < 25) return theme.colors.bmi.normal;
    if (bmiValue < 30) return theme.colors.bmi.overweight;
    return theme.colors.bmi.obese;
  };

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);

        // Calculate BMI
        const currentWeight = data.currentWeight || data.weight;
        const height = data.height;

        if (currentWeight && height) {
          const calculatedBMI = calculateBMI(currentWeight, height);
          setBmi(calculatedBMI);
          setBmiCategory(getBMICategory(calculatedBMI));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Your health information at a glance</Text>
      </View>

      {/* Profile Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.userName}>{userData.username || "User"}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* BMI Card */}
      {bmi && (
        <View style={styles.bmiCard}>
          <Text style={styles.cardTitle}>Body Mass Index (BMI)</Text>
          <View style={styles.bmiContent}>
            <View style={styles.bmiValueContainer}>
              <Text style={[styles.bmiValue, { color: getBMIColor(bmi) }]}>
                {bmi}
              </Text>
              <Text style={[styles.bmiCategory, { color: getBMIColor(bmi) }]}>
                {bmiCategory}
              </Text>
            </View>
            <View style={styles.bmiProgress}>
              <View style={styles.bmiProgressBar}>
                <View
                  style={[
                    styles.bmiProgressFill,
                    {
                      backgroundColor: getBMIColor(bmi),
                      width: `${Math.min((bmi / 40) * 100, 100)}%`
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Personal Information Cards */}
      <View style={styles.cardsContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.cardRow}>
          <View style={styles.infoCard}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardLabel}>Age</Text>
            <Text style={styles.cardValue}>{userData.age} years</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardIcon}>⚧</Text>
            <Text style={styles.cardLabel}>Gender</Text>
            <Text style={styles.cardValue}>{userData.gender}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.infoCard}>
            <Text style={styles.cardIcon}>📏</Text>
            <Text style={styles.cardLabel}>Height</Text>
            <Text style={styles.cardValue}>{userData.height} cm</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardIcon}>⚖️</Text>
            <Text style={styles.cardLabel}>Weight</Text>
            <Text style={styles.cardValue}>{userData.currentWeight || userData.weight} kg</Text>
          </View>
        </View>
      </View>

      {/* Health & Lifestyle Cards */}
      <View style={styles.cardsContainer}>
        <Text style={styles.sectionTitle}>Health & Lifestyle</Text>

        <View style={styles.cardRow}>
          <View style={styles.infoCard}>
            <Text style={styles.cardIcon}>🏃‍♂️</Text>
            <Text style={styles.cardLabel}>Activity Level</Text>
            <Text style={styles.cardValue}>{userData.activityLevel}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardIcon}>😴</Text>
            <Text style={styles.cardLabel}>Sleep</Text>
            <Text style={styles.cardValue}>{userData.sleepHours}h/night</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.infoCard}>
            <Text style={styles.cardIcon}>😰</Text>
            <Text style={styles.cardLabel}>Stress Level</Text>
            <Text style={styles.cardValue}>{userData.stressLevel}/10</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardIcon}>🚭</Text>
            <Text style={styles.cardLabel}>Smoking</Text>
            <Text style={styles.cardValue}>{userData.smokingStatus}</Text>
          </View>
        </View>
      </View>

      {/* Health Conditions */}
      {userData.healthConditions && userData.healthConditions !== "None" && (
        <View style={styles.healthCard}>
          <Text style={styles.cardTitle}>Health Conditions</Text>
          <Text style={styles.healthConditionsText}>{userData.healthConditions}</Text>
        </View>
      )}

      {/* Edit Profile Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
      </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textLight,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  userName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
  },
  bmiCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  bmiContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bmiValueContainer: {
    alignItems: "center",
  },
  bmiValue: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.bold,
  },
  bmiCategory: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    marginTop: 4,
  },
  bmiProgress: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  bmiProgressBar: {
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  bmiProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  cardsContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.small,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  cardLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: 4,
    fontWeight: theme.typography.weights.medium,
  },
  cardValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    textAlign: "center",
  },
  healthCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  healthConditionsText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: theme.colors.accent,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    ...theme.shadows.small,
  },
  editButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
});

export default ProfileScreen;
