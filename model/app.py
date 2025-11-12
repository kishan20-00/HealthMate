# app.py
from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import joblib
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import StandardScaler, LabelEncoder
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

# Load all models and encoders
def load_models():
    """Load all models and encoders"""
    models = {}
    
    try:
        # Workout Recommendation Model
        models['workout'] = {
            'model': keras.models.load_model('best_workout_model.h5', compile=False),
            'scaler': joblib.load('scaler.pkl'),
            'encoders': joblib.load('encoders.pkl')
        }
        print("✓ Workout model loaded successfully")
    except Exception as e:
        print(f"✗ Workout model loading failed: {e}")
        models['workout'] = None
    
    try:
        # Lifestyle Recommendation Model
        models['lifestyle'] = {
            'model': keras.models.load_model('lifestyle_nn_model.h5', compile=False),
            'scaler': joblib.load('lifestyle_scaler.pkl'),
            'encoders': joblib.load('lifestyle_encoders.pkl')
        }
        print("✓ Lifestyle model loaded successfully")
    except Exception as e:
        print(f"✗ Lifestyle model loading failed: {e}")
        models['lifestyle'] = None
    
    try:
        # Meal Plan Model
        models['meal'] = {
            'feature_encoder': joblib.load('meal_feature_encoder.pkl'),
            'scaler': joblib.load('meal_scaler.pkl'),
            'encoders': joblib.load('meal_encoders.pkl'),
            'meal_model': joblib.load('meal_items_model.pkl'),
            'calories_model': joblib.load('calories_model.pkl')
        }
        print("✓ Meal plan model loaded successfully")
    except Exception as e:
        print(f"✗ Meal plan model loading failed: {e}")
        models['meal'] = None
    
    return models

# Initialize models
MODELS = load_models()

# Prediction functions for each model
def predict_workout(user_data):
    """Predict workout recommendation"""
    if MODELS['workout'] is None:
        return {"error": "Workout model not available"}
    
    try:
        # Prepare input data
        input_data = pd.DataFrame([user_data])
        
        # Encode categorical variables
        encoders = MODELS['workout']['encoders']
        for col in ['gender', 'activity_level', 'health_condition']:
            if user_data[col] in encoders[col].classes_:
                input_data[col] = encoders[col].transform([user_data[col]])[0]
            else:
                input_data[col] = encoders[col].transform([encoders[col].classes_[0]])[0]
        
        # Scale numerical features
        numerical_cols = ['age', 'bmi', 'duration_minutes', 'calories_burned']
        input_data[numerical_cols] = MODELS['workout']['scaler'].transform(input_data[numerical_cols])
        
        # Make prediction
        prediction_proba = MODELS['workout']['model'].predict(input_data)
        prediction_idx = np.argmax(prediction_proba, axis=1)
        predicted_workout = encoders['recommended_workout'].inverse_transform(prediction_idx)[0]
        confidence = float(np.max(prediction_proba))
        
        # Get top 3 recommendations
        top3_indices = np.argsort(prediction_proba[0])[-3:][::-1]
        top3_recommendations = [
            {
                'workout': encoders['recommended_workout'].inverse_transform([idx])[0],
                'confidence': float(prediction_proba[0][idx])
            }
            for idx in top3_indices
        ]
        
        return {
            'recommended_workout': predicted_workout,
            'confidence': confidence,
            'top_recommendations': top3_recommendations,
            'status': 'success'
        }
        
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}", "status": "error"}

def predict_lifestyle(user_data):
    """Predict lifestyle recommendation"""
    if MODELS['lifestyle'] is None:
        return {"error": "Lifestyle model not available"}
    
    try:
        # Prepare input data
        input_df = pd.DataFrame([user_data])
        
        # Feature engineering
        recommended_water = 2.0
        input_df['sleep_deficit'] = input_df['recommended_sleep'] - input_df['sleep_hours']
        input_df['sleep_ratio'] = input_df['sleep_hours'] / input_df['recommended_sleep']
        input_df['water_deficit'] = recommended_water - input_df['water_intake_liters']
        
        # Encode categorical variables
        encoders = MODELS['lifestyle']['encoders']
        scaler = MODELS['lifestyle']['scaler']
        
        # One-hot encode gender
        gender_encoded = encoders['gender'].transform(input_df[['gender']])
        gender_df = pd.DataFrame(gender_encoded, 
                               columns=encoders['gender'].get_feature_names_out(['gender']))
        
        # Encode stress level
        if user_data['stress_level'] in encoders['stress_level'].classes_:
            input_df['stress_level_encoded'] = encoders['stress_level'].transform(
                [user_data['stress_level']])[0]
        else:
            input_df['stress_level_encoded'] = encoders['stress_level'].transform(['Moderate'])[0]
        
        # Prepare final input
        feature_cols = ['age', 'sleep_hours', 'recommended_sleep', 'water_intake_liters', 
                       'screen_time_hours', 'sleep_deficit', 'sleep_ratio', 'water_deficit',
                       'stress_level_encoded'] + list(gender_df.columns)
        
        final_input = pd.concat([
            input_df[['age', 'sleep_hours', 'recommended_sleep', 'water_intake_liters', 
                     'screen_time_hours', 'sleep_deficit', 'sleep_ratio', 'water_deficit',
                     'stress_level_encoded']],
            gender_df
        ], axis=1)
        
        # Scale features
        scaled_input = scaler.transform(final_input)
        
        # Make prediction
        prediction_proba = MODELS['lifestyle']['model'].predict(scaled_input)
        prediction_idx = np.argmax(prediction_proba, axis=1)
        predicted_recommendation = encoders['recommendation'].inverse_transform(prediction_idx)[0]
        confidence = float(np.max(prediction_proba))
        
        # Get top 3 recommendations
        top3_indices = np.argsort(prediction_proba[0])[-3:][::-1]
        top3_recommendations = [
            {
                'recommendation': encoders['recommendation'].inverse_transform([idx])[0],
                'confidence': float(prediction_proba[0][idx])
            }
            for idx in top3_indices
        ]
        
        return {
            'recommendation': predicted_recommendation,
            'confidence': confidence,
            'top_recommendations': top3_recommendations,
            'status': 'success'
        }
        
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}", "status": "error"}

def predict_meal_plan(user_data):
    """Predict meal plan"""
    if MODELS['meal'] is None:
        return {"error": "Meal plan model not available"}
    
    try:
        # Prepare input data
        input_df = pd.DataFrame([user_data])
        
        # Transform input
        feature_encoder = MODELS['meal']['feature_encoder']
        scaler = MODELS['meal']['scaler']
        encoders = MODELS['meal']['encoders']
        
        input_encoded = feature_encoder.transform(input_df)
        input_scaled = scaler.transform(input_encoded)
        
        # Make predictions using separate models
        meal_model = MODELS['meal']['meal_model']
        calories_model = MODELS['meal']['calories_model']
        
        meal_pred = meal_model.predict(input_scaled)
        meal_pred_proba = meal_model.predict_proba(input_scaled)
        confidence = float(np.max(meal_pred_proba))
        calories_pred = calories_model.predict(input_scaled)
        
        # Decode predictions
        predicted_meal = encoders['meal_items'].inverse_transform(meal_pred)[0]
        predicted_calories = float(calories_pred[0])
        
        # Get top 3 meal recommendations
        top3_indices = np.argsort(meal_pred_proba[0])[-3:][::-1]
        top3_meals = [
            {
                'meal': encoders['meal_items'].inverse_transform([idx])[0],
                'confidence': float(meal_pred_proba[0][idx]),
                'estimated_calories': float(calories_model.predict(input_scaled)[0])
            }
            for idx in top3_indices
        ]
        
        return {
            'recommended_meal': predicted_meal,
            'estimated_calories': predicted_calories,
            'confidence': confidence,
            'top_recommendations': top3_meals,
            'status': 'success'
        }
        
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}", "status": "error"}

# Routes
@app.route('/')
def home():
    """Home page with API documentation"""
    return render_template('index.html')

@app.route('/api/workout', methods=['POST'])
def workout_recommendation():
    """Workout recommendation endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['age', 'gender', 'bmi', 'activity_level', 'health_condition', 
                          'duration_minutes', 'calories_burned']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}", "status": "error"}), 400
        
        result = predict_workout(data)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}", "status": "error"}), 500

@app.route('/api/lifestyle', methods=['POST'])
def lifestyle_recommendation():
    """Lifestyle recommendation endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['age', 'gender', 'sleep_hours', 'recommended_sleep', 
                          'water_intake_liters', 'stress_level', 'screen_time_hours']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}", "status": "error"}), 400
        
        result = predict_lifestyle(data)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}", "status": "error"}), 500

@app.route('/api/meal', methods=['POST'])
def meal_recommendation():
    """Meal recommendation endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['age', 'gender', 'bmi_status', 'goal', 'meal_type']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}", "status": "error"}), 400
        
        result = predict_meal_plan(data)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}", "status": "error"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = {
        'workout_model': MODELS['workout'] is not None,
        'lifestyle_model': MODELS['lifestyle'] is not None,
        'meal_model': MODELS['meal'] is not None,
        'status': 'healthy'
    }
    return jsonify(status)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found", "status": "error"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error", "status": "error"}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Available endpoints:")
    print("  - POST /api/workout")
    print("  - POST /api/lifestyle") 
    print("  - POST /api/meal")
    print("  - GET  /api/health")
    print("  - GET  / (documentation)")
    
    app.run(debug=True, host='0.0.0.0', port=5000)