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

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
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
    if (bmiValue < 18.5) return "#ffa726"; // Orange for underweight
    if (bmiValue < 25) return "#4caf50"; // Green for normal
    if (bmiValue < 30) return "#ff9800"; // Orange for overweight
    return "#f44336"; // Red for obese
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
      checkForUpdates();
      fetchUserData();
    }
  }, [user]);

  const checkForUpdates = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const now = new Date();

        // Check daily weight update (after 24 hours)
        const lastWeightUpdate = data.lastWeightUpdate?.toDate();
        const needsWeightUpdate =
          !lastWeightUpdate || now - lastWeightUpdate > 24 * 60 * 60 * 1000; // 24 hours

        // Check weekly lifestyle update (after 7 days)
        const lastLifestyleUpdate = data.lastLifestyleUpdate?.toDate();
        const needsLifestyleUpdate =
          !lastLifestyleUpdate ||
          now - lastLifestyleUpdate > 7 * 24 * 60 * 60 * 1000; // 7 days

        // Show modals with delay to avoid overwhelming the user
        setTimeout(() => {
          if (needsWeightUpdate) {
            setShowWeightModal(true);
          } else if (needsLifestyleUpdate) {
            setShowLifestyleModal(true);
          }
        }, 2000); // Show after 2 seconds
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
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
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back! 🏋️‍♂️</Text>
          {userData && (
            <Text style={styles.userInfo}>
              {userData.username} • {userData.age}y • {userData.gender}
            </Text>
          )}
        </View>

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
                  style={[styles.bmiIndicator, { backgroundColor: "#ffa726" }]}
                />
                <Text style={styles.bmiScaleText}>Underweight: {"<"}18.5</Text>
              </View>
              <View style={styles.bmiScaleItem}>
                <View
                  style={[styles.bmiIndicator, { backgroundColor: "#4caf50" }]}
                />
                <Text style={styles.bmiScaleText}>Normal: 18.5-24.9</Text>
              </View>
              <View style={styles.bmiScaleItem}>
                <View
                  style={[styles.bmiIndicator, { backgroundColor: "#ff9800" }]}
                />
                <Text style={styles.bmiScaleText}>Overweight: 25-29.9</Text>
              </View>
              <View style={styles.bmiScaleItem}>
                <View
                  style={[styles.bmiIndicator, { backgroundColor: "#f44336" }]}
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
        onClose={() => {
          setShowWeightModal(false);
          fetchUserData();
        }}
      />

      <WeeklyLifestyleModal
        visible={showLifestyleModal}
        onClose={() => {
          setShowLifestyleModal(false);
          fetchUserData();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#ff6b6b",
    padding: 30,
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  welcome: {
    fontSize: 18,
    color: "white",
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    flexWrap: "wrap",
  },
  statCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 100,
    margin: 5,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  bmiCategory: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  bmiInfoCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bmiInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
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
    color: "#666",
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  actionButton: {
    backgroundColor: "#4ecdc4",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfoCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#ff4757",
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuButton: {
    marginLeft: 15,
    padding: 10,
  },
  menuIcon: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
});

export default HomeScreen;
