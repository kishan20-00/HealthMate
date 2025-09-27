// src/services/api.js
const BASE_URL = "http://192.168.11.3:5000"; // Change to your deployed URL when ready

export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },

  // Workout recommendation
  async getWorkoutRecommendation(userData) {
    try {
      const response = await fetch(`${BASE_URL}/api/workout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error("Workout recommendation failed:", error);
      throw error;
    }
  },

  // Lifestyle recommendation
  async getLifestyleRecommendation(userData) {
    try {
      const response = await fetch(`${BASE_URL}/api/lifestyle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error("Lifestyle recommendation failed:", error);
      throw error;
    }
  },

  // Meal recommendation
  async getMealRecommendation(userData) {
    try {
      const response = await fetch(`${BASE_URL}/api/meal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error("Meal recommendation failed:", error);
      throw error;
    }
  },
};
