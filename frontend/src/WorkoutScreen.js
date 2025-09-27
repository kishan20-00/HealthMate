// screens/WorkoutScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const WorkoutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Workout Plans - Coming Soon!</Text>
        <Text style={styles.description}>
          Access personalized workout routines, track your exercises, and follow
          guided training programs.
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

export default WorkoutScreen;
