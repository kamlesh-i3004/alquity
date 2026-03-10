
import os
import numpy as np
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import joblib

SEQUENCE_LENGTH = 60

def create_model():
    """Create LSTM model architecture."""
    model = Sequential([
        LSTM(units=50, return_sequences=True, input_shape=(SEQUENCE_LENGTH, 1)),
        Dropout(0.2),
        LSTM(units=50, return_sequences=False),
        Dropout(0.2),
        Dense(units=25),
        Dense(units=1)
    ])

    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
    return model

def load_trained_model():
    """Load trained LSTM model if it exists, otherwise create dummy."""
    checkpoint_path = "lstm_checkpoint.h5"
    scaler_path = "scaler.pkl"

    if os.path.exists(checkpoint_path):
        try:
            model = load_model(checkpoint_path)
            scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None
            print(f"Loaded trained LSTM model from {checkpoint_path}")
            return model, scaler
        except Exception as e:
            print(f"Failed to load trained model: {e}")

    # Fallback to dummy model
    print("No trained model found, using dummy model")
    model = create_model()
    dummy_x = np.random.rand(10, SEQUENCE_LENGTH, 1)
    dummy_y = np.random.rand(10, 1)
    model.fit(dummy_x, dummy_y, epochs=1, verbose=0)
    return model, None

def predict_price(model, scaler, recent_prices):
    """Make prediction using the model."""
    if scaler is None or len(recent_prices) < SEQUENCE_LENGTH:
        # Fallback to simple prediction
        return float(np.mean(recent_prices[-5:]))

    # Scale the recent prices
    scaled_prices = scaler.transform(recent_prices.reshape(-1, 1))

    # Create sequence for prediction
    X_pred = np.array([scaled_prices[-SEQUENCE_LENGTH:].flatten()])
    X_pred = np.reshape(X_pred, (X_pred.shape[0], X_pred.shape[1], 1))

    # Make prediction
    scaled_prediction = model.predict(X_pred, verbose=0)
    prediction = scaler.inverse_transform(scaled_prediction.reshape(-1, 1))[0][0]

    return float(prediction)
