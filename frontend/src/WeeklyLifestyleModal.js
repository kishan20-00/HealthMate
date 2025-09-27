// components/WeeklyLifestyleModal.js
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../config";
import { useAuth } from "../context/AuthContext";
import { Picker } from "@react-native-picker/picker";

const WeeklyLifestyleModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [activityLevel, setActivityLevel] = useState("Medium");
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState("5");
  const [smokingStatus, setSmokingStatus] = useState("Never");
  const [alcoholUse, setAlcoholUse] = useState("No");
  const [loading, setLoading] = useState(false);

  const handleLifestyleSubmit = async () => {
    if (!sleepHours || isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
      Alert.alert("Error", "Please enter valid sleep hours (0-24)");
      return;
    }

    setLoading(true);
    try {
      const lifestyleData = {
        activityLevel,
        sleepHours: parseInt(sleepHours),
        stressLevel: parseInt(stressLevel),
        smokingStatus,
        alcoholUse,
        date: new Date().toISOString().split("T")[0],
        timestamp: new Date(),
      };

      await updateDoc(doc(db, "users", user.uid), {
        activityLevel,
        sleepHours: parseInt(sleepHours),
        stressLevel: parseInt(stressLevel),
        smokingStatus,
        alcoholUse,
        lifestyleUpdates: arrayUnion(lifestyleData),
        lastLifestyleUpdate: new Date(),
      });

      Alert.alert("Success", "Lifestyle information updated!");
      setSleepHours("");
      onClose();
    } catch (error) {
      console.error("Error updating lifestyle:", error);
      Alert.alert("Error", "Failed to update information. Please try again.");
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
          <Text style={styles.modalTitle}>Weekly Lifestyle Check-in</Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Activity Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={activityLevel}
                  onValueChange={(itemValue, itemIndex) =>
                    setActivityLevel(itemValue)
                  }
                  label="Activity Level"
                  itemStyle={styles.pickerLabel}
                >
                  <Picker.Item
                    label="Low"
                    value="Low"
                    style={styles.pickerLabel}
                  />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="High" value="High" />
                </Picker>
              </View>
            </View>

            <Text style={styles.label}>Average Sleep Hours per Day</Text>
            <TextInput
              style={styles.input}
              placeholder="1-24 hours"
              value={sleepHours}
              onChangeText={setSleepHours}
              keyboardType="numeric"
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Stress Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={stressLevel}
                  onValueChange={(itemValue, itemIndex) =>
                    setStressLevel(itemValue)
                  }
                  itemStyle={styles.pickerLabel}
                  label="stressLevel"
                >
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                  <Picker.Item label="3" value="3" />
                  <Picker.Item label="4" value="4" />
                  <Picker.Item label="5" value="5" />
                  <Picker.Item label="6" value="6" />
                  <Picker.Item label="7" value="7" />
                  <Picker.Item label="8" value="8" />
                  <Picker.Item label="9" value="9" />
                  <Picker.Item label="10" value="10" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Smoking Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={smokingStatus}
                  onValueChange={(itemValue, itemIndex) =>
                    setSmokingStatus(itemValue)
                  }
                  itemStyle={styles.pickerLabel}
                  label="Smoking Status"
                >
                  <Picker.Item label="Never" value="Never" />
                  <Picker.Item label="Former" value="Former" />
                  <Picker.Item label="Current" value="Current" />
                </Picker>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Alcohol Use</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={alcoholUse}
                  onValueChange={(itemValue, itemIndex) =>
                    setAlcoholUse(itemValue)
                  }
                  label="Alcohol Use"
                  itemStyle={styles.pickerLabel}
                >
                  <Picker.Item label="No" value="No" />
                  <Picker.Item label="Yes" value="Yes" />
                </Picker>
              </View>
            </View>
          </ScrollView>

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
              onPress={handleLifestyleSubmit}
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
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  scrollView: {
    maxHeight: 400,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    marginLeft: 5,
  },
  picker: {
    height: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
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
  pickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default WeeklyLifestyleModal;
