
from transformers import pipeline

sentiment_pipeline = pipeline("sentiment-analysis")

def transformer_sentiment(text):
    return sentiment_pipeline(text)
