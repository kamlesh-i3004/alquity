export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  peRatio: number;
  high52w: number;
  low52w: number;
  avgVolume: string;
  candleData: CandleData[];
  rsi: number[];
  macd: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  movingAverage: number[];
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface PredictionData {
  ticker: string;
  currentPrice: number;
  predictedPrice: number;
  predictedChange: number;
  predictedChangePercent: number;
  confidence: number;
  probabilities: {
    up: number;
    down: number;
    stable: number;
  };
  // ML Model (Random Forest)
  mlPrediction: number;
  mlConfidence: number;
  mlMetrics: {
    r2: number;
    rmse: number;
    mae: number;
    directionAccuracy: number;
  };
  // DL Model (Deep Learning)
  dlPrediction: number;
  dlConfidence: number;
  // Trend Model (Linear Regression)
  trendPrediction: number;
  trendChange: number;
  trendChangePercent: number;
  // Feature importance from ML model
  featureImportance?: Record<string, number>;
  // Historical data
  historicalPredictions: {
    dates: string[];
    actual: number[];
    predicted: number[];
  };
  // Model metrics (may not be available for international stocks)
  modelMetrics?: {
    mlAccuracy: number;
    dlAccuracy: number;
    lstmLoss: {
      epochs: number[];
      trainLoss: number[];
      valLoss: number[];
    };
    confusionMatrix: number[][];
    featureImportance: {
      feature: string;
      importance: number;
    }[];
  };
}

export interface SentimentData {
  ticker: string;
  overallSentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  newsArticles: NewsArticle[];
  sentimentHistory: {
    dates: string[];
    scores: number[];
  };
  keywordCloud: {
    word: string;
    weight: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }[];
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  url: string;
  summary: string;
}

export interface PortfolioHolding {
  ticker: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface Portfolio {
  holdings: PortfolioHolding[];
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  allocation: {
    sector: string;
    value: number;
    percentage: number;
  }[];
  performance: {
    dates: string[];
    values: number[];
  };
}

export interface ModelMetrics {
  mlAccuracy: number;
  dlAccuracy: number;
  lstmLoss: {
    epochs: number[];
    trainLoss: number[];
    valLoss: number[];
  };
  confusionMatrix: number[][];
  featureImportance: {
    feature: string;
    importance: number;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  provider: 'google' | 'github' | 'email';
}

export type ChartType = 'candlestick' | 'bar' | 'line';
