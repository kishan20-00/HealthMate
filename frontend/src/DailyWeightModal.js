// components/DailyWeightModal.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../config";
import { useAuth } from "../context/AuthContext";

const DailyWeightModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastWeight, setLastWeight] = useState(null);

  useEffect(() => {
    if (visible && user) {
      fetchLastWeight();
    }
  }, [visible, user]);

  const fetchLastWeight = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const weightHistory = userData.weightHistory || [];
        if (weightHistory.length > 0) {
          setLastWeight(weightHistory[weightHistory.length - 1].weight);
        }
      }
    } catch (error) {
      console.error("Error fetching last weight:", error);
    }
  };

  const handleWeightSubmit = async () => {
    if (!weight || isNaN(weight) || weight < 30 || weight > 300) {
      Alert.alert("Error", "Please enter a valid weight (30-300 kg)");
      return;
    }

    setLoading(true);
    try {
      const weightData = {
        weight: parseInt(weight),
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        timestamp: new Date(),
      };

      await updateDoc(doc(db, "users", user.uid), {
        currentWeight: parseInt(weight),
        weightHistory: arrayUnion(weightData),
        lastWeightUpdate: new Date(),
      });

      Alert.alert("Success", "Weight updated successfully!");
      setWeight("");
      onClose();
    } catch (error) {
      console.error("Error updating weight:", error);
      Alert.alert("Error", "Failed to update weight. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Daily Weight Update</Text>

          {lastWeight && (
            <Text style={styles.lastWeight}>
              Last recorded weight: {lastWeight} kg
            </Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Enter today's weight (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleWeightSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Updating..." : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  lastWeight: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  submitButton: {
    backgroundColor: "#4ecdc4",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default DailyWeightModal;
