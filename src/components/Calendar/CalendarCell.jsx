import React, { useState } from 'react';
import { useSelector } from 'react-redux';

function getVolatilityColor(level) {
  if (level === 'low') return 'bg-green-400/70';
  if (level === 'medium') return 'bg-yellow-400/70';
  if (level === 'high') return 'bg-red-500/70';
  return 'bg-white';
}


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

  let bgColor = 'bg-white';
  if (selected) {
    bgColor = 'bg-blue-500 text-white';
  } else if (isFuture) {
    bgColor = 'bg-gray-300 text-gray-400';
  } else if (volatility) {
    bgColor = `${getVolatilityColor(volatility.level)} text-black`;
  }

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      role="gridcell"
      aria-selected={selected}
      aria-label={date ? date.format('dddd, MMMM D, YYYY') : 'Empty'}
      tabIndex={focused ? 0 : -1}
      className={`relative h-16 flex flex-col items-center justify-center rounded cursor-pointer select-none transition-colors duration-200
        ${bgColor}
        ${focused ? 'outline-2 outline-blue-600' : ''}
        focus:outline-2 focus:outline-blue-600`}
      onClick={e => { onClick && onClick(e); if (onCellClick && date && !isFuture) onCellClick(date); }}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="font-semibold text-base">{date ? date.date() : ''}</span>
      {/* Volatility indicator */}
      {!isFuture && volatility && (
        <span className="text-xs mt-1 capitalize">{volatility.level} vol</span>
      )}
      {isFuture && (
        <span className="text-xs mt-1 text-gray-500">No Data</span>
      )}
      {/* Volume bar */}
      {!isFuture && (
        <div className="w-2 bg-blue-300 mt-1 rounded" style={{ height: `${Math.max(6, Math.min(volume / 1000, 32))}px` }} />
      )}
      {/* Performance arrow */}
      {!isFuture && perf != null && (
        <span className={`text-lg font-bold mt-1 ${perf > 0 ? 'text-green-600' : perf < 0 ? 'text-red-600' : 'text-gray-500'}`} style={{ lineHeight: '1' }}>
          {perf > 0 ? '↑' : perf < 0 ? '↓' : '→'}
        </span>
      )}
      {/* Tooltip */}
      {showTooltip && !isFuture && (
        <div className="absolute z-10 bottom-16 left-1/2 -translate-x-1/2 min-w-[140px] bg-white text-black text-xs rounded shadow-lg p-2 border border-gray-200 whitespace-pre-line">
          <div><b>{date.format('dddd, MMM D, YYYY')}</b></div>
          {volatility && <div>Volatility: <b>{volatility.level}</b> ({volatility.value?.toFixed(2)})</div>}
          <div>Volume: <b>{volume.toLocaleString()}</b></div>
          {orderBook.close && orderBook.close[date.format('YYYY-MM-DD')] && (
            <div>Close: <b>{orderBook.close[date.format('YYYY-MM-DD')]}</b></div>
          )}
          {perf != null && (
            <div>Perf: <b className={perf > 0 ? 'text-green-600' : perf < 0 ? 'text-red-600' : 'text-gray-500'}>{perf > 0 ? '+' : ''}{perf.toFixed(2)}%</b></div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarCell;
