import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

const DashboardPanel = ({ date, onClose, selectedDates = [], instrument }) => {
  const orderBook = useSelector(state => state.orderBook);
  const [timeframe, setTimeframe] = useState('day');
  const [metric, setMetric] = useState('performance');
  
  const getInstrumentDisplayName = (symbol) => {
    const instrumentMap = {
      'BTCUSDT': 'BTCUSDT (Bitcoin)',
      'ETHUSDT': 'ETHUSDT (Ethereum)', 
      'BNBUSDT': 'BNBUSDT (Binance Coin)',
      'ADAUSDT': 'ADAUSDT (Cardano)',
      'SOLUSDT': 'SOLUSDT (Solana)',
      'XRPUSDT': 'XRPUSDT (Ripple)',
      'DOTUSDT': 'DOTUSDT (Polkadot)',
      'DOGEUSDT': 'DOGEUSDT (Dogecoin)',
      'AVAXUSDT': 'AVAXUSDT (Avalanche)',
      'LINKUSDT': 'LINKUSDT (Chainlink)',
      'MATICUSDT': 'MATICUSDT (Polygon)',
      'LTCUSDT': 'LTCUSDT (Litecoin)',
      'UNIUSDT': 'UNIUSDT (Uniswap)',
      'ATOMUSDT': 'ATOMUSDT (Cosmos)',
      'FTMUSDT': 'FTMUSDT (Fantom)'
    };
    return instrumentMap[symbol] || symbol || 'Trading Pair';
  };
  
  if (!date) return null;
  
  const key = date.format('YYYY-MM-DD');
  const ob = orderBook;
  const volatility = ob.volatility ? ob.volatility[key] : undefined;
  const volume = ob.volume ? ob.volume[key] : undefined;
  const close = ob.close ? ob.close[key] : undefined;
  const open = ob.open ? ob.open[key] : undefined;
  const high = ob.high ? ob.high[key] : undefined;
  const low = ob.low ? ob.low[key] : undefined;
  const liquidity = ob.liquidity ? ob.liquidity[key] : undefined;

  const dailyData = [{
    date: date.format('ddd D'),
    open, high, low, close, volume,
    volatility: volatility?.value,
    liquidity,
  }];

  const weekStart = date.clone().startOf('week');
  const weekData = [];
  for (let i = 0; i < 7; i++) {
    const d = weekStart.clone().add(i, 'day');
    const dKey = d.format('YYYY-MM-DD');
    weekData.push({
      date: d.format('ddd D'),
      open: ob.open ? ob.open[dKey] : undefined,
      high: ob.high ? ob.high[dKey] : undefined,
      low: ob.low ? ob.low[dKey] : undefined,
      close: ob.close ? ob.close[dKey] : undefined,
      volume: ob.volume ? ob.volume[dKey] : undefined,
      volatility: ob.volatility ? ob.volatility[dKey]?.value : undefined,
      liquidity: ob.liquidity ? ob.liquidity[dKey] : undefined,
    });
  }

  const monthStart = date.clone().startOf('month');
  const daysInMonth = date.daysInMonth();
  const monthData = [];
  for (let i = 0; i < daysInMonth; i++) {
    const d = monthStart.clone().add(i, 'day');
    const dKey = d.format('YYYY-MM-DD');
    monthData.push({
      date: d.format('MMM D'),
      open: ob.open ? ob.open[dKey] : undefined,
      high: ob.high ? ob.high[dKey] : undefined,
      low: ob.low ? ob.low[dKey] : undefined,
      close: ob.close ? ob.close[dKey] : undefined,
      volume: ob.volume ? ob.volume[dKey] : undefined,
      volatility: ob.volatility ? ob.volatility[dKey]?.value : undefined,
      liquidity: ob.liquidity ? ob.liquidity[dKey] : undefined,
    });
  }

  // Technical indicators
  function calcSMA(data, period = 7) {
    const closes = data.map(d => d.close);
    return closes.map((v, i, arr) => {
      if (i < period - 1 || arr[i] == null) return null;
      const window = arr.slice(i - period + 1, i + 1);
      if (window.some(x => x == null)) return null;
      return window.reduce((a, b) => a + b, 0) / period;
    });
  }

  function calcRSI(data, period = 14) {
    const closes = data.map(d => d.close);
    let rsis = Array(closes.length).fill(null);
    for (let i = period; i < closes.length; i++) {
      let gains = 0, losses = 0;
      for (let j = i - period + 1; j <= i; j++) {
        if (closes[j] == null || closes[j - 1] == null) continue;
        const diff = closes[j] - closes[j - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      if (gains + losses === 0) rsis[i] = 50;
      else {
        const rs = gains / (losses || 1e-8);
        rsis[i] = 100 - 100 / (1 + rs);
      }
    }
    return rsis;
  }

  const aggregate = (data) => {
    const closes = data.map(d => d.close).filter(v => v != null);
    const opens = data.map(d => d.open).filter(v => v != null);
    const highs = data.map(d => d.high).filter(v => v != null);
    const lows = data.map(d => d.low).filter(v => v != null);
    const volumes = data.map(d => d.volume).filter(v => v != null);
    const vols = data.map(d => d.volatility).filter(v => v != null);
    return {
      avgVolatility: vols.length ? (vols.reduce((a, b) => a + b, 0) / vols.length) : null,
      totalVolume: volumes.length ? volumes.reduce((a, b) => a + b, 0) : null,
      priceRange: closes.length ? `${Math.min(...closes).toLocaleString()} - ${Math.max(...closes).toLocaleString()}` : 'N/A',
      open: opens.length ? opens[0] : null,
      close: closes.length ? closes[closes.length - 1] : null,
      high: highs.length ? Math.max(...highs) : null,
      low: lows.length ? Math.min(...lows) : null,
      perf: closes.length > 1 ? (((closes[closes.length - 1] - closes[0]) / closes[0]) * 100).toFixed(2) + '%' : 'N/A',
    };
  };
  const weekAgg = aggregate(weekData);
  const monthAgg = aggregate(monthData);

  // Timeframe selection
  let chartData = dailyData, agg = null, title = '', subtitle = '';
  if (timeframe === 'day') {
    chartData = dailyData;
    agg = null;
    title = date.format('dddd, MMM D, YYYY');
    subtitle = 'Daily Metrics';
  } else if (timeframe === 'week') {
    chartData = weekData;
    agg = weekAgg;
    title = `${weekStart.format('MMM D')} - ${weekStart.clone().add(6, 'day').format('MMM D, YYYY')}`;
    subtitle = 'Weekly Summary';
  } else if (timeframe === 'month') {
    chartData = monthData;
    agg = monthAgg;
    title = date.format('MMMM YYYY');
    subtitle = 'Monthly Overview';
  }

  // Chart metric selection
  let mainLineKey = 'close';
  let barKey = 'volume';
  let areaKey = 'volatility';
  let mainLineName = 'Close';
  let barName = 'Volume';
  let areaName = 'Volatility';
  let yAxisLabel = '';
  if (metric === 'liquidity') {
    mainLineKey = 'liquidity';
    barKey = 'liquidity';
    areaKey = 'liquidity';
    mainLineName = 'Liquidity';
    barName = 'Liquidity';
    areaName = 'Liquidity';
    yAxisLabel = 'Liquidity';
  } else if (metric === 'volatility') {
    mainLineKey = 'volatility';
    barKey = 'volatility';
    areaKey = 'volatility';
    mainLineName = 'Volatility';
    barName = 'Volatility';
    areaName = 'Volatility';
    yAxisLabel = 'Volatility';
  }

  const sma7 = calcSMA(chartData, 7);
  const rsi14 = calcRSI(chartData, 14);
  const formatYAxis = (val) => val != null ? val.toLocaleString() : '';

  return (
    <div className="w-full min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              {getInstrumentDisplayName(instrument)}
            </h1>
            <div className="text-sm text-gray-400">{title}</div>
          </div>
          <button 
            className="text-gray-400 hover:text-white text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        {/* Controls Bar */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Timeframe Tabs */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeframe === 'day' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`} 
                onClick={() => setTimeframe('day')}
              >
                Day
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeframe === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`} 
                onClick={() => setTimeframe('week')}
              >
                Week
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeframe === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`} 
                onClick={() => setTimeframe('month')}
              >
                Month
              </button>
            </div>
            
            {/* Metric Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Metric:</label>
              <select 
                value={metric} 
                onChange={e => setMetric(e.target.value)} 
                className="rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="performance">Performance</option>
                <option value="volatility">Volatility</option>
                <option value="liquidity">Liquidity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        {/* Left Sidebar - Key Metrics */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">{subtitle}</h2>
            
            {timeframe === 'day' && (
              <div className="space-y-4">
                {/* OHLC Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-blue-400 uppercase tracking-wide">Open</div>
                    <div className="text-xl font-bold text-blue-300">{open?.toLocaleString() ?? 'N/A'}</div>
                  </div>
                  <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-green-400 uppercase tracking-wide">High</div>
                    <div className="text-xl font-bold text-green-300">{high?.toLocaleString() ?? 'N/A'}</div>
                  </div>
                  <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-red-400 uppercase tracking-wide">Low</div>
                    <div className="text-xl font-bold text-red-300">{low?.toLocaleString() ?? 'N/A'}</div>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Close</div>
                    <div className="text-xl font-bold text-white">{close?.toLocaleString() ?? 'N/A'}</div>
                  </div>
                </div>
                
                {/* Additional Metrics */}
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Volume</span>
                    <span className="font-semibold text-white">{volume?.toLocaleString() ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Volatility</span>
                    <span className="font-semibold text-white">
                      {volatility?.level ?? 'N/A'} 
                      {volatility?.value && <span className="text-xs text-gray-500 ml-1">({volatility.value.toFixed(2)} σ)</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">7-day SMA</span>
                    <span className="font-semibold text-white">{sma7[sma7.length - 1] != null ? sma7[sma7.length - 1].toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">14-day RSI</span>
                    <span className="font-semibold text-white">{rsi14[rsi14.length - 1] != null ? rsi14[rsi14.length - 1].toFixed(2) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
            
            {timeframe !== 'day' && agg && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Open</div>
                    <div className="text-lg font-bold text-white">{agg.open != null ? agg.open.toLocaleString() : 'N/A'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Close</div>
                    <div className="text-lg font-bold text-white">{agg.close != null ? agg.close.toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t border-gray-700 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">High</span>
                    <span className="font-semibold text-green-400">{agg.high != null ? agg.high.toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Low</span>
                    <span className="font-semibold text-red-400">{agg.low != null ? agg.low.toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Performance</span>
                    <span className="font-semibold text-white">{agg.perf}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Volume</span>
                    <span className="font-semibold text-white">{agg.totalVolume != null ? agg.totalVolume.toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Volatility</span>
                    <span className="font-semibold text-white">{agg.avgVolatility != null ? agg.avgVolatility.toFixed(2) + ' σ' : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Content - Charts */}
        <div className="flex-1 space-y-6">
          {/* Main Price Chart */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{mainLineName}{mainLineKey === 'close' ? ' & 7-day SMA' : ''}</h3>
              <div className="text-sm text-gray-400">{subtitle}</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData.map((d, i) => ({ ...d, sma7: sma7[i] }))} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} tickFormatter={formatYAxis} />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <RechartsTooltip 
                  formatter={formatYAxis}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }}
                />
                <Legend />
                <Line type="monotone" dataKey={mainLineKey} stroke="#2563eb" strokeWidth={2} name={mainLineName} dot={{ r: 4 }} />
                {mainLineKey === 'close' && <Line type="monotone" dataKey="sma7" stroke="#f59e0b" strokeWidth={1.5} name="7-day SMA" dot={false} strokeDasharray="5 5" />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Secondary Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RSI Chart */}
            {metric !== 'liquidity' && (
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">14-day RSI</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData.map((d, i) => ({ ...d, rsi14: rsi14[i] }))} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }} />
                    <Line type="monotone" dataKey="rsi14" stroke="#10b981" strokeWidth={2} name="14-day RSI" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Volume Chart */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{barName}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatYAxis} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <RechartsTooltip 
                    formatter={formatYAxis}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }}
                  />
                  <Bar dataKey={barKey} fill="#3b82f6" name={barName} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area Chart */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{areaName} Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatYAxis} />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <RechartsTooltip 
                  formatter={formatYAxis}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }}
                />
                <Area type="monotone" dataKey={areaKey} stroke="#f59e0b" fill="#fef3c7" name={areaName} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;