import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  LineChart, 
  Brain, 
  MessageSquare, 
  BarChart3, 
  Wallet,
  Settings,
  HelpCircle,
  User
} from 'lucide-react';
import type { User as UserType } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserType;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'charts', label: 'Charts', icon: LineChart },
  { id: 'predictions', label: 'AI Predictions', icon: Brain },
  { id: 'sentiment', label: 'Sentiment', icon: MessageSquare },
  { id: 'performance', label: 'Model Performance', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

export default function Sidebar({ activeTab, onTabChange, user }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-64 h-screen bg-[#0a0a0b] border-r border-white/5 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <motion.div 
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => onTabChange('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center glow-purple">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gradient">AI Stock</h2>
            <p className="text-xs text-white/50">Predictor Pro</p>
          </div>
        </motion.div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-white/30 uppercase tracking-wider mb-3 px-4">Main Menu</p>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-gradient-purple text-white shadow-lg shadow-[#6E56F8]/30' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-[#6E56F8]'}`} />
              <span className="font-medium">{item.label}</span>
              <motion.div
                animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
              />
            </motion.button>
          );
        })}

        <p className="text-xs text-white/30 uppercase tracking-wider mt-6 mb-3 px-4">Support</p>
        {bottomItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (menuItems.length + index), duration: 0.5 }}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-gradient-purple text-white shadow-lg shadow-[#6E56F8]/30' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-[#6E56F8]'}`} />
              <span className="font-medium">{item.label}</span>
              <motion.div
                animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
              />
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-gradient-purple text-white'
              : 'bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center">
            <span className="font-semibold text-white text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-medium text-white truncate text-sm">{user.name}</p>
            <p className="text-xs text-white/50 truncate">{user.plan} Plan</p>
          </div>
          <User className="w-4 h-4 text-white/40" />
        </motion.button>
      </div>
    </motion.aside>
  );
}
