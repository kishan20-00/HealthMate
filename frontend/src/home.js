import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config";
import DailyWeightModal from "./DailyWeightModal";
import WeeklyLifestyleModal from "./WeeklyLifestyleModal";
import { DrawerActions } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { AnimatedWelcomeSection } from "./components";

const HomeScreen = ({ navigation }) => {
  const { user, logout, pendingUpdates, markUpdateCompleted } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [userData, setUserData] = useState(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showLifestyleModal, setShowLifestyleModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");

  // Calculate BMI function
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;

    // Convert height from cm to meters
    const heightInMeters = height / 100;

    // BMI formula: weight (kg) / height (m)²
    const bmiValue = weight / (heightInMeters * heightInMeters);

    // Round to 1 decimal place
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

        // Calculate BMI whenever user data is fetched
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
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Handle automatic modal triggering based on pending updates
  useEffect(() => {
    if (pendingUpdates.needsDailyUpdate || pendingUpdates.needsWeeklyUpdate) {
      // Add a small delay to ensure the home screen is fully loaded
      const timer = setTimeout(() => {
        if (pendingUpdates.needsDailyUpdate) {
          setShowWeightModal(true);
        } else if (pendingUpdates.needsWeeklyUpdate) {
          setShowLifestyleModal(true);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [pendingUpdates]);

  // Handle modal close and check for next pending update
  const handleWeightModalClose = () => {
    setShowWeightModal(false);
    markUpdateCompleted('needsDailyUpdate');
    fetchUserData();

    // Check if weekly update is also needed
    if (pendingUpdates.needsWeeklyUpdate) {
      setTimeout(() => {
        setShowLifestyleModal(true);
      }, 500);
    }
  };

  const handleLifestyleModalClose = () => {
    setShowLifestyleModal(false);
    markUpdateCompleted('needsWeeklyUpdate');
    fetchUserData();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ff6b6b"]}
            tintColor="#ff6b6b"
          />
        }
      >
        <AnimatedWelcomeSection
          userName={userData?.username}
          userAge={userData?.age}
          userGender={userData?.gender}
        />

        {userData && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userData.currentWeight || userData.weight}
              </Text>
              <Text style={styles.statLabel}>Current Weight (kg)</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.height}</Text>
              <Text style={styles.statLabel}>Height (cm)</Text>
            </View>

            {bmi && (
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: getBMIColor(bmi) }]}>
                  {bmi}
                </Text>
                <Text style={styles.statLabel}>BMI</Text>
                <Text style={[styles.bmiCategory, { color: getBMIColor(bmi) }]}>
                  {bmiCategory}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* BMI Information Card */}
        {bmi && (
          <View style={styles.bmiInfoCard}>
            <Text style={styles.bmiInfoTitle}>BMI Information</Text>
            <View style={styles.bmiScale}>
              <View style={styles.bmiScaleItem}>
                <View
                  style={[styles.bmiIndicator, { backgroundColor: theme.colors.bmi.underweight }]}
                />
                <Text style={styles.bmiScaleText}>Underweight: {"<"}18.5</Text>
              </View>
              <View style={styles.bmiScaleItem}>
                <View
                  style={[styles.bmiIndicator, { backgroundColor: theme.colors.bmi.normal }]}
                />
                <Text style={styles.bmiScaleText}>Normal: 18.5-24.9</Text>
              </View>
              <View style={styles.bmiScaleItem}>
                <View
                  style={[styles.bmiIndicator, { backgroundColor: theme.colors.bmi.overweight }]}
                />
                <Text style={styles.bmiScaleText}>Overweight: 25-29.9</Text>
              </View>
              <View style={styles.bmiScaleItem}>
                <View
                  style={[styles.bmiIndicator, { backgroundColor: theme.colors.bmi.obese }]}
                />
                <Text style={styles.bmiScaleText}>Obese: 30+</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowWeightModal(true)}
          >
            <Text style={styles.actionText}>Update Today's Weight</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowLifestyleModal(true)}
          >
            <Text style={styles.actionText}>Weekly Lifestyle Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Start Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
            <Text style={styles.actionText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>

        {/* Additional User Info */}
        {userData && (
          <View style={styles.userInfoCard}>
            <Text style={styles.sectionTitle}>Your Profile</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Activity Level</Text>
                <Text style={styles.infoValue}>{userData.activityLevel}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sleep Hours</Text>
                <Text style={styles.infoValue}>{userData.sleepHours}h/day</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Stress Level</Text>
                <Text style={styles.infoValue}>{userData.stressLevel}/10</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Smoking</Text>
                <Text style={styles.infoValue}>{userData.smokingStatus}</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <DailyWeightModal
        visible={showWeightModal}
        onClose={handleWeightModalClose}
      />

      <WeeklyLifestyleModal
        visible={showLifestyleModal}
        onClose={handleLifestyleModalClose}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 30,
    alignItems: "center",
    paddingTop: 50,
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 5,
  },
  welcome: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 5,
    fontWeight: "600",
  },
  userInfo: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    flexWrap: "wrap",
  },
  statCard: {
    backgroundColor: theme.colors.card,
    padding: 18,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    minWidth: 100,
    margin: 5,
    flex: 1,
    ...theme.shadows.small,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 5,
    textAlign: "center",
    fontWeight: "500",
  },
  bmiCategory: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  bmiInfoCard: {
    backgroundColor: theme.colors.card,
    margin: 20,
    padding: 18,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  bmiInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: theme.colors.text,
  },
  bmiScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  bmiScaleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "48%",
  },
  bmiIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  bmiScaleText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: theme.colors.text,
  },
  actionButton: {
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 12,
    alignItems: "center",
    ...theme.shadows.small,
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  userInfoCard: {
    backgroundColor: theme.colors.card,
    margin: 20,
    padding: 18,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%",
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    padding: 16,
    margin: 20,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    ...theme.shadows.small,
  },
  logoutText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  menuButton: {
    marginLeft: 15,
    padding: 10,
  },
  menuIcon: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: "bold",
  },
});

export default HomeScreen;
