// App.js
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity, Text } from "react-native";
import LoginScreen from "./src/login";
import SignupScreen from "./src/signup";
import HomeScreen from "./src/home";
import ProfileScreen from "./src/ProfileScreen";
import WorkoutScreen from "./src/WorkoutScreen";
import ProgressScreen from "./src/ProgressScreen";
import SettingsScreen from "./src/SettingsScreen";
import Sidebar from "./src/Sidebar";
import PredictionScreen from "./src/PredictionScreen";

const Stack = createStackNavigator();

const MainStack = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const screenOptions = {
    headerStyle: {
      backgroundColor: "#ff6b6b",
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold",
    },
    headerLeft: () =>
      user ? (
        <TouchableOpacity
          style={{ marginLeft: 15, padding: 10 }}
          onPress={toggleSidebar}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            ☰
          </Text>
        </TouchableOpacity>
      ) : null,
  };

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "HealthMate",
            headerLeft: () =>
              user ? (
                <TouchableOpacity
                  style={{ marginLeft: 15, padding: 10 }}
                  onPress={toggleSidebar}
                >
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
                  >
                    ☰
                  </Text>
                </TouchableOpacity>
              ) : null,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "My Profile" }}
        />
        <Stack.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{ title: "Workouts" }}
        />
        <Stack.Screen
          name="Progress"
          component={ProgressScreen}
          options={{ title: "Progress Tracking" }}
        />
        <Stack.Screen
          name="Predictions"
          component={PredictionScreen}
          options={{ title: "AI Recommendations" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Stack.Navigator>

      {user && (
        <Sidebar
          isVisible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          user={user}
          logout={logout}
        />
      )}
    </>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
