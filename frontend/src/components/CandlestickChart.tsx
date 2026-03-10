import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import type { StockData, ChartType } from '../types';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  BarChart3,
  Layers,
  Info,
  CandlestickChart as CandleIcon,
  LineChart as LineIcon,
  BarChart as BarIcon
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CandlestickChartProps {
  data: StockData | null;
  selectedStock: string;
}

type Indicator = 'volume' | 'rsi' | 'macd' | 'bollinger' | 'ma';

export default function CandlestickChart({ data, selectedStock }: CandlestickChartProps) {
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([
    'volume', 'ma'
  ]);

  if (!data) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <p className="text-white/50">Loading chart data...</p>
      </div>
    );
  }

  const toggleIndicator = (indicator: Indicator) => {
    setActiveIndicators(prev => 
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  // Prepare chart data based on chart type
  const chartData = useMemo(() => {
    const dates = data.candleData.map(d => d.date);
    const closes = data.candleData.map(d => d.close);
    const opens = data.candleData.map(d => d.open);
    const highs = data.candleData.map(d => d.high);
    const lows = data.candleData.map(d => d.low);

    const traces: any[] = [];

    // Main price trace based on chart type
    if (chartType === 'candlestick') {
      traces.push({
        x: dates,
        open: opens,
        high: highs,
        low: lows,
        close: closes,
        type: 'candlestick',
        name: selectedStock,
        increasing: { line: { color: '#22C55E' }, fillcolor: '#22C55E' },
        decreasing: { line: { color: '#EF4444' }, fillcolor: '#EF4444' },
        yaxis: 'y',
      });
    } else if (chartType === 'bar') {
      // OHLC Bar chart
      traces.push({
        x: dates,
        y: closes,
        type: 'bar',
        name: 'Close Price',
        marker: { 
          color: data.candleData.map((d, i) => 
            i === 0 ? '#6E56F8' : d.close >= data.candleData[i - 1].close ? '#22C55E' : '#EF4444'
          )
        },
        yaxis: 'y',
      });
    } else if (chartType === 'line') {
      // Line chart with area fill
      traces.push({
        x: dates,
        y: closes,
        type: 'scatter',
        mode: 'lines',
        name: selectedStock,
        line: { color: '#6E56F8', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(110, 86, 248, 0.2)',
        yaxis: 'y',
      });
    }

    // Volume bars
    if (activeIndicators.includes('volume')) {
      const colors = data.candleData.map((d, i) => 
        i === 0 ? '#6E56F8' : d.close >= data.candleData[i - 1].close ? '#22C55E40' : '#EF444440'
      );
      
      traces.push({
        x: dates,
        y: data.candleData.map(d => d.volume),
        type: 'bar',
        name: 'Volume',
        marker: { color: colors },
        yaxis: 'y2',
        showlegend: false,
      });
    }

    // Moving Average
    if (activeIndicators.includes('ma')) {
      traces.push({
        x: dates,
        y: data.movingAverage,
        type: 'scatter',
        mode: 'lines',
        name: 'MA (20)',
        line: { color: '#C084FC', width: 2 },
        yaxis: 'y',
      });
    }

    // Bollinger Bands
    if (activeIndicators.includes('bollinger')) {
      traces.push(
        {
          x: dates,
          y: data.bollingerBands.upper,
          type: 'scatter',
          mode: 'lines',
          name: 'BB Upper',
          line: { color: '#F59E0B', width: 1, dash: 'dash' },
          yaxis: 'y',
        },
        {
          x: dates,
          y: data.bollingerBands.middle,
          type: 'scatter',
          mode: 'lines',
          name: 'BB Middle',
          line: { color: '#F59E0B', width: 1 },
          yaxis: 'y',
        },
        {
          x: dates,
          y: data.bollingerBands.lower,
          type: 'scatter',
          mode: 'lines',
          name: 'BB Lower',
          line: { color: '#F59E0B', width: 1, dash: 'dash' },
          yaxis: 'y',
          fill: 'tonexty',
          fillcolor: 'rgba(245, 158, 11, 0.1)',
        }
      );
    }

    // RSI
    if (activeIndicators.includes('rsi')) {
      traces.push({
        x: dates,
        y: data.rsi,
        type: 'scatter',
        mode: 'lines',
        name: 'RSI (14)',
        line: { color: '#6E56F8', width: 2 },
        yaxis: 'y3',
      });
    }

    // MACD
    if (activeIndicators.includes('macd')) {
      traces.push(
        {
          x: dates,
          y: data.macd.macd,
          type: 'scatter',
          mode: 'lines',
          name: 'MACD',
          line: { color: '#22C55E', width: 2 },
          yaxis: 'y4',
        },
        {
          x: dates,
          y: data.macd.signal,
          type: 'scatter',
          mode: 'lines',
          name: 'Signal',
          line: { color: '#EF4444', width: 2 },
          yaxis: 'y4',
        },
        {
          x: dates,
          y: data.macd.histogram,
          type: 'bar',
          name: 'Histogram',
          marker: { 
            color: data.macd.histogram.map(v => v >= 0 ? '#22C55E60' : '#EF444460') 
          },
          yaxis: 'y4',
        }
      );
    }

    return traces;
  }, [data, activeIndicators, selectedStock, chartType]);

  const layout = useMemo(() => {
    const hasRSI = activeIndicators.includes('rsi');
    const hasMACD = activeIndicators.includes('macd');
    const hasVolume = activeIndicators.includes('volume');

    let domainY = 1;
    let domainY2 = 0;
    let domainY3 = 0;
    let domainY4 = 0;

    if (hasRSI && hasMACD && hasVolume) {
      domainY = 0.5;
      domainY2 = 0.35;
      domainY3 = 0.2;
      domainY4 = 0.05;
    } else if (hasRSI && hasMACD) {
      domainY = 0.6;
      domainY3 = 0.35;
      domainY4 = 0.1;
    } else if (hasRSI && hasVolume) {
      domainY = 0.6;
      domainY2 = 0.45;
      domainY3 = 0.2;
    } else if (hasMACD && hasVolume) {
      domainY = 0.6;
      domainY2 = 0.45;
      domainY4 = 0.2;
    } else if (hasRSI) {
      domainY = 0.7;
      domainY3 = 0.3;
    } else if (hasMACD) {
      domainY = 0.7;
      domainY4 = 0.3;
    } else if (hasVolume) {
      domainY = 0.75;
      domainY2 = 0.5;
    }

    const layoutConfig: any = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: '#ffffff', family: 'Inter Tight, sans-serif' },
      showlegend: true,
      legend: {
        x: 0,
        y: 1.1,
        orientation: 'h',
        font: { color: '#ffffff' },
        bgcolor: 'rgba(0,0,0,0.5)',
      },
      xaxis: {
        rangeslider: { visible: false },
        gridcolor: 'rgba(255,255,255,0.05)',
        tickfont: { color: '#71717a' },
        domain: [0, 1],
      },
      yaxis: {
        title: 'Price',
        side: 'right' as const,
        gridcolor: 'rgba(255,255,255,0.05)',
        tickfont: { color: '#71717a' },
        domain: [1 - domainY, 1],
      },
      margin: { t: 60, b: 40, l: 60, r: 60 },
      hovermode: 'x unified',
    };

    if (hasVolume) {
      layoutConfig.yaxis2 = {
        title: 'Volume',
        side: 'left' as const,
        overlaying: 'y',
        showgrid: false,
        tickfont: { color: '#71717a' },
        domain: [1 - domainY, 1 - domainY + domainY2],
      };
    }

    if (hasRSI) {
      layoutConfig.yaxis3 = {
        title: 'RSI',
        side: 'right' as const,
        overlaying: 'y',
        showgrid: true,
        gridcolor: 'rgba(255,255,255,0.05)',
        tickfont: { color: '#71717a' },
        domain: [0, domainY3],
        range: [0, 100],
      };
    }

    if (hasMACD) {
      layoutConfig.yaxis4 = {
        title: 'MACD',
        side: 'right' as const,
        overlaying: 'y',
        showgrid: true,
        gridcolor: 'rgba(255,255,255,0.05)',
        tickfont: { color: '#71717a' },
        domain: [0, domainY4 || 0.25],
      };
    }

    return layoutConfig;
  }, [activeIndicators]);

  const chartTypes = [
    { id: 'candlestick', label: 'Candlestick', icon: CandleIcon, tooltip: 'OHLC candlestick chart' },
    { id: 'bar', label: 'Bar', icon: BarIcon, tooltip: 'OHLC bar chart' },
    { id: 'line', label: 'Line', icon: LineIcon, tooltip: 'Line chart with area fill' },
  ];

  const indicators = [
    { id: 'volume', label: 'Volume', icon: Layers, tooltip: 'Trading volume bars' },
    { id: 'ma', label: 'Moving Average', icon: TrendingUp, tooltip: '20-period Simple Moving Average' },
    { id: 'bollinger', label: 'Bollinger Bands', icon: Target, tooltip: 'Bollinger Bands (20, 2)' },
    { id: 'rsi', label: 'RSI', icon: Activity, tooltip: 'Relative Strength Index (14)' },
    { id: 'macd', label: 'MACD', icon: BarChart3, tooltip: 'Moving Average Convergence Divergence' },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Chart Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#6E56F8]" />
            <span className="text-sm font-medium text-white">Chart Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {chartTypes.map((type) => (
              <Tooltip key={type.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setChartType(type.id as ChartType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                      chartType === type.id
                        ? 'bg-[#6E56F8] text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  className="bg-[#141416] border-white/10 text-white"
                >
                  <p className="text-xs">{type.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </motion.div>

        {/* Indicator Toggles */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#6E56F8]" />
            <span className="text-sm font-medium text-white">Technical Indicators</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {indicators.map((indicator) => (
              <Tooltip key={indicator.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleIndicator(indicator.id as Indicator)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeIndicators.includes(indicator.id as Indicator)
                        ? 'bg-[#6E56F8] text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <indicator.icon className="w-4 h-4" />
                    {indicator.label}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  className="bg-[#141416] border-white/10 text-white"
                >
                  <p className="text-xs">{indicator.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedStock} Price Chart</h3>
              <p className="text-sm text-white/50">
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart with technical analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/40">Scroll to zoom, drag to pan</span>
            </div>
          </div>
          
          <div className="h-[500px]">
            <Plot
              data={chartData}
              layout={layout}
              config={{ 
                responsive: true, 
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d']
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </motion.div>

        {/* Indicator Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Current RSI', 
              value: data.rsi[data.rsi.length - 1]?.toFixed(1) || 'N/A',
              status: data.rsi[data.rsi.length - 1] > 70 ? 'Overbought' : 
                      data.rsi[data.rsi.length - 1] < 30 ? 'Oversold' : 'Neutral',
              color: data.rsi[data.rsi.length - 1] > 70 ? 'text-red-400' : 
                     data.rsi[data.rsi.length - 1] < 30 ? 'text-green-400' : 'text-yellow-400'
            },
            { 
              label: 'MACD Signal', 
              value: data.macd.macd[data.macd.macd.length - 1]?.toFixed(2) || 'N/A',
              status: data.macd.macd[data.macd.macd.length - 1] > data.macd.signal[data.macd.signal.length - 1] ? 'Bullish' : 'Bearish',
              color: data.macd.macd[data.macd.macd.length - 1] > data.macd.signal[data.macd.signal.length - 1] ? 'text-green-400' : 'text-red-400'
            },
            { 
              label: 'BB Position', 
              value: ((data.price - data.bollingerBands.lower[data.bollingerBands.lower.length - 1]) / 
                     (data.bollingerBands.upper[data.bollingerBands.upper.length - 1] - data.bollingerBands.lower[data.bollingerBands.lower.length - 1]) * 100).toFixed(1) + '%',
              status: data.price > data.bollingerBands.upper[data.bollingerBands.upper.length - 1] ? 'Above Upper' :
                      data.price < data.bollingerBands.lower[data.bollingerBands.lower.length - 1] ? 'Below Lower' : 'Within Bands',
              color: data.price > data.bollingerBands.upper[data.bollingerBands.upper.length - 1] ? 'text-red-400' :
                    data.price < data.bollingerBands.lower[data.bollingerBands.lower.length - 1] ? 'text-green-400' : 'text-yellow-400'
            },
            { 
              label: 'MA Trend', 
              value: data.price > data.movingAverage[data.movingAverage.length - 1] ? 'Above MA' : 'Below MA',
              status: data.price > data.movingAverage[data.movingAverage.length - 1] ? 'Bullish' : 'Bearish',
              color: data.price > data.movingAverage[data.movingAverage.length - 1] ? 'text-green-400' : 'text-red-400'
            },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="glass-card p-4"
            >
              <p className="text-xs text-white/50 mb-1">{item.label}</p>
              <p className="font-bold text-white">{item.value}</p>
              <p className={`text-xs ${item.color}`}>{item.status}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
