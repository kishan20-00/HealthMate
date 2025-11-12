# test_api.py
import requests
import json

BASE_URL = "http://localhost:5000"

def test_workout():
    """Test workout recommendation"""
    data = {
        "age": 25,
        "gender": "Male",
        "bmi": 22.5,
        "activity_level": "Medium",
        "health_condition": "None",
        "duration_minutes": 45,
        "calories_burned": 300
    }
    
    response = requests.post(f"{BASE_URL}/api/workout", json=data)
    print("Workout Response:", response.json())
    return response.json()

def test_lifestyle():
    """Test lifestyle recommendation"""
    data = {
        "age": 30,
        "gender": "Female",
        "sleep_hours": 6.5,
        "recommended_sleep": 8.0,
        "water_intake_liters": 1.8,
        "stress_level": "Moderate",
        "screen_time_hours": 5.2
    }
    
    response = requests.post(f"{BASE_URL}/api/lifestyle", json=data)
    print("Lifestyle Response:", response.json())
    return response.json()

def test_meal():
    """Test meal recommendation"""
    data = {
        "age": 28,
        "gender": "Female",
        "bmi_status": "Normal",
        "goal": "Maintenance",
        "meal_type": "Lunch"
    }
    
    response = requests.post(f"{BASE_URL}/api/meal", json=data)
    print("Meal Response:", response.json())
    return response.json()

def test_health():
    """Test health check"""
    response = requests.get(f"{BASE_URL}/api/health")
    print("Health Check:", response.json())
    return response.json()

if __name__ == "__main__":
    print("Testing API endpoints...")
    test_health()
    test_workout()
    test_lifestyle()
    test_meal()