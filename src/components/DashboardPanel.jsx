
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';


const DashboardPanel = ({ date, onClose }) => {
  const orderBook = useSelector(state => state.orderBook);
  const [timeframe, setTimeframe] = useState('day'); 
  if (!date) return null;
  const key = date.format('YYYY-MM-DD');
  const volatility = orderBook.volatility[key];
  const volume = orderBook.volume[key];
  const close = orderBook.close[key];

  // Daily data (single day)
  const dailyData = [{
    date: date.format('ddd D'),
    close,
    volume,
    volatility: volatility?.value,
  }];

  // Weekly data (Sun-Sat)
  const weekStart = date.clone().startOf('week');
  const weekData = [];
  for (let i = 0; i < 7; i++) {
    const d = weekStart.clone().add(i, 'day');
    const dKey = d.format('YYYY-MM-DD');
    weekData.push({
      date: d.format('ddd D'),
      close: orderBook.close[dKey],
      volume: orderBook.volume[dKey],
      volatility: orderBook.volatility[dKey]?.value,
    });
  }

  // Monthly data (entire month)
  const monthStart = date.clone().startOf('month');
  const daysInMonth = date.daysInMonth();
  const monthData = [];
  for (let i = 0; i < daysInMonth; i++) {
    const d = monthStart.clone().add(i, 'day');
    const dKey = d.format('YYYY-MM-DD');
    monthData.push({
      date: d.format('MMM D'),
      close: orderBook.close[dKey],
      volume: orderBook.volume[dKey],
      volatility: orderBook.volatility[dKey]?.value,
    });
  }

  // Aggregates for week/month
  const aggregate = (data) => {
    const closes = data.map(d => d.close).filter(v => v != null);
    const volumes = data.map(d => d.volume).filter(v => v != null);
    const vols = data.map(d => d.volatility).filter(v => v != null);
    return {
      avgVolatility: vols.length ? (vols.reduce((a, b) => a + b, 0) / vols.length) : null,
      totalVolume: volumes.length ? volumes.reduce((a, b) => a + b, 0) : null,
      priceRange: closes.length ? `${Math.min(...closes).toLocaleString()} - ${Math.max(...closes).toLocaleString()}` : 'N/A',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl p-0 relative flex flex-col md:flex-row overflow-auto max-h-[90vh]">
        <button className="absolute top-3 right-4 text-3xl text-gray-400 hover:text-black z-10" onClick={onClose}>&times;</button>
        {/* Left: Metrics and Summary */}
        <div className="md:w-1/3 w-full p-6 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex gap-2 mb-4">
            <button className={`px-3 py-1 rounded font-semibold ${timeframe === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setTimeframe('day')}>Day</button>
            <button className={`px-3 py-1 rounded font-semibold ${timeframe === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setTimeframe('week')}>Week</button>
            <button className={`px-3 py-1 rounded font-semibold ${timeframe === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setTimeframe('month')}>Month</button>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-blue-900">{title}</h2>
          <div className="text-gray-500 mb-4">{subtitle}</div>
          {timeframe === 'day' && (
            <>
              <div className="mb-4">
                <div className="text-gray-600">Close</div>
                <div className="text-2xl font-bold text-blue-700">{close?.toLocaleString() ?? 'N/A'}</div>
              </div>
              <div className="mb-2 flex flex-col gap-1">
                <div><span className="text-gray-600">Volume:</span> <b>{volume?.toLocaleString() ?? 'N/A'}</b></div>
                <div><span className="text-gray-600">Volatility:</span> <b>{volatility?.level ?? 'N/A'}</b> {volatility?.value ? `(${volatility.value.toFixed(2)} σ)` : ''} <span className="text-xs text-gray-400">(std dev)</span></div>
                <div><span className="text-gray-600">Performance:</span> <b className={close && orderBook.close[date.clone().subtract(1, 'day').format('YYYY-MM-DD')] && close > orderBook.close[date.clone().subtract(1, 'day').format('YYYY-MM-DD')] ? 'text-green-600' : 'text-red-600'}>
                  {close && orderBook.close[date.clone().subtract(1, 'day').format('YYYY-MM-DD')] ? (((close - orderBook.close[date.clone().subtract(1, 'day').format('YYYY-MM-DD')]) / orderBook.close[date.clone().subtract(1, 'day').format('YYYY-MM-DD')]) * 100).toFixed(2) + '%' : 'N/A'}
                </b></div>
              </div>
            </>
          )}
          {timeframe !== 'day' && agg && (
            <div className="mt-2">
              <div className="font-semibold mb-2 text-blue-900">{subtitle} Summary</div>
              <ul className="text-sm text-gray-700 list-disc ml-5">
                <li>Avg Volatility: <b>{agg.avgVolatility != null ? agg.avgVolatility.toFixed(2) + ' σ' : 'N/A'}</b> <span className="text-xs text-gray-400">(std dev)</span></li>
                <li>Total Volume: <b>{agg.totalVolume != null ? agg.totalVolume.toLocaleString() : 'N/A'}</b></li>
                <li>Price Range: <b>{agg.priceRange}</b></li>
                <li>Performance: <b>{agg.perf}</b></li>
              </ul>
            </div>
          )}
        </div>
        {/* Right: Charts */}
        <div className="md:w-2/3 w-full p-6 flex flex-col gap-8 bg-white">
          {/* Price Line Chart */}
          <div>
            <div className="font-semibold mb-1 text-blue-900">Price (Close) - {subtitle}</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#2563eb" name="Close" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Volume Bar Chart */}
          <div>
            <div className="font-semibold mb-1 text-blue-900">Volume - {subtitle}</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Bar dataKey="volume" fill="#60a5fa" name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Volatility Area Chart */}
          <div>
            <div className="font-semibold mb-1 text-blue-900">Volatility - {subtitle}</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Area type="monotone" dataKey="volatility" stroke="#f59e42" fill="#fde68a" name="Volatility" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
