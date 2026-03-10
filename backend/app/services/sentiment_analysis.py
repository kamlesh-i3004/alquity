
import random
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str) -> dict:
    """Return a SentimentData-shaped dict for the given text / ticker."""
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]  # -1 to +1

    overall = "positive" if compound > 0.05 else ("negative" if compound < -0.05 else "neutral")
    sentiment_score = round(compound * 100, 1)  # scale to -100..100

    return {
        "overallSentiment": overall,
        "sentimentScore": sentiment_score,
        "raw": scores,
    }

def get_ticker_sentiment(ticker: str) -> dict:
    """
    Build a full SentimentData response for a ticker.
    Uses VADER on synthetic headline-like strings as a demo.
    Replace the headline list with real News API calls when key is available.
    """
    sample_headlines = [
        f"{ticker} Reports Strong Quarterly Earnings, Beats Expectations",
        f"Analysts Upgrade {ticker} Following New Product Launch",
        f"Market Volatility Weighs on {ticker} Shares",
        f"{ticker} Announces Strategic Partnership",
        f"Regulatory Scrutiny May Impact {ticker} Operations",
        f"Institutional Investors Increase Stakes in {ticker}",
        f"{ticker} Faces Supply Chain Challenges",
        f"{ticker} CEO Outlines Ambitious Growth Strategy",
    ]

    articles = []
    sentiment_scores_list = []
    for i, headline in enumerate(sample_headlines):
        score = analyzer.polarity_scores(headline)
        compound = score["compound"]
        sent = "positive" if compound > 0.05 else ("negative" if compound < -0.05 else "neutral")
        articles.append({
            "id": f"news-{i}",
            "headline": headline,
            "source": ["Bloomberg", "Reuters", "CNBC", "WSJ", "MarketWatch"][i % 5],
            "publishedAt": "",
            "sentiment": sent,
            "sentimentScore": round(compound, 2),
            "url": "#",
            "summary": f"Recent developments related to {ticker} and their market impact.",
        })
        sentiment_scores_list.append(compound)

    avg_compound = sum(sentiment_scores_list) / len(sentiment_scores_list)
    positive_ratio = sum(1 for s in sentiment_scores_list if s > 0.05) / len(sentiment_scores_list)
    negative_ratio = sum(1 for s in sentiment_scores_list if s < -0.05) / len(sentiment_scores_list)
    neutral_ratio = 1 - positive_ratio - negative_ratio

    overall = "positive" if avg_compound > 0.05 else ("negative" if avg_compound < -0.05 else "neutral")

    # Sentiment history (last 14 days) — random walk seeded by ticker name
    rng = random.Random(sum(ord(c) for c in ticker))
    history_scores = [round(rng.uniform(-50, 80), 1) for _ in range(14)]

    from datetime import datetime, timedelta
    history_dates = [
        (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(13, -1, -1)
    ]

    keywords = [
        {"word": "growth",      "weight": 0.9, "sentiment": "positive"},
        {"word": "innovation",  "weight": 0.8, "sentiment": "positive"},
        {"word": "earnings",    "weight": 0.85, "sentiment": "positive"},
        {"word": "volatility",  "weight": 0.6,  "sentiment": "negative"},
        {"word": "expansion",   "weight": 0.75, "sentiment": "positive"},
        {"word": "risk",        "weight": 0.5,  "sentiment": "negative"},
        {"word": "partnership", "weight": 0.7,  "sentiment": "positive"},
        {"word": "competition", "weight": 0.55, "sentiment": "neutral"},
    ]

    return {
        "ticker": ticker,
        "overallSentiment": overall,
        "sentimentScore": round(avg_compound * 100, 1),
        "sentimentDistribution": {
            "positive": round(positive_ratio, 3),
            "negative": round(negative_ratio, 3),
            "neutral":  round(neutral_ratio, 3),
        },
        "newsArticles": articles,
        "sentimentHistory": {"dates": history_dates, "scores": history_scores},
        "keywordCloud": keywords,
    }
