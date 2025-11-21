// screens/SignupScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config";

const { width } = Dimensions.get("window");

const SignupScreen = ({ navigation }) => {
  // Basic info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  // Physical metrics
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");

  // Lifestyle inputs
  const [activityLevel, setActivityLevel] = useState("Low");
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState("5");
  const [smokingStatus, setSmokingStatus] = useState("Never");
  const [alcoholUse, setAlcoholUse] = useState("No");
  const [healthConditions, setHealthConditions] = useState("None");

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSignup = async () => {
    if (!validateAllFields()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        createdAt: new Date(),
        height: parseInt(height),
        weight: parseInt(weight),
        age: parseInt(age),
        gender: gender,
        activityLevel: activityLevel,
        sleepHours: parseInt(sleepHours),
        stressLevel: parseInt(stressLevel),
        smokingStatus: smokingStatus,
        alcoholUse: alcoholUse,
        healthConditions: healthConditions,
        weightHistory: [
          {
            weight: parseInt(weight),
            date: new Date(),
            timestamp: new Date(),
          },
        ],
        lifestyleUpdates: [
          {
            activityLevel: activityLevel,
            sleepHours: parseInt(sleepHours),
            stressLevel: parseInt(stressLevel),
            smokingStatus: smokingStatus,
            alcoholUse: alcoholUse,
            date: new Date(),
            timestamp: new Date(),
          },
        ],
        fitnessLevel: "beginner",
        goals: [],
        workoutsCompleted: 0,
        lastWeightUpdate: new Date(),
        lastLifestyleUpdate: new Date(),
        currentWeight: parseInt(weight),
      });

    } catch (error) {
      console.error("Signup Error:", error);
      Alert.alert(
        "Signup Error",
        "Failed to create account. Please try again."
      );
    }
    setLoading(false);
  };

  const validateAllFields = () => {
    if (currentStep === 1) {
      if (!email || !password || !confirmPassword || !username) {
        Alert.alert("Error", "Please fill in all basic information fields");
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return false;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password should be at least 6 characters");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!height || !weight || !age) {
        Alert.alert("Error", "Please fill in all physical metrics");
        return false;
      }
      if (isNaN(height) || height < 100 || height > 250) {
        Alert.alert("Error", "Please enter a valid height (100-250 cm)");
        return false;
      }
      if (isNaN(weight) || weight < 30 || weight > 300) {
        Alert.alert("Error", "Please enter a valid weight (30-300 kg)");
        return false;
      }
      if (isNaN(age) || age < 13 || age > 120) {
        Alert.alert("Error", "Please enter a valid age (13-120 years)");
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (!sleepHours) {
        Alert.alert("Error", "Please enter your average sleep hours");
        return false;
      }
      if (isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
        Alert.alert("Error", "Please enter valid sleep hours (0-24)");
        return false;
      }
      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (validateAllFields()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Custom Picker Component for better UX
  const CustomPicker = ({ selectedValue, onValueChange, items, label }) => (
    <View style={styles.customPickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.customPicker}
          dropdownIconColor="#4ecdc4"
          mode="dropdown"
        >
          {items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min. 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
        <Text style={styles.nextButtonText}>Next: Physical Metrics</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Physical Metrics</Text>

      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Age (years)"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <View style={styles.formGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
            label="Gender"
          >
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>Next: Lifestyle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Lifestyle Information</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Activity Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={activityLevel}
            onValueChange={(itemValue, itemIndex) =>
              setActivityLevel(itemValue)
            }
            label="Activity Level"
          >
            <Picker.Item label="Low" value="Low" />
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
            onValueChange={(itemValue, itemIndex) => setStressLevel(itemValue)}
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
            onValueChange={(itemValue, itemIndex) => setAlcoholUse(itemValue)}
            label="Alcohol Use"
          >
            <Picker.Item label="No" value="No" />
            <Picker.Item label="Yes" value="Yes" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Health Conditions</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={healthConditions}
            onValueChange={(itemValue, itemIndex) => setHealthConditions(itemValue)}
            label="Health Conditions"
          >
            <Picker.Item label="None" value="None" />
            <Picker.Item label="Obesity" value="Obesity" />
            <Picker.Item label="Hypertension" value="Hypertension" />
            <Picker.Item label="Asthma" value="Asthma" />
            <Picker.Item label="Diabetes" value="Diabetes" />
          </Picker>
        </View>
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "Complete Signup"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Fitness Vibe</Text>
        <Text style={styles.subtitle}>Step {currentStep} of 3</Text>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  stepContainer: {
    width: "100%",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 5,
  },
  // Custom Picker Styles
  customPickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 5,
  },
  pickerWrapper: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  customPicker: {
    height: 50,
    width: "100%",
  },
  stepButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  nextButton: {
    backgroundColor: "#4ecdc4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#95a5a6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4ecdc4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 30,
    alignItems: "center",
  },
  linkText: {
    color: "#4ecdc4",
    fontSize: 14,
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    marginLeft: 5,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
});

export default SignupScreen;
