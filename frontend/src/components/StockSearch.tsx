import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TimeFrame } from '../types';

interface StockSearchProps {
  onSearch: (ticker: string, timeframe: TimeFrame) => void;
  selectedStock: string;
  timeframe: TimeFrame;
}

const popularStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', change: 2.34 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', change: -1.56 },
  { ticker: 'MSFT', name: 'Microsoft', change: 1.23 },
  { ticker: 'GOOGL', name: 'Alphabet', change: 0.89 },
  { ticker: 'AMZN', name: 'Amazon', change: -0.45 },
  { ticker: 'NVDA', name: 'NVIDIA', change: 3.21 },
];

const timeframes: { value: TimeFrame; label: string }[] = [
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '1Y', label: '1 Year' },
];

export default function StockSearch({ onSearch, selectedStock, timeframe }: StockSearchProps) {
  const [searchValue, setSearchValue] = useState(selectedStock);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>(timeframe);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue.toUpperCase(), selectedTimeframe);
      setShowSuggestions(false);
    }
  };

  const handleStockClick = (ticker: string) => {
    setSearchValue(ticker);
    onSearch(ticker, selectedTimeframe);
    setShowSuggestions(false);
  };

  const handleTimeframeChange = (value: TimeFrame) => {
    setSelectedTimeframe(value);
    if (searchValue.trim()) {
      onSearch(searchValue.toUpperCase(), value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter stock ticker (e.g., AAPL, TSLA)"
              className="pl-12 pr-4 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#6E56F8] focus:ring-[#6E56F8]/20 rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 glass-card z-50 overflow-hidden"
            >
              <div className="p-3">
                <p className="text-xs text-white/50 mb-2 px-3">Popular Stocks</p>
                {popularStocks.map((stock) => (
                  <motion.button
                    key={stock.ticker}
                    onClick={() => handleStockClick(stock.ticker)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold">{stock.ticker[0]}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{stock.ticker}</p>
                        <p className="text-xs text-white/50">{stock.name}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${
                      stock.change > 0 ? 'text-green-400' : stock.change < 0 ? 'text-red-400' : 'text-white/50'
                    }`}>
                      {stock.change > 0 ? <TrendingUp className="w-3 h-3" /> : 
                       stock.change < 0 ? <TrendingDown className="w-3 h-3" /> : 
                       <Minus className="w-3 h-3" />}
                      {Math.abs(stock.change)}%
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Timeframe Select */}
        <div className="w-full lg:w-48">
          <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white py-6 rounded-xl">
              <Clock className="w-4 h-4 mr-2 text-white/40" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-[#141416] border-white/10">
              {timeframes.map((tf) => (
                <SelectItem 
                  key={tf.value} 
                  value={tf.value}
                  className="text-white hover:bg-white/10 focus:bg-white/10"
                >
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="w-full lg:w-auto bg-gradient-purple hover:opacity-90 text-white py-6 px-8 rounded-xl font-medium transition-all duration-300 glow-purple"
        >
          <Search className="w-5 h-5 mr-2" />
          Analyze
        </Button>
      </div>

      {/* Quick Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-xs text-white/40">Quick select:</span>
        {['AAPL', 'TSLA', 'MSFT', 'NVDA', 'GOOGL'].map((ticker) => (
          <motion.button
            key={ticker}
            onClick={() => handleStockClick(ticker)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              selectedStock === ticker
                ? 'bg-[#6E56F8] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {ticker}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
