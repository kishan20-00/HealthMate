// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { auth, db } from "../config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState({
    needsDailyUpdate: false,
    needsWeeklyUpdate: false,
  });

  // Helper function to check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = date.toDate ? date.toDate() : new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  // Helper function to check if date is within current week
  const isThisWeek = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = date.toDate ? date.toDate() : new Date(date);

    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get end of current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return checkDate >= startOfWeek && checkDate <= endOfWeek;
  };

  // Check for pending updates when user logs in
  const checkPendingUpdates = async (currentUser) => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check daily update (weight update)
        const lastWeightUpdate = userData.lastWeightUpdate;
        const needsDailyUpdate = !isToday(lastWeightUpdate);

        // Check weekly update (lifestyle update)
        const lastLifestyleUpdate = userData.lastLifestyleUpdate;
        const needsWeeklyUpdate = !isThisWeek(lastLifestyleUpdate);

        setPendingUpdates({
          needsDailyUpdate,
          needsWeeklyUpdate,
        });
      } else {
        // New user - needs both updates
        setPendingUpdates({
          needsDailyUpdate: true,
          needsWeeklyUpdate: true,
        });
      }
    } catch (error) {
      console.error("Error checking pending updates:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Check for pending updates when user logs in
        checkPendingUpdates(user);
      } else {
        // Reset pending updates when user logs out
        setPendingUpdates({
          needsDailyUpdate: false,
          needsWeeklyUpdate: false,
        });
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Function to mark updates as completed
  const markUpdateCompleted = (updateType) => {
    setPendingUpdates(prev => ({
      ...prev,
      [updateType]: false,
    }));
  };

  // Function to refresh pending updates check
  const refreshPendingUpdates = () => {
    if (user) {
      checkPendingUpdates(user);
    }
  };

  const value = {
    user,
    logout,
    pendingUpdates,
    markUpdateCompleted,
    refreshPendingUpdates,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
