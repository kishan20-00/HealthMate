// components/CustomDrawerContent.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useAuth } from "../context/AuthContext";

const CustomDrawerContent = (props) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || user?.email?.split("@")[0] || "User"}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Navigation Items */}
        <View style={styles.drawerSection}>
          <DrawerItemList {...props} />
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Linking.openURL("mailto:support@healthmate.com")}
          >
            <Text style={styles.supportButtonText}>📧 Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Linking.openURL("https://healthmate.com/help")}
          >
            <Text style={styles.supportButtonText}>❓ Help & FAQ</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>HealthMate v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#ff6b6b",
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  drawerSection: {
    marginTop: 10,
  },
  supportSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 15,
  },
  supportButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    marginBottom: 10,
  },
  supportButtonText: {
    fontSize: 14,
    color: "#333",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#ff4757",
    alignItems: "center",
    marginBottom: 10,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});

export default CustomDrawerContent;
