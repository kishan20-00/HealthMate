import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Add this import

const { width } = Dimensions.get("window");

const Sidebar = ({ isVisible, onClose, user, logout }) => {
  const navigation = useNavigation(); // Use the hook here
  const translateX = new Animated.Value(-width);

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const menuItems = [
    { name: "Home", icon: "🏠", screen: "Home" },
    { name: "AI Recommendations", icon: "🤖", screen: "Predictions" }, // Add this
    { name: "Profile", icon: "👤", screen: "Profile" },
    { name: "Workouts", icon: "💪", screen: "Workout" },
    { name: "Progress", icon: "📊", screen: "Progress" },
    { name: "Settings", icon: "⚙️", screen: "Settings" },
  ];

  const handleNavigation = (screen) => {
    onClose();
    navigation.navigate(screen); // Use navigation from hook
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  if (!isVisible) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      />
      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        {/* Header */}
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>HealthMate v1.0.0</Text>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: "white",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    backgroundColor: "#ff6b6b",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
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
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  menu: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
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
  logoutText: {
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

export default Sidebar;
