// screens/LoginScreen.js
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
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config";
import { useTheme } from "../context/ThemeContext";
import { AnimatedView, Card, Button, Heading, BodyText, Caption } from "./components";

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by AuthContext
    } catch (error) {
      let errorMessage = "Failed to login. Please try again.";

      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
      }

      Alert.alert("Login Error", errorMessage);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AnimatedView style={styles.content} animation="fadeIn" duration={600}>
        <AnimatedView animation="slideInDown" delay={200}>
          <Heading level={1} style={styles.title}>HealthMate</Heading>
          <BodyText style={styles.subtitle}>Welcome back to your health journey</BodyText>
        </AnimatedView>

        <Card
          style={styles.formCard}
          animated={true}
          animation="slideInUp"
          delay={400}
          shadow="medium"
        >
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            variant="primary"
            size="large"
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          >
            {loading ? "Logging in..." : "Sign In"}
          </Button>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate("Signup")}
          >
            <Caption style={styles.linkText}>
              Don't have an account? <Caption style={styles.linkTextBold}>Sign Up</Caption>
            </Caption>
          </TouchableOpacity>
        </Card>
      </AnimatedView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  formCard: {
    width: "100%",
    marginTop: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  loginButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  linkButton: {
    alignItems: "center",
  },
  linkText: {
    color: theme.colors.textLight,
    textAlign: "center",
  },
  linkTextBold: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },
});

export default LoginScreen;
