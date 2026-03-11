import type { StockData, PredictionData, SentimentData, Portfolio, TimeFrame, CandleData, NewsArticle } from '../types';
import { formatMarketCap } from './currency';

const stockNames: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla, Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corporation',
  'META': 'Meta Platforms, Inc.',
  'NFLX': 'Netflix, Inc.',
  'RELIANCE': 'Reliance Industries',
  'TCS': 'Tata Consultancy Services'
};

const generateCandleData = (basePrice: number, days: number): CandleData[] => {
  const data: CandleData[] = [];
  let price = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const volatility = price * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 10000000) + 5000000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
    
    price = close;
  }
  
  return data;
};

const calculateRSI = (prices: number[], period: number = 14): number[] => {
  const rsi: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(50);
      continue;
    }
    
    let gains = 0;
    let losses = 0;
    
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  
  return rsi;
};

const calculateMACD = (prices: number[]) => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12.map((val, i) => val - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, i) => val - signalLine[i]);
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram
  };
};

const calculateEMA = (prices: number[], period: number): number[] => {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema.push(prices[i]);
    } else {
      ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
  }
  
  return ema;
};

const calculateBollingerBands = (prices: number[], period: number = 20, stdDev: number = 2) => {
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(prices[i]);
      middle.push(prices[i]);
      lower.push(prices[i]);
      continue;
    }
    
    const slice = prices.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    middle.push(sma);
    upper.push(sma + stdDev * std);
    lower.push(sma - stdDev * std);
  }
  
  return { upper, middle, lower };
};

const calculateSMA = (prices: number[], period: number = 20): number[] => {
  const sma: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(prices[i]);
      continue;
    }
    
    const slice = prices.slice(i - period + 1, i + 1);
    sma.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  
  return sma;
};

export const generateMockStockData = (ticker: string, timeframe: TimeFrame): StockData => {
  const basePrice = Math.random() * 200 + 50;
  const days = timeframe === '1D' ? 1 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;
  
  const candleData = generateCandleData(basePrice, days);
  const prices = candleData.map(d => d.close);
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 2] || currentPrice;
  const change = currentPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;
  
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const bollingerBands = calculateBollingerBands(prices);
  const movingAverage = calculateSMA(prices);
  
  const trend = changePercent > 1 ? 'bullish' : changePercent < -1 ? 'bearish' : 'neutral';

  // Calculate market cap value (in numeric form for formatting)
  const marketCapValue = currentPrice * candleData[candleData.length - 1].volume * 1000;

  return {
    ticker,
    name: stockNames[ticker] || `${ticker} Corp`,
    price: currentPrice,
    change,
    changePercent,
    volume: candleData[candleData.length - 1].volume,
    marketCap: formatMarketCap(marketCapValue, ticker),
    peRatio: parseFloat((Math.random() * 30 + 10).toFixed(2)),
    high52w: Math.max(...prices) * 1.2,
    low52w: Math.min(...prices) * 0.8,
    avgVolume: `${(Math.random() * 50 + 20).toFixed(1)}M`,
    candleData,
    rsi,
    macd,
    bollingerBands,
    movingAverage,
    trend
  };
};

export const generateMockPrediction = (ticker: string): PredictionData => {
  const basePrice = Math.random() * 200 + 50;
  const predictedPrice = basePrice * (1 + (Math.random() - 0.3) * 0.1);
  const predictedChange = predictedPrice - basePrice;
  const predictedChangePercent = (predictedChange / basePrice) * 100;
  
  const upProb = Math.random() * 0.6 + 0.2;
  const downProb = (1 - upProb) * Math.random();
  const stableProb = 1 - upProb - downProb;
  
  const dates: string[] = [];
  const actual: number[] = [];
  const predicted: number[] = [];
  
  let price = basePrice;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    
    const actualPrice = price * (1 + (Math.random() - 0.5) * 0.03);
    const predPrice = actualPrice * (1 + (Math.random() - 0.5) * 0.02);
    
    actual.push(parseFloat(actualPrice.toFixed(2)));
    predicted.push(parseFloat(predPrice.toFixed(2)));
    price = actualPrice;
  }
  
  return {
    ticker,
    currentPrice: basePrice,
    predictedPrice,
    predictedChange,
    predictedChangePercent,
    confidence: Math.random() * 0.3 + 0.65,
    probabilities: {
      up: parseFloat(upProb.toFixed(3)),
      down: parseFloat(downProb.toFixed(3)),
      stable: parseFloat(stableProb.toFixed(3))
    },
    mlPrediction: predictedPrice * (1 + (Math.random() - 0.5) * 0.01),
    mlConfidence: Math.random() * 0.2 + 0.7,
    mlMetrics: {
      r2: Math.random() * 0.15 + 0.8,
      rmse: parseFloat((Math.random() * 3 + 1).toFixed(2)),
      mae: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
      directionAccuracy: Math.random() * 0.15 + 0.8
    },
    dlPrediction: predictedPrice * (1 + (Math.random() - 0.5) * 0.015),
    dlConfidence: Math.random() * 0.2 + 0.72,
    trendPrediction: predictedPrice * (1 + (Math.random() - 0.5) * 0.02),
    trendChange: predictedPrice * (1 + (Math.random() - 0.5) * 0.02) - basePrice,
    trendChangePercent: ((predictedPrice * (1 + (Math.random() - 0.5) * 0.02) - basePrice) / basePrice) * 100,
    historicalPredictions: { dates, actual, predicted },
    modelMetrics: {
      mlAccuracy: parseFloat((Math.random() * 0.15 + 0.75).toFixed(3)),
      dlAccuracy: parseFloat((Math.random() * 0.15 + 0.78).toFixed(3)),
      lstmLoss: {
        epochs: [1, 2, 3, 4, 5],
        trainLoss: [0.5, 0.3, 0.2, 0.15, 0.1],
        valLoss: [0.6, 0.35, 0.25, 0.18, 0.12]
      },
      confusionMatrix: [[45, 5], [8, 42]],
      featureImportance: [
        { feature: 'RSI', importance: 0.25 },
        { feature: 'MACD', importance: 0.20 },
        { feature: 'Volume', importance: 0.18 },
        { feature: 'Moving Avg', importance: 0.15 },
        { feature: 'Bollinger Bands', importance: 0.12 }
      ]
    }
  };
};

const generateNewsArticles = (ticker: string): NewsArticle[] => {
  const headlines = [
    `${ticker} Reports Strong Q4 Earnings, Beats Analyst Expectations`,
    `Analysts Upgrade ${ticker} Price Target Following Product Launch`,
    `${ticker} Announces Strategic Partnership with Tech Giant`,
    `Market Volatility Impacts ${ticker} Stock Performance`,
    `${ticker} CEO Discusses Future Growth Strategy in Interview`,
    `Institutional Investors Increase Stakes in ${ticker}`,
    `${ticker} Unveils New Innovation at Annual Conference`,
    `Regulatory Changes May Affect ${ticker} Operations`
  ];
  
  return headlines.map((headline, i) => ({
    id: `news-${i}`,
    headline,
    source: ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', 'MarketWatch'][Math.floor(Math.random() * 5)],
    publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: Math.random() > 0.4 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
    sentimentScore: parseFloat((Math.random() * 2 - 1).toFixed(2)),
    url: '#',
    summary: `This article discusses recent developments related to ${ticker} and their potential impact on stock performance...`
  }));
};

export const generateMockSentiment = (ticker: string): SentimentData => {
  const positive = Math.random() * 0.5 + 0.3;
  const negative = (1 - positive) * Math.random() * 0.7;
  const neutral = 1 - positive - negative;
  
  const sentimentScore = (positive - negative) * 100;
  const overallSentiment = sentimentScore > 20 ? 'positive' : sentimentScore < -20 ? 'negative' : 'neutral';
  
  const dates: string[] = [];
  const scores: number[] = [];
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    scores.push(parseFloat((Math.random() * 100 - 50).toFixed(1)));
  }
  
  const keywords = [
    { word: 'growth', weight: 0.9, sentiment: 'positive' as const },
    { word: 'innovation', weight: 0.8, sentiment: 'positive' as const },
    { word: 'earnings', weight: 0.85, sentiment: 'positive' as const },
    { word: 'volatility', weight: 0.6, sentiment: 'negative' as const },
    { word: 'expansion', weight: 0.75, sentiment: 'positive' as const },
    { word: 'risk', weight: 0.5, sentiment: 'negative' as const },
    { word: 'partnership', weight: 0.7, sentiment: 'positive' as const },
    { word: 'competition', weight: 0.55, sentiment: 'neutral' as const }
  ];
  
  return {
    ticker,
    overallSentiment,
    sentimentScore: parseFloat(sentimentScore.toFixed(1)),
    sentimentDistribution: {
      positive: parseFloat(positive.toFixed(3)),
      negative: parseFloat(negative.toFixed(3)),
      neutral: parseFloat(neutral.toFixed(3))
    },
    newsArticles: generateNewsArticles(ticker),
    sentimentHistory: { dates, scores },
    keywordCloud: keywords
  };
};

export const generateMockPortfolio = (): Portfolio => {
  const holdings = [
    { ticker: 'AAPL', shares: 100, avgPrice: 150 },
    { ticker: 'TSLA', shares: 50, avgPrice: 200 },
    { ticker: 'MSFT', shares: 75, avgPrice: 300 },
    { ticker: 'NVDA', shares: 40, avgPrice: 400 }
  ].map(h => {
    const currentPrice = h.avgPrice * (1 + (Math.random() - 0.3) * 0.2);
    const value = h.shares * currentPrice;
    const cost = h.shares * h.avgPrice;
    const pnl = value - cost;
    const pnlPercent = (pnl / cost) * 100;
    
    return {
      ...h,
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      value: parseFloat(value.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercent: parseFloat(pnlPercent.toFixed(2))
    };
  });
  
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = (totalPnl / totalCost) * 100;
  
  const allocation = [
    { sector: 'Technology', value: totalValue * 0.45, percentage: 45 },
    { sector: 'Automotive', value: totalValue * 0.25, percentage: 25 },
    { sector: 'Software', value: totalValue * 0.20, percentage: 20 },
    { sector: 'Semiconductors', value: totalValue * 0.10, percentage: 10 }
  ];
  
  const dates: string[] = [];
  const values: number[] = [];
  
  let value = totalValue * 0.9;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    value = value * (1 + (Math.random() - 0.5) * 0.02);
    values.push(parseFloat(value.toFixed(2)));
  }
  
  return {
    holdings,
    totalValue: parseFloat(totalValue.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    totalPnl: parseFloat(totalPnl.toFixed(2)),
    totalPnlPercent: parseFloat(totalPnlPercent.toFixed(2)),
    allocation,
    performance: { dates, values }
  };
};
