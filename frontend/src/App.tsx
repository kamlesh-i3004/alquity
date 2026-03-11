import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StockSearch from './components/StockSearch';
import CandlestickChart from './components/CandlestickChart';
import AIPrediction from './components/AIPrediction';
import SentimentAnalysis from './components/SentimentAnalysis';
import ModelPerformance from './components/ModelPerformance';
import PortfolioTracker from './components/PortfolioTracker';
import Settings from './components/Settings';
import Help from './components/Help';
import Login from './components/Login';
import NeuralBackground from './components/NeuralBackground';
import type { StockData, PredictionData, SentimentData, Portfolio, TimeFrame, User } from './types';
import {
  fetchStockData,
  fetchPrediction,
  fetchSentiment,
  fetchPortfolio,
  clearToken,
  getToken,
} from './services/api';
import { Loader2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1M');
  const [isLoading, setIsLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [user, setUser] = useState<User | null>(null);
  // Track whether a sidebar menu is open on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh] = useState(true);
  const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

  // Restore session token on mount (user object comes from login flow)
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Restore user from token if it exists
      const storedUser = localStorage.getItem('aiquity_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
          console.log('[App] Restored user session from localStorage');
        } catch (e) {
          console.error('[App] Failed to parse stored user:', e);
          clearToken();
          localStorage.removeItem('aiquity_user');
        }
      }
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (user) loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-refresh data every 30 seconds when user is logged in
  useEffect(() => {
    if (!user || !autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, autoRefresh, selectedStock, timeframe]);

  const refreshData = async () => {
    try {
      const [stock, prediction, sentiment] = await Promise.all([
        fetchStockData(selectedStock, timeframe),
        fetchPrediction(selectedStock),
        fetchSentiment(selectedStock),
      ]);
      setStockData(stock);
      setPredictionData(prediction);
      setSentimentData(sentiment);
      setLastUpdated(new Date());
      console.log('[App] Auto-refreshed data for', selectedStock);
    } catch (err) {
      console.error('[App] Failed to auto-refresh data:', err);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [stock, prediction, sentiment, port] = await Promise.all([
        fetchStockData(selectedStock, timeframe),
        fetchPrediction(selectedStock),
        fetchSentiment(selectedStock),
        fetchPortfolio(),
      ]);
      setStockData(stock);
      setPredictionData(prediction);
      setSentimentData(sentiment);
      setPortfolio(port);
    } catch (err) {
      // Log and allow UI to recover instead of freezing the loading state forever
      console.error('[App] Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockSearch = async (ticker: string, tf: TimeFrame) => {
    setSelectedStock(ticker);
    setTimeframe(tf);
    setIsLoading(true);
    try {
      const [stock, prediction, sentiment] = await Promise.all([
        fetchStockData(ticker, tf),
        fetchPrediction(ticker),
        fetchSentiment(ticker),
      ]);
      setStockData(stock);
      setPredictionData(prediction);
      setSentimentData(sentiment);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[App] Failed to load data for search:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPortfolio = (ticker: string, shares: number, price: number) => {
    if (portfolio) {
      const newHolding = {
        ticker,
        shares,
        avgPrice: price,
        currentPrice: price,
        value: shares * price,
        pnl: 0,
        pnlPercent: 0,
      };
      const updatedHoldings = [...portfolio.holdings, newHolding];
      const totalValue = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
      const totalPnl = updatedHoldings.reduce((sum, h) => sum + h.pnl, 0);
      setPortfolio({
        ...portfolio,
        holdings: updatedHoldings,
        totalValue,
        totalPnl,
        totalPnlPercent: portfolio.totalCost > 0 ? (totalPnl / portfolio.totalCost) * 100 : 0,
      });
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Persist user to localStorage for session restoration
    localStorage.setItem('aiquity_user', JSON.stringify(userData));
    setActiveTab('dashboard');
    console.log('[App] User logged in and session saved');
  };

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem('aiquity_user');
    setUser(null);
    setActiveTab('dashboard');
    console.log('[App] User logged out and session cleared');
  };

  // Show login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden">
        <NeuralBackground />
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stockData={stockData}
            predictionData={predictionData}
            sentimentData={sentimentData}
          />
        );
      case 'charts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CandlestickChart
              data={stockData}
              selectedStock={selectedStock}
              onRefresh={refreshData}
              lastUpdated={lastUpdated || undefined}
            />
          </motion.div>
        );
      case 'predictions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AIPrediction predictionData={predictionData} stockData={stockData} />
          </motion.div>
        );
      case 'sentiment':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SentimentAnalysis sentimentData={sentimentData} />
          </motion.div>
        );
      case 'performance':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ModelPerformance />
          </motion.div>
        );
      case 'portfolio':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PortfolioTracker portfolio={portfolio} onAddStock={handleAddToPortfolio} />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Settings user={user} onLogout={handleLogout} />
          </motion.div>
        );
      case 'help':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Help />
          </motion.div>
        );
      default:
        return (
          <Dashboard
            stockData={stockData}
            predictionData={predictionData}
            sentimentData={sentimentData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Neural Network Background */}
      <NeuralBackground />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-[#6E56F8] animate-spin" />
              <p className="text-lg text-white/70">Analyzing market data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex h-screen">
        {/* Sidebar — hidden on mobile, slide-in via sidebarOpen */}
        <div
          className={`
            fixed inset-y-0 left-0 z-40 transform transition-transform duration-300
            lg:relative lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
            user={user}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full relative" style={{ zIndex: 1 }}>
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <header className="mb-6 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between gap-4"
              >
                {/* Mobile hamburger */}
                <button
                  className="lg:hidden p-2 rounded-lg glass text-white/70 hover:text-white"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gradient truncate">
                    AI Stock Predictor
                  </h1>
                  <p className="text-white/60 mt-1 text-sm sm:text-base hidden sm:block">
                    Advanced market intelligence powered by machine learning
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="glass px-3 py-2 rounded-lg hidden sm:block">
                    <span className="text-xs text-white/60">Market Status</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-medium text-green-500">Open</span>
                    </div>
                  </div>
                  <div className="glass px-3 py-2 rounded-lg flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-purple flex items-center justify-center shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-white/50">{user.plan}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </header>

            {/* Stock Search Panel */}
            {(activeTab === 'dashboard' || activeTab === 'charts') && (
              <StockSearch
                onSearch={handleStockSearch}
                selectedStock={selectedStock}
                timeframe={timeframe}
              />
            )}

            {/* Content */}
            <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
