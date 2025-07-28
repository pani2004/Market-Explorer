import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { TrendingUp, TrendingDown, Activity, Calendar, Eye, EyeOff, BarChart3 } from 'lucide-react';
import dayjs from 'dayjs';

const HistoricalPatterns = ({ instrument = 'BTCUSDT' }) => {
  const [showPatterns, setShowPatterns] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [patternSettings, setPatternSettings] = useState({
    volatilityThreshold: 5,
    volumeSpike: 2, // 2x normal volume
    priceChange: 10, // 10% price change
    timeWindow: 7 // days to look back
  });

  const orderBook = useSelector(state => state.orderBook);

  // Helper functions
  const calculateFrequency = (dates) => {
    if (dates.length < 2) return 'Rare';
    
    const sortedDates = dates.sort();
    const intervals = [];
    
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = dayjs(sortedDates[i]).diff(dayjs(sortedDates[i-1]), 'days');
      intervals.push(diff);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    if (avgInterval <= 7) return 'Weekly';
    if (avgInterval <= 30) return 'Monthly';
    if (avgInterval <= 90) return 'Quarterly';
    return 'Rare';
  };

  const calculateCorrelation = (x, y) => {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Pattern detection algorithms
  const detectPatterns = useMemo(() => {
    const patterns = [];
    const dates = Object.keys(orderBook.volatility || {}).sort();
    
    if (dates.length < patternSettings.timeWindow) return patterns;

    // 1. Volatility Spikes Pattern
    const volatilitySpikes = [];
    dates.forEach(date => {
      const volatility = orderBook.volatility[date]?.value || 0;
      if (volatility > patternSettings.volatilityThreshold) {
        volatilitySpikes.push({ date, value: volatility });
      }
    });

    if (volatilitySpikes.length >= 2) {
      patterns.push({
        id: 'volatility-spikes',
        name: 'Recurring Volatility Spikes',
        type: 'volatility',
        severity: 'high',
        occurrences: volatilitySpikes,
        description: `${volatilitySpikes.length} high volatility events detected`,
        icon: Activity,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        frequency: calculateFrequency(volatilitySpikes.map(s => s.date))
      });
    }

    // 2. Volume Anomalies Pattern
    const volumeData = dates.map(date => ({
      date,
      volume: orderBook.volume[date] || 0
    }));
    
    const avgVolume = volumeData.reduce((sum, d) => sum + d.volume, 0) / volumeData.length;
    const volumeSpikes = volumeData.filter(d => d.volume > avgVolume * patternSettings.volumeSpike);

    if (volumeSpikes.length >= 2) {
      patterns.push({
        id: 'volume-spikes',
        name: 'Volume Anomalies',
        type: 'volume',
        severity: 'medium',
        occurrences: volumeSpikes,
        description: `${volumeSpikes.length} unusual volume events (${patternSettings.volumeSpike}x average)`,
        icon: BarChart3,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        frequency: calculateFrequency(volumeSpikes.map(s => s.date))
      });
    }

    // 3. Price Movement Patterns
    const priceMovements = [];
    for (let i = 1; i < dates.length; i++) {
      const prevPrice = orderBook.close[dates[i-1]] || 0;
      const currentPrice = orderBook.close[dates[i]] || 0;
      
      if (prevPrice > 0) {
        const changePercent = Math.abs((currentPrice - prevPrice) / prevPrice * 100);
        if (changePercent > patternSettings.priceChange) {
          priceMovements.push({
            date: dates[i],
            change: changePercent,
            direction: currentPrice > prevPrice ? 'up' : 'down'
          });
        }
      }
    }

    if (priceMovements.length >= 2) {
      patterns.push({
        id: 'price-movements',
        name: 'Significant Price Movements',
        type: 'price',
        severity: 'medium',
        occurrences: priceMovements,
        description: `${priceMovements.length} major price changes (>${patternSettings.priceChange}%)`,
        icon: TrendingUp,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        frequency: calculateFrequency(priceMovements.map(s => s.date))
      });
    }

    // 4. Weekend Effect Pattern
    const weekendData = dates.filter(date => {
      const day = dayjs(date).day();
      return day === 0 || day === 6; // Sunday or Saturday
    });

    if (weekendData.length >= 2) {
      const weekendVolatility = weekendData.map(date => orderBook.volatility[date]?.value || 0);
      const weekdayVolatility = dates
        .filter(date => {
          const day = dayjs(date).day();
          return day > 0 && day < 6;
        })
        .map(date => orderBook.volatility[date]?.value || 0);

      const avgWeekendVol = weekendVolatility.reduce((a, b) => a + b, 0) / weekendVolatility.length;
      const avgWeekdayVol = weekdayVolatility.reduce((a, b) => a + b, 0) / weekdayVolatility.length;

      if (Math.abs(avgWeekendVol - avgWeekdayVol) > 1) {
        patterns.push({
          id: 'weekend-effect',
          name: 'Weekend Effect',
          type: 'temporal',
          severity: 'low',
          occurrences: weekendData.map(date => ({ date, volatility: orderBook.volatility[date]?.value || 0 })),
          description: `Weekend volatility ${avgWeekendVol > avgWeekdayVol ? 'higher' : 'lower'} than weekdays`,
          icon: Calendar,
          color: 'text-purple-500',
          bgColor: 'bg-purple-50',
          frequency: 'Weekly'
        });
      }
    }

    // 5. Correlation Patterns (Price vs Volume)
    const correlationData = dates.map(date => ({
      date,
      price: orderBook.close[date] || 0,
      volume: orderBook.volume[date] || 0
    })).filter(d => d.price > 0 && d.volume > 0);

    if (correlationData.length >= 5) {
      const correlation = calculateCorrelation(
        correlationData.map(d => d.price),
        correlationData.map(d => d.volume)
      );

      if (Math.abs(correlation) > 0.7) {
        patterns.push({
          id: 'price-volume-correlation',
          name: 'Price-Volume Correlation',
          type: 'correlation',
          severity: correlation > 0 ? 'medium' : 'high',
          occurrences: correlationData,
          description: `${correlation > 0 ? 'Positive' : 'Negative'} correlation (${(correlation * 100).toFixed(1)}%)`,
          icon: Activity,
          color: correlation > 0 ? 'text-green-500' : 'text-red-500',
          bgColor: correlation > 0 ? 'bg-green-50' : 'bg-red-50',
          frequency: 'Ongoing'
        });
      }
    }

    return patterns;
  }, [orderBook, patternSettings]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handlePatternsClick = (event) => {
    if (!showPatterns) {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 384 + window.scrollX // 384px = w-96
      });
    }
    setShowPatterns(!showPatterns);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={handlePatternsClick}
        className={`p-2 rounded-lg transition-colors ${
          detectPatterns.length > 0 
            ? 'bg-purple-100 text-purple-600' 
            : 'bg-gray-100 text-gray-600'
        } hover:bg-purple-200`}
        title="Historical Patterns"
      >
        {showPatterns ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        {detectPatterns.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {detectPatterns.length}
          </span>
        )}
      </button>

      {/* Patterns Panel Portal */}
      {showPatterns && createPortal(
        <div 
          className="fixed w-96 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl shadow-2xl shadow-black/50 z-[99999] max-h-96 overflow-y-auto"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
        >
          <div className="p-4 border-b border-slate-600/50">
            <h3 className="font-semibold text-purple-400">Historical Patterns</h3>
            <p className="text-sm text-slate-300">
              {detectPatterns.length} patterns detected for {instrument}
            </p>
          </div>

          {/* Pattern Settings */}
          <div className="p-3 border-b border-slate-600/30 bg-slate-700/50">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-slate-200">Detection Settings</summary>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300">Volatility Threshold:</label>
                  <input
                    type="number"
                    value={patternSettings.volatilityThreshold}
                    onChange={(e) => setPatternSettings(prev => ({ 
                      ...prev, 
                      volatilityThreshold: parseFloat(e.target.value) 
                    }))}
                    className="w-16 text-xs p-1 border border-slate-600 rounded bg-slate-700 text-slate-200"
                    step="0.5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300">Volume Spike (x):</label>
                  <input
                    type="number"
                    value={patternSettings.volumeSpike}
                    onChange={(e) => setPatternSettings(prev => ({ 
                      ...prev, 
                      volumeSpike: parseFloat(e.target.value) 
                    }))}
                    className="w-16 text-xs p-1 border border-slate-600 rounded bg-slate-700 text-slate-200"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300">Price Change (%):</label>
                  <input
                    type="number"
                    value={patternSettings.priceChange}
                    onChange={(e) => setPatternSettings(prev => ({ 
                      ...prev, 
                      priceChange: parseFloat(e.target.value) 
                    }))}
                    className="w-16 text-xs p-1 border border-slate-600 rounded bg-slate-700 text-slate-200"
                    step="1"
                  />
                </div>
              </div>
            </details>
          </div>

          {/* Patterns List */}
          <div className="divide-y divide-slate-600/30">
            {detectPatterns.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No patterns detected</p>
                <p className="text-xs">Try adjusting detection settings</p>
              </div>
            ) : (
              detectPatterns.map(pattern => {
                const PatternIcon = pattern.icon;
                return (
                  <div key={pattern.id} className="p-3 hover:bg-slate-700/50 cursor-pointer">
                    <div 
                      className="flex items-start space-x-3"
                      onClick={() => setSelectedPattern(
                        selectedPattern?.id === pattern.id ? null : pattern
                      )}
                    >
                      <PatternIcon className={`w-5 h-5 mt-0.5 ${pattern.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-slate-200">{pattern.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(pattern.severity)}`}>
                            {pattern.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{pattern.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            Frequency: {pattern.frequency}
                          </span>
                          <span className="text-xs text-slate-500">
                            {pattern.occurrences.length} occurrences
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pattern Details */}
                    {selectedPattern?.id === pattern.id && (
                      <div className="mt-3 p-3 bg-slate-700/50 rounded">
                        <h5 className="font-medium text-sm mb-2 text-slate-200">Recent Occurrences</h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {pattern.occurrences.slice(-5).map((occurrence, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-slate-300">{dayjs(occurrence.date).format('MMM DD, YYYY')}</span>
                              <span className="text-slate-400">
                                {occurrence.value && `${occurrence.value.toFixed(2)}`}
                                {occurrence.change && `${occurrence.change.toFixed(1)}%`}
                                {occurrence.volume && `${(occurrence.volume / 1000000).toFixed(1)}M`}
                                {occurrence.volatility && `${occurrence.volatility.toFixed(2)}%`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HistoricalPatterns;
