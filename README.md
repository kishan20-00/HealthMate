# HealthMate AI 🩺

<p align="center">
  <img src="./model/logo.png" alt="HealthMate Logo" width="150"/>
</p>

<p align="center">
  <strong>Your personalized AI-powered health and wellness companion.</strong>
</p>

---

## 🌟 Overview

HealthMate is a cross-platform mobile application designed to provide personalized health and wellness recommendations using a suite of machine learning models. The application helps users with workout routines, meal plans, and lifestyle choices to promote a healthier life.

The project consists of two main components:
-   A **React Native (Expo) frontend** for a seamless user experience on both iOS and Android.
-   A **Python (Flask) backend** that serves the machine learning models to provide intelligent, data-driven recommendations.

---

## ✨ Features

-   **🤖 AI-Powered Recommendations:** Get personalized workout, meal, and lifestyle suggestions based on your profile and goals.
-   **🏋️ Workout Planner:** Recommends optimal workout routines based on user's age, BMI, activity level, and health conditions.
-   **🥗 Meal Advisor:** Suggests meals and estimates calorie counts to align with your dietary goals (e.g., weight loss, muscle gain).
-   **🧘 Lifestyle Coach:** Provides actionable tips on improving sleep, hydration, and managing stress for better overall well-being.
-   **📱 Cross-Platform:** Built with React Native and Expo for a consistent experience on both iOS and Android devices.
-   **🔒 User Authentication:** Secure sign-up and login functionality.

---

## 🛠️ Technology Stack

| Component | Technology                                                                                             |
| :-------- | :----------------------------------------------------------------------------------------------------- |
| **Frontend**  | `React Native`, `Expo`, `React Navigation`, `JavaScript`                                               |
| **Backend**   | `Python`, `Flask`, `TensorFlow/Keras`, `Scikit-learn`, `Pandas`, `NumPy`                                 |
| **Models**    | Neural Networks (`.h5`) and classical ML models (`.pkl`) for various recommendation tasks.             |

---

## 📂 Project Structure

```
HealthMate/
├── frontend/              # React Native mobile application
│   ├── src/               # Source code for screens and components
│   ├── App.js             # Main app component
│   └── package.json       # Frontend dependencies
│
└── model/                 # Python Flask backend and ML models
    ├── app.py             # Flask server exposing API endpoints
    ├── *.h5, *.pkl        # Pre-trained machine learning models
    └── Model_Training.ipynb # Jupyter notebook for model training
```

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version) and `npm`
-   [Python 3.8+](https://www.python.org/downloads/) and `pip`
-   [Expo Go](https://expo.dev/go) app on your mobile device (for testing)

### 1. Backend Setup (`model` directory)

First, set up and run the Flask server which powers the recommendations.

```bash
# 1. Navigate to the backend directory
cd model

# 2. Create and activate a Python virtual environment
# On Windows
python -m venv venv
venv\Scripts\activate
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# 3. Install the required Python packages
# Note: A requirements.txt file is not provided. Install the core packages:
pip install Flask pandas numpy joblib tensorflow scikit-learn

# 4. Run the Flask server
python app.py
```

The backend server will start on `http://localhost:5000`.

### 2. Frontend Setup (`frontend` directory)

Next, set up and run the React Native mobile application.

```bash
# 1. In a new terminal, navigate to the frontend directory
cd frontend

# 2. Install npm dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

This will open the Expo developer tools in your browser. You can then:
-   Scan the QR code with the Expo Go app on your iOS or Android device.
-   Press `a` to run on an Android emulator.
-   Press `i` to run on an iOS simulator.

---

## 📡 API Endpoints

The backend provides the following RESTful API endpoints:

#### `POST /api/workout`
Receives user data and returns a personalized workout recommendation.
-   **Body (JSON):**
    ```json
    {
        "age": 30,
        "gender": "Male",
        "bmi": 22.5,
        "activity_level": "Moderate",
        "health_condition": "None",
        "duration_minutes": 60,
        "calories_burned": 300
    }
    ```

#### `POST /api/lifestyle`
Receives user data and returns a personalized lifestyle tip.
-   **Body (JSON):**
    ```json
    {
        "age": 30,
        "gender": "Female",
        "sleep_hours": 6,
        "recommended_sleep": 8,
        "water_intake_liters": 1.5,
        "stress_level": "High",
        "screen_time_hours": 5
    }
    ```

#### `POST /api/meal`
Receives user data and returns a personalized meal recommendation.
-   **Body (JSON):**
    ```json
    {
        "age": 30,
        "gender": "Male",
        "bmi_status": "Normal",
        "goal": "Weight Loss",
        "meal_type": "Lunch"
    }
    ```

#### `GET /api/health`
A health check endpoint to verify that the models are loaded and the server is running.

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, please open an issue or submit a pull request.

1.  **Fork** the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
