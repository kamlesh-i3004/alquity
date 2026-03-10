"""
LSTM Model Training Script for AI-QUITY
Trains LSTM model on real historical stock data from yfinance.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import yfinance as yf
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
SEQUENCE_LENGTH = 60  # Use 60 days of data to predict next day
TRAINING_YEARS = 2   # Train on 2 years of data
EPOCHS = 50
BATCH_SIZE = 32
VALIDATION_SPLIT = 0.2
CHECKPOINT_PATH = "lstm_checkpoint.h5"

def fetch_stock_data(ticker: str, years: int = TRAINING_YEARS) -> pd.DataFrame:
    """Fetch historical stock data from yfinance."""
    logger.info(f"Fetching {years} years of data for {ticker}")

    end_date = datetime.now()
    start_date = end_date - timedelta(days=years*365)

    try:
        stock = yf.Ticker(ticker)
        df = stock.history(start=start_date, end=end_date, interval='1d')

        if df.empty:
            raise ValueError(f"No data found for ticker {ticker}")

        logger.info(f"Fetched {len(df)} days of data for {ticker}")
        return df

    except Exception as e:
        logger.error(f"Failed to fetch data for {ticker}: {e}")
        raise

def preprocess_data(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, MinMaxScaler]:
    """Preprocess stock data for LSTM training."""
    # Use closing prices
    data = df['Close'].values.reshape(-1, 1)

    # Scale data to 0-1 range
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)

    # Create sequences
    X, y = [], []
    for i in range(SEQUENCE_LENGTH, len(scaled_data)):
        X.append(scaled_data[i-SEQUENCE_LENGTH:i, 0])
        y.append(scaled_data[i, 0])

    X = np.array(X)
    y = np.array(y)

    # Reshape X for LSTM (samples, time steps, features)
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))

    logger.info(f"Created {len(X)} sequences of length {SEQUENCE_LENGTH}")
    return X, y, scaler

def create_lstm_model(input_shape: tuple) -> Sequential:
    """Create LSTM model architecture."""
    model = Sequential([
        LSTM(units=50, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(units=50, return_sequences=False),
        Dropout(0.2),
        Dense(units=25),
        Dense(units=1)
    ])

    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
    logger.info("Created LSTM model with architecture:")
    model.summary(print_fn=logger.info)
    return model

def train_model(ticker: str, epochs: int = EPOCHS, batch_size: int = BATCH_SIZE):
    """Train LSTM model on stock data."""
    logger.info(f"Starting LSTM training for {ticker}")

    # Fetch data
    df = fetch_stock_data(ticker, TRAINING_YEARS)

    # Preprocess data
    X, y, scaler = preprocess_data(df)

    # Split into train/validation
    split_idx = int(len(X) * (1 - VALIDATION_SPLIT))
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]

    logger.info(f"Training on {len(X_train)} samples, validating on {len(X_val)} samples")

    # Create model
    model = create_lstm_model((X.shape[1], 1))

    # Callbacks
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True,
        verbose=1
    )

    checkpoint = ModelCheckpoint(
        CHECKPOINT_PATH,
        monitor='val_loss',
        save_best_only=True,
        verbose=1
    )

    # Train model
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_data=(X_val, y_val),
        callbacks=[early_stopping, checkpoint],
        verbose=1
    )

    # Save final model
    model.save(CHECKPOINT_PATH)
    logger.info(f"Model saved to {CHECKPOINT_PATH}")

    # Save scaler for later use
    import joblib
    scaler_path = "scaler.pkl"
    joblib.dump(scaler, scaler_path)
    logger.info(f"Scaler saved to {scaler_path}")

    return model, history, scaler

def predict_with_model(model: Sequential, scaler: MinMaxScaler, recent_data: pd.DataFrame) -> float:
    """Make prediction using trained model."""
    # Get last SEQUENCE_LENGTH days
    recent_prices = recent_data['Close'].tail(SEQUENCE_LENGTH).values.reshape(-1, 1)

    # Scale the data
    scaled_data = scaler.transform(recent_prices)

    # Reshape for model input
    X_pred = np.array([scaled_data.flatten()])
    X_pred = np.reshape(X_pred, (X_pred.shape[0], X_pred.shape[1], 1))

    # Make prediction
    scaled_prediction = model.predict(X_pred, verbose=0)
    prediction = scaler.inverse_transform(scaled_prediction.reshape(-1, 1))[0][0]

    return float(prediction)

def main():
    """Main training function."""

    if len(sys.argv) < 2:
        print("Usage: python train_lstm.py <TICKER> [EPOCHS]")
        print("Example: python train_lstm.py AAPL 100")
        print("Default epochs: 50")
        return

    ticker = sys.argv[1].upper()
    epochs = int(sys.argv[2]) if len(sys.argv) > 2 else EPOCHS

    try:
        logger.info(f"Training LSTM model for {ticker} with {epochs} epochs")

        # Train the model
        model, history, scaler = train_model(ticker, epochs)

        # Test prediction on recent data
        test_df = fetch_stock_data(ticker, 0.5)  # Last 6 months
        current_price = test_df['Close'].iloc[-1]
        prediction = predict_with_model(model, scaler, test_df)

        change = prediction - current_price
        change_pct = (change / current_price) * 100

        logger.info("Training completed!")
        logger.info(f"Current price: ${current_price:.2f}")
        logger.info(f"Predicted price: ${prediction:.2f}")
        logger.info(f"Predicted change: ${change:.2f} ({change_pct:.2f} percent)")
        logger.info(f"Model saved as: {CHECKPOINT_PATH}")

    except Exception as e:
        logger.error(f"Training failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()</content>
<parameter name="filePath">c:\Users\RONAK\OneDrive\Documents\SEM V\project\backend\train_lstm.py