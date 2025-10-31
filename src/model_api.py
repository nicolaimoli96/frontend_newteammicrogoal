import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('src/category_sales_predictor.joblib')

# Get the category columns from the model training (assume saved in joblib or hardcode for now)
CATEGORY_COLUMNS = ['Dips', 'Dessert', 'Drinks', 'Glass of Wine']  # Update if your model has different categories

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    day_of_week = int(data['day_of_week'])
    hour = int(data['hour'])
    weather = data['weather']  # 'rain', 'cloud', 'wind', 'sunny'

    # One-hot encode weather
    weather_features = {
        'weather_rain': 1 if weather == 'rain' else 0,
        'weather_cloud': 1 if weather == 'cloud' else 0,
        'weather_wind': 1 if weather == 'wind' else 0,
        'weather_sunny': 1 if weather == 'sunny' else 0,
    }
    features = {
        'day_of_week': day_of_week,
        'hour': hour,
        **weather_features
    }
    X = pd.DataFrame([features])
    preds = model.predict(X)[0]
    best_idx = preds.argmax()
    best_category = CATEGORY_COLUMNS[best_idx]
    best_qty = int(round(preds[best_idx] * 1.1))
    return jsonify({'category': best_category, 'quantity': best_qty})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 