import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Brain, 
  Cpu, 
  TrendingUp, 
  Target,
  Zap,
  Activity,
  Layers,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useState } from 'react';

// Mock model metrics data
const generateModelMetrics = () => ({
  mlAccuracy: 0.847,
  dlAccuracy: 0.892,
  lstmLoss: {
    epochs: Array.from({ length: 50 }, (_, i) => i + 1),
    trainLoss: Array.from({ length: 50 }, (_, i) => 0.5 * Math.exp(-i / 15) + 0.05 + Math.random() * 0.02),
    valLoss: Array.from({ length: 50 }, (_, i) => 0.6 * Math.exp(-i / 15) + 0.08 + Math.random() * 0.03),
  },
  confusionMatrix: [
    [142, 18, 12],
    [22, 128, 15],
    [8, 12, 95]
  ],
  featureImportance: [
    { feature: 'Price Momentum', importance: 0.245 },
    { feature: 'Volume', importance: 0.189 },
    { feature: 'RSI', importance: 0.156 },
    { feature: 'MACD', importance: 0.134 },
    { feature: 'Bollinger Bands', importance: 0.112 },
    { feature: 'Moving Average', importance: 0.089 },
    { feature: 'Sentiment', importance: 0.075 },
  ],
  modelComparison: [
    { metric: 'Accuracy', ml: 84.7, dl: 89.2, lstm: 91.5 },
    { metric: 'Precision', ml: 82.3, dl: 87.8, lstm: 90.1 },
    { metric: 'Recall', ml: 81.5, dl: 86.4, lstm: 89.3 },
    { metric: 'F1 Score', ml: 81.9, dl: 87.1, lstm: 89.7 },
  ],
  trainingHistory: Array.from({ length: 30 }, (_, i) => ({
    epoch: i + 1,
    accuracy: 0.5 + 0.4 * (1 - Math.exp(-i / 8)) + Math.random() * 0.02,
    valAccuracy: 0.5 + 0.38 * (1 - Math.exp(-i / 8)) + Math.random() * 0.025,
  })),
});

export default function ModelPerformance() {
  const [metrics] = useState(generateModelMetrics());
  const [selectedModel, setSelectedModel] = useState<'ml' | 'dl' | 'lstm'>('lstm');

  // Prepare loss data
  const lossData = metrics.lstmLoss.epochs.map((epoch, i) => ({
    epoch,
    trainLoss: metrics.lstmLoss.trainLoss[i],
    valLoss: metrics.lstmLoss.valLoss[i],
  }));

  // Prepare confusion matrix visualization
  const confusionLabels = ['Up', 'Down', 'Stable'];
  const confusionColors = ['#22C55E', '#EF4444', '#EAB308'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#6E56F8]" />
          Model Performance
        </h2>
        <p className="text-white/60 mt-1">
          AI model metrics, training history, and performance analysis
        </p>
      </motion.div>

      {/* Model Selection Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {[
          { id: 'ml', label: 'Machine Learning', icon: Brain, accuracy: metrics.mlAccuracy },
          { id: 'dl', label: 'Deep Learning', icon: Cpu, accuracy: metrics.dlAccuracy },
          { id: 'lstm', label: 'LSTM Network', icon: Layers, accuracy: 0.915 },
        ].map((model) => (
          <motion.button
            key={model.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedModel(model.id as typeof selectedModel)}
            className={`flex-1 flex items-center gap-3 p-4 rounded-xl transition-all ${
              selectedModel === model.id
                ? 'bg-gradient-purple text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <model.icon className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">{model.label}</p>
              <p className="text-xs opacity-70">{(model.accuracy * 100).toFixed(1)}% Accuracy</p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Accuracy', 
            value: selectedModel === 'ml' ? '84.7%' : selectedModel === 'dl' ? '89.2%' : '91.5%',
            icon: Target,
            color: '#6E56F8'
          },
          { 
            label: 'Precision', 
            value: selectedModel === 'ml' ? '82.3%' : selectedModel === 'dl' ? '87.8%' : '90.1%',
            icon: CheckCircle,
            color: '#22C55E'
          },
          { 
            label: 'Recall', 
            value: selectedModel === 'ml' ? '81.5%' : selectedModel === 'dl' ? '86.4%' : '89.3%',
            icon: Activity,
            color: '#C084FC'
          },
          { 
            label: 'F1 Score', 
            value: selectedModel === 'ml' ? '81.9%' : selectedModel === 'dl' ? '87.1%' : '89.7%',
            icon: Zap,
            color: '#F59E0B'
          },
        ].map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${metric.color}20` }}
              >
                <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
              </div>
              <span className="text-xs text-white/50">{metric.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Training Loss Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#6E56F8]" />
          Training & Validation Loss
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="epoch" stroke="#71717a" />
              <YAxis stroke="#71717a" domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#141416', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [value.toFixed(4), '']}
              />
              <Line
                type="monotone"
                dataKey="trainLoss"
                stroke="#6E56F8"
                strokeWidth={2}
                dot={false}
                name="Training Loss"
              />
              <Line
                type="monotone"
                dataKey="valLoss"
                stroke="#C084FC"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Validation Loss"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#6E56F8]" />
            <span className="text-xs text-white/50">Training Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#C084FC]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #C084FC, #C084FC 5px, transparent 5px, transparent 10px)' }} />
            <span className="text-xs text-white/50">Validation Loss</span>
          </div>
        </div>
      </motion.div>

      {/* Confusion Matrix & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#6E56F8]" />
            Confusion Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {confusionLabels.map((label) => (
                    <th key={label} className="p-2 text-sm text-white/60 font-medium">
                      Predicted {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.confusionMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2 text-sm text-white/60 font-medium">
                      Actual {confusionLabels[i]}
                    </td>
                    {row.map((value, j) => (
                      <td key={j} className="p-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + (i * 3 + j) * 0.1 }}
                          className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-white"
                          style={{ 
                            backgroundColor: `${confusionColors[i]}${Math.floor((value / 150) * 40 + 20).toString(16).padStart(2, '0')}`,
                            color: confusionColors[i]
                          }}
                        >
                          {value}
                        </motion.div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            {confusionLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: confusionColors[i] }} />
                <span className="text-xs text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Importance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6E56F8]" />
            Feature Importance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.featureImportance}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 0.3]} stroke="#71717a" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis dataKey="feature" type="category" stroke="#71717a" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#141416', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {metrics.featureImportance.map((_entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index < 3 ? '#6E56F8' : '#C084FC'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Model Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#6E56F8]" />
          Model Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left text-sm text-white/60 font-medium">Metric</th>
                <th className="p-3 text-center text-sm text-white/60 font-medium">Machine Learning</th>
                <th className="p-3 text-center text-sm text-white/60 font-medium">Deep Learning</th>
                <th className="p-3 text-center text-sm text-white/60 font-medium">LSTM</th>
              </tr>
            </thead>
            <tbody>
              {metrics.modelComparison.map((row) => (
                <tr key={row.metric} className="border-b border-white/5">
                  <td className="p-3 text-sm text-white font-medium">{row.metric}</td>
                  <td className="p-3 text-center">
                    <span className={`text-sm font-bold ${row.ml >= 85 ? 'text-green-400' : 'text-white'}`}>
                      {row.ml.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-sm font-bold ${row.dl >= 85 ? 'text-green-400' : 'text-white'}`}>
                      {row.dl.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-sm font-bold ${row.lstm >= 85 ? 'text-green-400' : 'text-white'}`}>
                      {row.lstm.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Training Accuracy Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#6E56F8]" />
          Training Accuracy Over Epochs
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.trainingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="epoch" stroke="#71717a" />
              <YAxis stroke="#71717a" domain={[0.4, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#141416', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '']}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
                name="Training Accuracy"
              />
              <Line
                type="monotone"
                dataKey="valAccuracy"
                stroke="#6E56F8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Validation Accuracy"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#22C55E]" />
            <span className="text-xs text-white/50">Training Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#6E56F8]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #6E56F8, #6E56F8 5px, transparent 5px, transparent 10px)' }} />
            <span className="text-xs text-white/50">Validation Accuracy</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
