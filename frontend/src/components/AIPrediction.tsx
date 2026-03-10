import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart3,
  Download,
  Calendar,
  Zap
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

interface AIPredictionProps {
  predictionData: PredictionData | null;
  stockData: StockData | null;
}

export default function AIPrediction({ predictionData, stockData }: AIPredictionProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);

  if (!predictionData || !stockData) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <p className="text-white/50">Loading prediction data...</p>
      </div>
    );
  }

  const isPositive = predictionData.predictedChange >= 0;

  // Prepare comparison chart data
  const comparisonData = predictionData.historicalPredictions.dates.map((date, i) => ({
    date,
    actual: predictionData.historicalPredictions.actual[i],
    predicted: predictionData.historicalPredictions.predicted[i],
    error: Math.abs(predictionData.historicalPredictions.actual[i] - predictionData.historicalPredictions.predicted[i])
  }));

  // Prepare probability data for bar chart
  const probabilityData = [
    { name: 'Price Up', probability: predictionData.probabilities.up * 100, color: '#22C55E' },
    { name: 'Price Down', probability: predictionData.probabilities.down * 100, color: '#EF4444' },
    { name: 'Stable', probability: predictionData.probabilities.stable * 100, color: '#EAB308' },
  ];

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
              <span className="font-bold text-white">${predictionData.currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-white/60">Predicted Price</span>
              <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                ${predictionData.predictedPrice.toFixed(2)}
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
              <BarChart3 className="w-5 h-5 text-[#C084FC]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Model Comparison</h3>
              <p className="text-xs text-white/50">ML vs DL predictions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/60">ML Model (Random Forest)</span>
                <span className="font-bold text-white">${predictionData.mlPrediction.toFixed(2)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(predictionData.mlPrediction / predictionData.currentPrice) * 50}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-[#6E56F8] h-2 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/60">DL Model (LSTM)</span>
                <span className="font-bold text-white">${predictionData.dlPrediction.toFixed(2)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(predictionData.dlPrediction / predictionData.currentPrice) * 50}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="bg-[#C084FC] h-2 rounded-full"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Average Prediction</span>
                <span className="font-bold text-white">
                  ${((predictionData.mlPrediction + predictionData.dlPrediction) / 2).toFixed(2)}
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
              <h3 className="font-semibold text-white">Model Metrics</h3>
              <p className="text-xs text-white/50">Performance indicators</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-white/50 mb-1">ML Accuracy</p>
              <p className="text-xl font-bold text-[#6E56F8]">
                {(predictionData.modelMetrics.mlAccuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-white/50 mb-1">DL Accuracy</p>
              <p className="text-xl font-bold text-[#C084FC]">
                {(predictionData.modelMetrics.dlAccuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-white/50 mb-1">RMSE</p>
              <p className="text-xl font-bold text-white">
                {predictionData.modelMetrics.rmse.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-white/50 mb-1">MAE</p>
              <p className="text-xl font-bold text-white">
                {predictionData.modelMetrics.mae.toFixed(2)}
              </p>
            </div>
          </div>
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
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
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
                with {(predictionData.confidence * 100).toFixed(1)}% confidence. 
                The predicted price of ${predictionData.predictedPrice.toFixed(2)} represents 
                a {isPositive ? '+' : ''}{predictionData.predictedChangePercent.toFixed(2)}% change.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50">ML Model Accuracy</p>
                <p className="font-bold text-[#6E56F8]">{(predictionData.modelMetrics.mlAccuracy * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50">DL Model Accuracy</p>
                <p className="font-bold text-[#C084FC]">{(predictionData.modelMetrics.dlAccuracy * 100).toFixed(1)}%</p>
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
