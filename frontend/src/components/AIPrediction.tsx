import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Download,
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import type { PredictionData, StockData } from '../types';
import { Button } from '@/components/ui/button';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
  BarChart,
  Cell
} from 'recharts';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatPrice } from '../utils/currency';

interface AIPredictionProps {
  predictionData: PredictionData | null;
  stockData: StockData | null;
}

export default function AIPrediction({ predictionData, stockData }: AIPredictionProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Loading state - show skeleton while data is being fetched
  if (!predictionData || !stockData) {
    return (
      <div className="space-y-6">
        {/* Skeleton Loader */}
        <div className="glass-card p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-white/10 rounded" />
              <div className="h-4 w-64 bg-white/10 rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/10 rounded" />
                  <div className="h-3 w-32 bg-white/10 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-full bg-white/10 rounded-lg" />
                <div className="h-10 w-full bg-white/10 rounded-lg" />
                <div className="h-10 w-full bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isPositive = predictionData.predictedChange >= 0;

  // Prepare comparison chart data
  const comparisonData = predictionData.historicalPredictions?.dates?.map((date, i) => ({
    date,
    actual: predictionData.historicalPredictions?.actual[i] ?? 0,
    predicted: predictionData.historicalPredictions?.predicted[i] ?? 0,
    error: Math.abs((predictionData.historicalPredictions?.actual[i] ?? 0) - (predictionData.historicalPredictions?.predicted[i] ?? 0))
  })) ?? [];

  // Prepare probability data for bar chart
  const probabilityData = [
    { name: 'Price Up', probability: (predictionData.probabilities?.up ?? 0) * 100, color: '#22C55E' },
    { name: 'Price Down', probability: (predictionData.probabilities?.down ?? 0) * 100, color: '#EF4444' },
    { name: 'Stable', probability: (predictionData.probabilities?.stable ?? 0) * 100, color: '#EAB308' },
  ];

  // Prepare feature importance data
  const featureData = predictionData.featureImportance
    ? Object.entries(predictionData.featureImportance)
        .map(([name, value]) => ({ name, value: value * 100 }))
        .slice(0, 8) // Top 8 features
    : [];

  const handleDownloadReport = () => {
    setShowReportDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Download */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#6E56F8]" />
            AI Price Prediction
          </h2>
          <p className="text-white/60 mt-1">
            Machine learning and deep learning forecasts for {predictionData.ticker}
          </p>
        </div>
        <Button
          onClick={handleDownloadReport}
          className="bg-gradient-purple hover:opacity-90 text-white rounded-xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </motion.div>

      {/* Main Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current vs Predicted */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#6E56F8]/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#6E56F8]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Price Forecast</h3>
              <p className="text-xs text-white/50">Next day prediction</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-white/60">Current Price</span>
              <span className="font-bold text-white">{formatPrice(predictionData.currentPrice, predictionData.ticker)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-white/60">Predicted Price</span>
              <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {formatPrice(predictionData.predictedPrice, predictionData.ticker)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-white/60">Expected Change</span>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-bold">
                  {isPositive ? '+' : ''}{predictionData.predictedChange.toFixed(2)}
                  ({isPositive ? '+' : ''}{predictionData.predictedChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Model Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#C084FC]/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#C084FC]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Model Comparison</h3>
              <p className="text-xs text-white/50">ML vs Trend predictions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/60">ML Model (Random Forest)</span>
                <span className={`font-bold ${predictionData.mlPrediction >= predictionData.currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPrice(predictionData.mlPrediction, predictionData.ticker)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((predictionData.mlPrediction ?? predictionData.currentPrice) / predictionData.currentPrice) * 50)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-[#6E56F8] h-2 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-white/40">Confidence: {((predictionData.mlConfidence ?? 0) * 100).toFixed(0)}%</span>
                <span className="text-xs text-white/40">R²: {((predictionData.mlMetrics?.r2 ?? 0) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/60">Trend Model (Linear Regression)</span>
                <span className={`font-bold ${(predictionData.trendPrediction ?? 0) >= predictionData.currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPrice(predictionData.trendPrediction ?? 0, predictionData.ticker)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((predictionData.trendPrediction ?? 0) / predictionData.currentPrice) * 50)}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="bg-[#22C55E] h-2 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-white/40">Change: {((predictionData.trendChangePercent ?? 0)).toFixed(2)}%</span>
                <span className="text-xs text-white/40">Simple trend extrapolation</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Consensus</span>
                <span className="font-bold text-white">
                  {formatPrice(((predictionData.mlPrediction ?? 0) + (predictionData.trendPrediction ?? 0)) / 2, predictionData.ticker)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Model Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">ML Model Metrics</h3>
              <p className="text-xs text-white/50">Random Forest performance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-white/50 mb-1">R² Score</p>
              <p className={`text-xl font-bold ${(predictionData.mlMetrics?.r2 ?? 0) > 0.5 ? 'text-green-400' : 'text-yellow-400'}`}>
                {((predictionData.mlMetrics?.r2 ?? 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-white/50 mb-1">Direction Accuracy</p>
              <p className="text-xl font-bold text-[#6E56F8]">
                {((predictionData.mlMetrics?.directionAccuracy ?? 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-white/50 mb-1">RMSE</p>
              <p className="text-xl font-bold text-white">
                {(predictionData.mlMetrics?.rmse ?? 0).toFixed(4)}
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-white/50 mb-1">MAE</p>
              <p className="text-xl font-bold text-white">
                {(predictionData.mlMetrics?.mae ?? 0).toFixed(4)}
              </p>
            </div>
          </div>

          {featureData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 mb-2">Top Features</p>
              <div className="space-y-2">
                {featureData.slice(0, 5).map((feature, idx) => (
                  <div key={feature.name} className="flex items-center gap-2">
                    <span className="text-xs text-white/60 w-24 truncate">{feature.name}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, feature.value * 3)}%` }}
                        transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                        className="bg-gradient-to-r from-[#6E56F8] to-[#C084FC] h-1.5 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-white/40 w-10 text-right">{feature.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Probability Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#6E56F8]" />
          Movement Probability Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={probabilityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#71717a" />
              <YAxis dataKey="name" type="category" stroke="#71717a" width={100} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#141416', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probability']}
              />
              <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                {probabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Historical Comparison Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#6E56F8]" />
          Historical Prediction Accuracy
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={comparisonData}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6E56F8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6E56F8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                stroke="#71717a"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#71717a" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141416',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatPrice(value, predictionData.ticker), '']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#6E56F8"
                fill="url(#actualGradient)"
                strokeWidth={2}
                name="Actual Price"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#C084FC"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#6E56F8]" />
            <span className="text-sm text-white/60">Actual Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#C084FC]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #C084FC, #C084FC 5px, transparent 5px, transparent 10px)' }} />
            <span className="text-sm text-white/60">Predicted Price</span>
          </div>
        </div>
      </motion.div>

      {/* Download Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-[#141416] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gradient">Prediction Report</DialogTitle>
            <DialogDescription className="text-white/60">
              AI Stock Prediction Report for {predictionData.ticker}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Executive Summary</h4>
              <p className="text-sm text-white/70">
                Our AI models predict a <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                {isPositive ? 'bullish' : 'bearish'}</span> movement for {predictionData.ticker}
                with {((predictionData.confidence ?? 0) * 100).toFixed(1)}% confidence.
                The predicted price of {formatPrice(predictionData.predictedPrice ?? 0, predictionData.ticker)} represents
                a {isPositive ? '+' : ''}{((predictionData.predictedChangePercent ?? 0)).toFixed(2)}% change.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50">ML Model Accuracy</p>
                <p className="font-bold text-[#6E56F8]">
                  {predictionData.modelMetrics?.mlAccuracy != null 
                    ? `${(predictionData.modelMetrics.mlAccuracy * 100).toFixed(1)}%` 
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50">DL Model Accuracy</p>
                <p className="font-bold text-[#C084FC]">
                  {predictionData.modelMetrics?.dlAccuracy != null 
                    ? `${(predictionData.modelMetrics.dlAccuracy * 100).toFixed(1)}%` 
                    : 'N/A'}
                </p>
              </div>
            </div>
            <Button 
              className="w-full bg-gradient-purple hover:opacity-90"
              onClick={() => setShowReportDialog(false)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
