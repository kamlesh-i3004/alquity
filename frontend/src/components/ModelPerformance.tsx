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
import { useState, useEffect } from 'react';
import { fetchModelPerformance, type ModelPerformanceData } from '../services/api';
import { Loader2 } from 'lucide-react';

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState<ModelPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<'ml' | 'dl'>('dl');

  useEffect(() => {
    loadModelPerformance();
  }, []);

  const loadModelPerformance = async () => {
    try {
      const data = await fetchModelPerformance();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load model performance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#6E56F8] animate-spin" />
          <p className="text-white/50">Loading model performance...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <p className="text-white/50">Failed to load model performance data.</p>
      </div>
    );
  }

  // Prepare loss data
  const lossData = metrics.loss_history.epochs.map((epoch, i) => ({
    epoch,
    trainLoss: metrics.loss_history.train_loss[i],
    valLoss: metrics.loss_history.val_loss[i],
  }));

  // Prepare confusion matrix visualization
  const confusionLabels = ['Up', 'Down', 'Stable'];
  const confusionColors = ['#22C55E', '#EF4444', '#EAB308'];

  const mlMetrics = metrics.ml_metrics;
  const dlMetrics = metrics.dl_metrics;

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
          { id: 'ml', label: 'Machine Learning', icon: Brain, accuracy: mlMetrics.accuracy },
          { id: 'dl', label: 'Deep Learning', icon: Cpu, accuracy: dlMetrics.accuracy },
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
            value: selectedModel === 'ml' ? mlMetrics.accuracy : dlMetrics.accuracy,
            icon: Target,
            color: '#6E56F8'
          },
          {
            label: 'Precision',
            value: selectedModel === 'ml' ? mlMetrics.precision : dlMetrics.precision,
            icon: CheckCircle,
            color: '#22C55E'
          },
          {
            label: 'Recall',
            value: selectedModel === 'ml' ? mlMetrics.recall : dlMetrics.recall,
            icon: Activity,
            color: '#C084FC'
          },
          {
            label: 'F1 Score',
            value: selectedModel === 'ml' ? mlMetrics.f1_score : dlMetrics.f1_score,
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
            <p className="text-2xl font-bold text-white">{(metric.value * 100).toFixed(1)}%</p>
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
                {metrics.confusion_matrix.map((row, i) => (
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
                data={metrics.feature_importance}
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
                  {metrics.feature_importance.map((_entry, index) => (
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
              </tr>
            </thead>
            <tbody>
              {[
                { metric: 'Accuracy', ml: mlMetrics.accuracy, dl: dlMetrics.accuracy },
                { metric: 'Precision', ml: mlMetrics.precision, dl: dlMetrics.precision },
                { metric: 'Recall', ml: mlMetrics.recall, dl: dlMetrics.recall },
                { metric: 'F1 Score', ml: mlMetrics.f1_score, dl: dlMetrics.f1_score },
              ].map((row) => (
                <tr key={row.metric} className="border-b border-white/5">
                  <td className="p-3 text-sm text-white font-medium">{row.metric}</td>
                  <td className="p-3 text-center">
                    <span className={`text-sm font-bold ${row.ml >= 0.85 ? 'text-green-400' : 'text-white'}`}>
                      {(row.ml * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-sm font-bold ${row.dl >= 0.85 ? 'text-green-400' : 'text-white'}`}>
                      {(row.dl * 100).toFixed(1)}%
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
            <LineChart data={metrics.training_history}>
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
                dataKey="val_accuracy"
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
