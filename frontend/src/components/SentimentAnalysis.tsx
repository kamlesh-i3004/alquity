import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  TrendingUp, 
  ExternalLink,
  Newspaper,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Tag,
  Clock
} from 'lucide-react';
import type { SentimentData } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SentimentAnalysisProps {
  sentimentData: SentimentData | null;
}

export default function SentimentAnalysis({ sentimentData }: SentimentAnalysisProps) {
  const [selectedArticle, setSelectedArticle] = useState<NonNullable<typeof sentimentData>['newsArticles'][0] | null>(null);

  if (!sentimentData) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <p className="text-white/50">Loading sentiment data...</p>
      </div>
    );
  }

  const sentimentColor = sentimentData.overallSentiment === 'positive' ? '#22C55E' : 
                        sentimentData.overallSentiment === 'negative' ? '#EF4444' : '#EAB308';

  const SentimentIcon = sentimentData.overallSentiment === 'positive' ? ThumbsUp : 
                       sentimentData.overallSentiment === 'negative' ? ThumbsDown : Meh;

  // Prepare pie chart data
  const pieData = [
    { name: 'Positive', value: sentimentData.sentimentDistribution.positive * 100, color: '#22C55E' },
    { name: 'Negative', value: sentimentData.sentimentDistribution.negative * 100, color: '#EF4444' },
    { name: 'Neutral', value: sentimentData.sentimentDistribution.neutral * 100, color: '#EAB308' },
  ];

  // Prepare sentiment history data
  const historyData = sentimentData.sentimentHistory.dates.map((date, i) => ({
    date,
    score: sentimentData.sentimentHistory.scores[i]
  }));

  // Prepare keyword cloud data (sorted by weight)
  const sortedKeywords = [...sentimentData.keywordCloud].sort((a, b) => b.weight - a.weight);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#6E56F8]" />
          Sentiment Analysis
        </h2>
        <p className="text-white/60 mt-1">
          News and social media sentiment for {sentimentData.ticker}
        </p>
      </motion.div>

      {/* Main Sentiment Gauge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Gauge Visualization */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Background arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                strokeDasharray="188.5 251.3"
              />
              {/* Value arc */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={sentimentColor}
                strokeWidth="8"
                strokeDasharray="188.5 251.3"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 188.5 }}
                animate={{ 
                  strokeDashoffset: 188.5 - (188.5 * ((sentimentData.sentimentScore + 50) / 100))
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <SentimentIcon className="w-8 h-8 mb-1" style={{ color: sentimentColor }} />
              <span className="text-3xl font-bold text-white">
                {sentimentData.sentimentScore > 0 ? '+' : ''}{sentimentData.sentimentScore.toFixed(0)}
              </span>
              <span className="text-xs text-white/50 capitalize">{sentimentData.overallSentiment}</span>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="flex-1 max-w-md">
            <h3 className="font-semibold text-white mb-4">Sentiment Distribution</h3>
            <div className="space-y-3">
              {[
                { label: 'Positive', value: sentimentData.sentimentDistribution.positive, color: 'bg-green-500', textColor: 'text-green-400' },
                { label: 'Neutral', value: sentimentData.sentimentDistribution.neutral, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
                { label: 'Negative', value: sentimentData.sentimentDistribution.negative, color: 'bg-red-500', textColor: 'text-red-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white/60">{item.label}</span>
                    <span className={`text-sm font-bold ${item.textColor}`}>
                      {(item.value * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-2 rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#141416', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Sentiment History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#6E56F8]" />
          Sentiment Trend (14 Days)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
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
              <YAxis stroke="#71717a" domain={[-50, 50]} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#141416', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [value.toFixed(1), 'Sentiment Score']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
              <ReferenceLine y={20} stroke="#22C55E" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={-20} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6E56F8"
                strokeWidth={2}
                dot={{ fill: '#6E56F8', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#C084FC' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="text-xs text-white/50">Positive Threshold (+20)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6E56F8]" />
            <span className="text-xs text-white/50">Sentiment Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <span className="text-xs text-white/50">Negative Threshold (-20)</span>
          </div>
        </div>
      </motion.div>

      {/* Keyword Cloud */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#6E56F8]" />
          Key Sentiment Keywords
        </h3>
        <div className="flex flex-wrap gap-3">
          {sortedKeywords.map((keyword, i) => (
            <motion.span
              key={keyword.word}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                keyword.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                keyword.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}
              style={{ 
                fontSize: `${0.75 + keyword.weight * 0.5}rem`,
              }}
            >
              {keyword.word}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* News Articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#6E56F8]" />
          Latest News Headlines
        </h3>
        <div className="space-y-3">
          {sentimentData.newsArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-white group-hover:text-[#6E56F8] transition-colors line-clamp-2">
                    {article.headline}
                  </h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-white/50">{article.source}</span>
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      article.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                      article.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {article.sentiment}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-[#6E56F8] transition-colors flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Article Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="bg-[#141416] border-white/10 text-white max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white leading-relaxed">
              {selectedArticle?.headline}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 max-h-[60vh]">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/50">{selectedArticle?.source}</span>
                <span className="text-sm text-white/50">
                  {selectedArticle && new Date(selectedArticle.publishedAt).toLocaleString()}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedArticle?.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                  selectedArticle?.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedArticle?.sentiment}
                </span>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-white/70 leading-relaxed">
                  {selectedArticle?.summary}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/50">Sentiment Score:</span>
                <span className={`font-bold ${
                  (selectedArticle?.sentimentScore || 0) > 0 ? 'text-green-400' :
                  (selectedArticle?.sentimentScore || 0) < 0 ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {selectedArticle?.sentimentScore && selectedArticle.sentimentScore > 0 ? '+' : ''}
                  {selectedArticle?.sentimentScore.toFixed(2)}
                </span>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
