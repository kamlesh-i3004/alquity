import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Book, 
  MessageCircle, 
  Mail,
  ChevronDown,
  Play,
  FileText,
  HelpCircle,
  TrendingUp,
  Brain,
  BarChart3,
  Shield,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How accurate are the AI predictions?',
    answer: 'Our AI models achieve an accuracy of 85-92% depending on the stock and market conditions. The LSTM deep learning model typically performs best for short-term predictions (1-7 days), while our ensemble ML model excels at medium-term forecasts.',
    category: 'AI Predictions'
  },
  {
    question: 'What data sources do you use?',
    answer: 'We aggregate data from multiple sources including Yahoo Finance, Alpha Vantage, real-time market feeds, news APIs (Bloomberg, Reuters, CNBC), and social media sentiment from Twitter and Reddit.',
    category: 'Data'
  },
  {
    question: 'How often is the data updated?',
    answer: 'Stock prices and technical indicators update every 30 seconds during market hours. Sentiment analysis refreshes every 15 minutes, and AI predictions are recalculated every hour.',
    category: 'Data'
  },
  {
    question: 'Can I export my portfolio data?',
    answer: 'Yes! You can export your portfolio in CSV, JSON, or PDF formats. Go to Portfolio → Export Data to download your complete transaction history and performance metrics.',
    category: 'Portfolio'
  },
  {
    question: 'What technical indicators are available?',
    answer: 'We offer 15+ technical indicators including RSI, MACD, Bollinger Bands, Moving Averages (SMA, EMA), Fibonacci Retracement, Stochastic Oscillator, and more.',
    category: 'Charts'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level 256-bit encryption for all data transmission and storage. Your portfolio and personal information are never shared with third parties.',
    category: 'Security'
  },
  {
    question: 'How do I set up price alerts?',
    answer: 'Navigate to Settings → Notifications and enable "Price Alerts". Then go to any stock chart and click the bell icon to set custom price thresholds for alerts.',
    category: 'Notifications'
  },
  {
    question: 'What is the difference between ML and DL predictions?',
    answer: 'ML (Machine Learning) uses Random Forest and XGBoost algorithms for pattern recognition. DL (Deep Learning) uses LSTM neural networks that can better capture temporal patterns in stock price movements.',
    category: 'AI Predictions'
  },
];

const guides = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using AI Stock Predictor',
    icon: Book,
    color: '#6E56F8',
    articles: 12,
    time: '15 min'
  },
  {
    title: 'Technical Analysis',
    description: 'Master chart patterns and indicators',
    icon: BarChart3,
    color: '#22C55E',
    articles: 18,
    time: '25 min'
  },
  {
    title: 'AI Predictions',
    description: 'Understanding ML and DL forecasts',
    icon: Brain,
    color: '#C084FC',
    articles: 8,
    time: '20 min'
  },
  {
    title: 'Portfolio Management',
    description: 'Track and optimize your investments',
    icon: TrendingUp,
    color: '#F59E0B',
    articles: 10,
    time: '15 min'
  },
  {
    title: 'Security Best Practices',
    description: 'Keep your account and data safe',
    icon: Shield,
    color: '#EF4444',
    articles: 6,
    time: '10 min'
  },
];

const videos = [
  {
    title: 'Introduction to AI Stock Predictor',
    duration: '5:32',
    thumbnail: 'intro'
  },
  {
    title: 'How to Read Candlestick Charts',
    duration: '8:15',
    thumbnail: 'charts'
  },
  {
    title: 'Understanding Sentiment Analysis',
    duration: '6:45',
    thumbnail: 'sentiment'
  },
  {
    title: 'Building Your First Portfolio',
    duration: '10:20',
    thumbnail: 'portfolio'
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">How can we help?</h2>
        <p className="text-white/60">Search our knowledge base or browse by topic</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            className="pl-12 pr-4 py-4 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-lg"
          />
        </div>
      </div>

      {/* Quick Guides */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Guides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide, i) => (
            <motion.div
              key={guide.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-5 cursor-pointer group hover:border-white/20 transition-all"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${guide.color}20` }}
              >
                <guide.icon className="w-6 h-6" style={{ color: guide.color }} />
              </div>
              <h4 className="font-semibold text-white mb-1 group-hover:text-[#6E56F8] transition-colors">
                {guide.title}
              </h4>
              <p className="text-sm text-white/50 mb-3">{guide.description}</p>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {guide.articles} articles
                </span>
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {guide.time} read
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#6E56F8] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredFAQs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-[#6E56F8]" />
                  <span className="font-medium text-white">{faq.question}</span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-white/40 transition-transform ${
                    expandedFAQ === i ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              <AnimatePresence>
                {expandedFAQ === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-12">
                      <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                      <span className="inline-block mt-3 px-2 py-1 bg-white/5 text-white/40 text-xs rounded">
                        {faq.category}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Tutorials */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Video Tutorials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video, i) => (
            <motion.div
              key={video.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card overflow-hidden group cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-[#6E56F8]/30 to-[#C084FC]/30 flex items-center justify-center relative">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                  {video.duration}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-white text-sm line-clamp-2 group-hover:text-[#6E56F8] transition-colors">
                  {video.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#6E56F8]/20 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-[#6E56F8]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Still need help?</h3>
              <p className="text-white/60">Our support team is available 24/7</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl">
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button className="bg-gradient-purple hover:opacity-90 text-white rounded-xl">
              <ExternalLink className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="text-center">
        <p className="text-white/60">
          Want to dive deeper? Check out our{' '}
          <button className="text-[#6E56F8] hover:underline font-medium">
            API Documentation
          </button>
          {' '}and{' '}
          <button className="text-[#6E56F8] hover:underline font-medium">
            Developer Guides
          </button>
        </p>
      </div>
    </div>
  );
}
