// screens/ProfileScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Profile Management - Coming Soon!</Text>
        <Text style={styles.description}>
          Here you'll be able to view and edit your personal information, health
          metrics, and preferences.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#ff6b6b",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default ProfileScreen;
