import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity,
  Brain,
  MessageSquare,
  Cpu,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import type { StockData, PredictionData, SentimentData } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stockData: StockData | null;
  predictionData: PredictionData | null;
  sentimentData: SentimentData | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

export default function Dashboard({ stockData, predictionData, sentimentData }: DashboardProps) {
  if (!stockData || !predictionData || !sentimentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50">Loading dashboard data...</p>
      </div>
    );
  }

  const isPositive = stockData.change >= 0;
  const isPredictionPositive = predictionData.predictedChange >= 0;

  // Prepare mini chart data
  const miniChartData = stockData.candleData.slice(-20).map(d => ({
    date: d.date,
    price: d.close
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Main Stock Overview Card */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Stock Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-purple flex items-center justify-center glow-purple">
              <span className="text-2xl font-bold text-white">{stockData.ticker[0]}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{stockData.ticker}</h2>
              <p className="text-white/60">{stockData.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  stockData.trend === 'bullish' ? 'bg-green-500/20 text-green-400' :
                  stockData.trend === 'bearish' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {stockData.trend === 'bullish' ? 'Bullish' : 
                   stockData.trend === 'bearish' ? 'Bearish' : 'Neutral'}
                </span>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-white/50 mb-1">Current Price</p>
              <p className="text-4xl font-bold text-white">${stockData.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Daily Change</p>
              <div className={`flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                <div>
                  <p className="text-2xl font-bold">{isPositive ? '+' : ''}{stockData.change.toFixed(2)}</p>
                  <p className="text-sm">({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="w-full lg:w-64 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniChartData}>
                <defs>
                  <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#22C55E' : '#EF4444'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isPositive ? '#22C55E' : '#EF4444'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isPositive ? '#22C55E' : '#EF4444'} 
                  fillOpacity={1} 
                  fill="url(#miniGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-white/10">
          {[
            { label: 'Volume', value: stockData.volume.toLocaleString(), icon: BarChart3 },
            { label: 'Market Cap', value: stockData.marketCap, icon: DollarSign },
            { label: 'P/E Ratio', value: stockData.peRatio.toFixed(2), icon: Activity },
            { label: '52W High', value: `$${stockData.high52w.toFixed(2)}`, icon: TrendingUp },
            { label: '52W Low', value: `$${stockData.low52w.toFixed(2)}`, icon: TrendingDown },
            { label: 'Avg Volume', value: stockData.avgVolume, icon: BarChart3 },
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <metric.icon className="w-3 h-3 text-white/40" />
                <p className="text-xs text-white/40">{metric.label}</p>
              </div>
              <p className="font-semibold text-white">{metric.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ML Prediction Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 hover:border-[#6E56F8]/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6E56F8]/20 flex items-center justify-center group-hover:bg-[#6E56F8]/30 transition-colors">
                <Brain className="w-5 h-5 text-[#6E56F8]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ML Prediction</h3>
                <p className="text-xs text-white/50">Machine Learning Model</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg ${isPredictionPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <span className={`text-sm font-bold ${isPredictionPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPredictionPositive ? '+' : ''}{predictionData.predictedChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Predicted Price</span>
              <span className="font-bold text-white">${predictionData.mlPrediction.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Confidence</span>
              <span className="font-bold text-[#6E56F8]">{(predictionData.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${predictionData.confidence * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-purple h-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* DL Prediction Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 hover:border-[#C084FC]/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C084FC]/20 flex items-center justify-center group-hover:bg-[#C084FC]/30 transition-colors">
                <Cpu className="w-5 h-5 text-[#C084FC]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">DL Prediction</h3>
                <p className="text-xs text-white/50">Deep Learning LSTM</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg ${isPredictionPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <span className={`text-sm font-bold ${isPredictionPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPredictionPositive ? '+' : ''}{predictionData.predictedChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Predicted Price</span>
              <span className="font-bold text-white">${predictionData.dlPrediction.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Model Accuracy</span>
              <span className="font-bold text-[#C084FC]">{(predictionData.modelMetrics.dlAccuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${predictionData.modelMetrics.dlAccuracy * 100}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-2 rounded-full"
                style={{ background: 'linear-gradient(90deg, #C084FC, #6E56F8)' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Sentiment Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 hover:border-green-500/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                sentimentData.overallSentiment === 'positive' ? 'bg-green-500/20 group-hover:bg-green-500/30' :
                sentimentData.overallSentiment === 'negative' ? 'bg-red-500/20 group-hover:bg-red-500/30' :
                'bg-yellow-500/20 group-hover:bg-yellow-500/30'
              }`}>
                <MessageSquare className={`w-5 h-5 ${
                  sentimentData.overallSentiment === 'positive' ? 'text-green-400' :
                  sentimentData.overallSentiment === 'negative' ? 'text-red-400' :
                  'text-yellow-400'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Sentiment</h3>
                <p className="text-xs text-white/50">News Analysis</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg ${
              sentimentData.overallSentiment === 'positive' ? 'bg-green-500/20' :
              sentimentData.overallSentiment === 'negative' ? 'bg-red-500/20' :
              'bg-yellow-500/20'
            }`}>
              <span className={`text-sm font-bold capitalize ${
                sentimentData.overallSentiment === 'positive' ? 'text-green-400' :
                sentimentData.overallSentiment === 'negative' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {sentimentData.overallSentiment}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Sentiment Score</span>
              <span className={`font-bold ${
                sentimentData.sentimentScore > 0 ? 'text-green-400' :
                sentimentData.sentimentScore < 0 ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {sentimentData.sentimentScore > 0 ? '+' : ''}{sentimentData.sentimentScore.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">News Articles</span>
              <span className="font-bold text-white">{sentimentData.newsArticles.length}</span>
            </div>
            <div className="flex gap-1 mt-2">
              <div 
                className="h-2 bg-green-500 rounded-l-full"
                style={{ width: `${sentimentData.sentimentDistribution.positive * 100}%` }}
              />
              <div 
                className="h-2 bg-yellow-500"
                style={{ width: `${sentimentData.sentimentDistribution.neutral * 100}%` }}
              />
              <div 
                className="h-2 bg-red-500 rounded-r-full"
                style={{ width: `${sentimentData.sentimentDistribution.negative * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Probability Cards */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#6E56F8]" />
          Price Movement Probability
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Price Up', probability: predictionData.probabilities.up, color: 'green', icon: TrendingUp },
            { label: 'Price Down', probability: predictionData.probabilities.down, color: 'red', icon: TrendingDown },
            { label: 'Stable', probability: predictionData.probabilities.stable, color: 'yellow', icon: Activity },
          ].map((item, idx) => (
            <div key={item.label} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                  <span className="text-sm text-white/60">{item.label}</span>
                </div>
                <span className={`font-bold text-${item.color}-400`}>
                  {(item.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.probability * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 + idx * 0.1 }}
                  className={`h-3 rounded-full ${
                    item.color === 'green' ? 'bg-green-500' :
                    item.color === 'red' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'RSI (14)', value: stockData.rsi[stockData.rsi.length - 1]?.toFixed(1) || '50.0', icon: Activity, color: '#6E56F8' },
          { label: 'MACD', value: stockData.macd.macd[stockData.macd.macd.length - 1]?.toFixed(2) || '0.00', icon: Zap, color: '#C084FC' },
          { label: 'BB Upper', value: stockData.bollingerBands.upper[stockData.bollingerBands.upper.length - 1]?.toFixed(2) || '0.00', icon: Target, color: '#22C55E' },
          { label: 'MA (20)', value: stockData.movingAverage[stockData.movingAverage.length - 1]?.toFixed(2) || '0.00', icon: Shield, color: '#F59E0B' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-xs text-white/50">{stat.label}</p>
              <p className="font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
