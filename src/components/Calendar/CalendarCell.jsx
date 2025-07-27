import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3 } from 'lucide-react';

const CalendarCell = ({ date, selected, focused, onClick, onKeyDown, onCellClick }) => {
  const today = new Date();
  const isFuture = date && date.toDate() > today;
  const volatility = useSelector(state => {
    if (!date) return null;
    const key = date.format('YYYY-MM-DD');
    return state.orderBook.volatility[key] || null;
  });

  const orderBook = useSelector(state => state.orderBook);
  let volume = 0;
  if (!isFuture && orderBook && orderBook.volume) {
    const key = date.format('YYYY-MM-DD');
    volume = orderBook.volume[key] || 0;
    if (volume > 100000) volume = 100000;
  }

  // Performance: % change in close price from previous day
  let perf = null;
  if (!isFuture && date && orderBook && orderBook.close) {
    const key = date.format('YYYY-MM-DD');
    const prevKey = date.clone().subtract(1, 'day').format('YYYY-MM-DD');
    const todayClose = orderBook.close[key];
    const prevClose = orderBook.close[prevKey];
    if (todayClose != null && prevClose != null && prevClose !== 0) {
      perf = ((todayClose - prevClose) / Math.abs(prevClose)) * 100;
    }
  }

  // Enhanced styling with GoQuant theme
  let bgColor = 'bg-slate-800/60 border-slate-600/30';
  let textColor = 'text-slate-300';
  
  if (selected) {
    bgColor = 'bg-blue-600/90 border-blue-500/60';
    textColor = 'text-white';
  } else if (isFuture) {
    bgColor = 'bg-slate-700/40 border-slate-600/20';
    textColor = 'text-slate-500';
  } else if (volatility) {
    if (volatility.level === 'low') {
      bgColor = 'bg-emerald-500/20 border-emerald-400/40';
      textColor = 'text-emerald-100';
    } else if (volatility.level === 'medium') {
      bgColor = 'bg-amber-500/20 border-amber-400/40';
      textColor = 'text-amber-100';
    } else if (volatility.level === 'high') {
      bgColor = 'bg-red-500/20 border-red-400/40';
      textColor = 'text-red-100';
    }
  }

  const [showTooltip, setShowTooltip] = useState(false);

  // Format volume for display
  const formatVolume = (vol) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(0) + 'K';
    return vol.toString();
  };

  // Get performance icon and color
  const getPerformanceDisplay = (perf) => {
    if (perf > 0) {
      return {
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20'
      };
    } else if (perf < 0) {
      return {
        icon: <TrendingDown className="w-3 h-3" />,
        color: 'text-red-400',
        bg: 'bg-red-500/20'
      };
    } else {
      return {
        icon: <Minus className="w-3 h-3" />,
        color: 'text-slate-400',
        bg: 'bg-slate-500/20'
      };
    }
  };

  return (
    <div
      role="gridcell"
      aria-selected={selected}
      aria-label={date ? date.format('dddd, MMMM D, YYYY') : 'Empty'}
      tabIndex={focused ? 0 : -1}
      className={`
        relative min-h-[80px] sm:min-h-[90px] md:min-h-[100px] lg:min-h-[120px] 
        flex flex-col justify-between p-2 sm:p-3 md:p-4 
        rounded-lg sm:rounded-xl cursor-pointer 
        select-none transition-all duration-300 ease-out border backdrop-blur-sm
        ${bgColor} ${textColor}
        ${focused ? 'ring-1 sm:ring-2 ring-blue-400/60 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900' : ''}
        ${!isFuture ? 'hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20' : ''}
        group
      `}
      onClick={e => { onClick && onClick(e); if (onCellClick && date && !isFuture) onCellClick(date); }}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Date number */}
      <div className="flex justify-between items-start mb-1 sm:mb-2">
        <span className="text-sm sm:text-base md:text-lg font-bold leading-none">{date ? date.date() : ''}</span>
        {!isFuture && volatility && (
          <Activity className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
            volatility.level === 'high' ? 'text-red-400' : 
            volatility.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
          }`} />
        )}
      </div>

      {/* Market data section */}
      <div className="flex flex-col gap-1">
        {/* Volatility indicator */}
        {!isFuture && volatility && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Vol:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              volatility.level === 'high' ? 'bg-red-500/30 text-red-200' :
              volatility.level === 'medium' ? 'bg-amber-500/30 text-amber-200' :
              'bg-emerald-500/30 text-emerald-200'
            }`}>
              {volatility.level}
            </span>
          </div>
        )}

        {/* Volume bar */}
        {!isFuture && volume > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Vol:</span>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-blue-400" />
              <span className="text-blue-200 font-medium">{formatVolume(volume)}</span>
            </div>
          </div>
        )}

        {/* Performance indicator */}
        {!isFuture && perf != null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Perf:</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${getPerformanceDisplay(perf).bg}`}>
              <span className={getPerformanceDisplay(perf).color}>
                {getPerformanceDisplay(perf).icon}
              </span>
              <span className={`font-semibold ${getPerformanceDisplay(perf).color}`}>
                {perf > 0 ? '+' : ''}{perf.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Future date indicator */}
        {isFuture && (
          <div className="text-center">
            <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded-full">
              No Data
            </span>
          </div>
        )}
      </div>

      {/* Enhanced tooltip */}
      {showTooltip && !isFuture && (
        <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 sm:min-w-[200px] bg-slate-800/95 backdrop-blur-sm text-slate-100 text-xs rounded-xl shadow-2xl border border-slate-600/50 p-3 sm:p-4">
          <div className="space-y-2">
            <div className="text-center border-b border-slate-600/30 pb-2">
              <div className="font-bold text-xs sm:text-sm text-white">
                <span className="hidden sm:inline">{date.format('dddd, MMM D, YYYY')}</span>
                <span className="sm:hidden">{date.format('MMM D, YYYY')}</span>
              </div>
            </div>
            
            {volatility && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Volatility:</span>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${
                    volatility.level === 'high' ? 'bg-red-500/30 text-red-200' :
                    volatility.level === 'medium' ? 'bg-amber-500/30 text-amber-200' :
                    'bg-emerald-500/30 text-emerald-200'
                  }`}>
                    {volatility.level}
                  </span>
                  {volatility.value && (
                    <span className="text-white font-semibold text-xs">({volatility.value.toFixed(2)})</span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Volume:</span>
              <span className="text-blue-200 font-semibold text-xs">{volume.toLocaleString()}</span>
            </div>
            
            {orderBook.close && orderBook.close[date.format('YYYY-MM-DD')] && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Close:</span>
                <span className="text-white font-semibold text-xs">
                  ${orderBook.close[date.format('YYYY-MM-DD')].toLocaleString()}
                </span>
              </div>
            )}
            
            {perf != null && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Performance:</span>
                <div className="flex items-center gap-1">
                  <span className={getPerformanceDisplay(perf).color}>
                    {React.cloneElement(getPerformanceDisplay(perf).icon, { 
                      className: 'w-3 h-3' 
                    })}
                  </span>
                  <span className={`font-semibold text-xs ${getPerformanceDisplay(perf).color}`}>
                    {perf > 0 ? '+' : ''}{perf.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-slate-800/95"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarCell;