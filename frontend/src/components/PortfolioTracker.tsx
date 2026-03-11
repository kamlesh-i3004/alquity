import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  PieChart,
  DollarSign,
  Percent,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import type { Portfolio } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { formatPrice } from '../utils/currency';

interface PortfolioTrackerProps {
  portfolio: Portfolio | null;
  onAddStock: (ticker: string, shares: number, price: number) => void;
}

export default function PortfolioTracker({ portfolio, onAddStock }: PortfolioTrackerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newPrice, setNewPrice] = useState('');

  if (!portfolio) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <p className="text-white/50">Loading portfolio data...</p>
      </div>
    );
  }

  const isPositive = portfolio.totalPnl >= 0;

  // Prepare allocation data for pie chart
  const allocationData = portfolio.allocation.map(item => ({
    name: item.sector,
    value: item.percentage,
    color: ['#6E56F8', '#C084FC', '#22C55E', '#F59E0B', '#EF4444'][portfolio.allocation.indexOf(item) % 5]
  }));

  // Prepare performance data
  const performanceData = portfolio.performance.dates.map((date, i) => ({
    date,
    value: portfolio.performance.values[i]
  }));

  const handleAddStock = () => {
    if (newTicker && newShares && newPrice) {
      onAddStock(
        newTicker.toUpperCase(),
        parseInt(newShares),
        parseFloat(newPrice)
      );
      setNewTicker('');
      setNewShares('');
      setNewPrice('');
      setShowAddDialog(false);
    }
  };

  const handleDeleteHolding = (ticker: string) => {
    console.log('Delete holding:', ticker);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#6E56F8]" />
            Portfolio Tracker
          </h2>
          <p className="text-white/60 mt-1">
            Track your investments and monitor performance
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-purple hover:opacity-90 text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </motion.div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Value', 
            value: `$${portfolio.totalValue.toLocaleString()}`,
            icon: DollarSign,
            color: '#6E56F8'
          },
          { 
            label: 'Total Cost', 
            value: `$${portfolio.totalCost.toLocaleString()}`,
            icon: Wallet,
            color: '#C084FC'
          },
          { 
            label: 'Total P&L', 
            value: `${isPositive ? '+' : ''}$${portfolio.totalPnl.toLocaleString()}`,
            icon: isPositive ? TrendingUp : TrendingDown,
            color: isPositive ? '#22C55E' : '#EF4444'
          },
          { 
            label: 'P&L %', 
            value: `${isPositive ? '+' : ''}${portfolio.totalPnlPercent.toFixed(2)}%`,
            icon: Percent,
            color: isPositive ? '#22C55E' : '#EF4444'
          },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <span className="text-xs text-white/50">{item.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: item.color === '#6E56F8' || item.color === '#C084FC' ? 'white' : item.color }}>
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#6E56F8]" />
            Portfolio Performance (30 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
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
                <YAxis stroke="#71717a" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#141416', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6E56F8"
                  fill="url(#portfolioGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Allocation Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#6E56F8]" />
            Sector Allocation
          </h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#141416', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Allocation']}
                />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-4">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-white/60">{item.name}</span>
                  <span className="text-xs text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#6E56F8]" />
          Your Holdings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left text-sm text-white/60 font-medium">Ticker</th>
                <th className="p-3 text-right text-sm text-white/60 font-medium">Shares</th>
                <th className="p-3 text-right text-sm text-white/60 font-medium">Avg Price</th>
                <th className="p-3 text-right text-sm text-white/60 font-medium">Current</th>
                <th className="p-3 text-right text-sm text-white/60 font-medium">Value</th>
                <th className="p-3 text-right text-sm text-white/60 font-medium">P&L</th>
                <th className="p-3 text-center text-sm text-white/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {portfolio.holdings.map((holding, i) => (
                  <motion.tr
                    key={holding.ticker}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{holding.ticker[0]}</span>
                        </div>
                        <span className="font-medium text-white">{holding.ticker}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-white">{holding.shares}</td>
                    <td className="p-3 text-right text-white/60">{formatPrice(holding.avgPrice, holding.ticker)}</td>
                    <td className="p-3 text-right text-white">{formatPrice(holding.currentPrice, holding.ticker)}</td>
                    <td className="p-3 text-right text-white font-medium">{formatPrice(holding.value, holding.ticker, 0)}</td>
                    <td className="p-3 text-right">
                      <div className={`flex items-center justify-end gap-1 ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span className="font-medium">{holding.pnl >= 0 ? '+' : ''}{formatPrice(holding.pnl, holding.ticker, 0)}</span>
                        <span className="text-xs">({holding.pnl >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%)</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 transition-colors"
                          onClick={() => handleDeleteHolding(holding.ticker)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {portfolio.holdings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/50 mb-4">No holdings yet. Add your first stock to get started.</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-purple hover:opacity-90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>
        )}
      </motion.div>

      {/* Add Stock Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#141416] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gradient">Add Stock to Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">Stock Ticker</label>
              <Input
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                placeholder="e.g., AAPL"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Number of Shares</label>
              <Input
                type="number"
                value={newShares}
                onChange={(e) => setNewShares(e.target.value)}
                placeholder="e.g., 100"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Average Purchase Price</label>
              <Input
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="e.g., 150.00"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowAddDialog(false)}
                variant="outline"
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleAddStock}
                className="flex-1 bg-gradient-purple hover:opacity-90 text-white"
                disabled={!newTicker || !newShares || !newPrice}
              >
                <Check className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
