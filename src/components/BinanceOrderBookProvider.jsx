import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { connectBinanceDepthStream } from '../utils/binanceSocket';
import { setVolatility } from '../store/orderBookSlice';
import dayjs from 'dayjs';
import { fetchMonthVolatility } from '../utils/fetchBinanceMonthVolatility';

// standard deviation calculation
function calcStdDev(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function getVolatilityLevel(std) {
  if (std < 1) return 'low';
  if (std < 5) return 'medium';
  return 'high';
}

export default function BinanceOrderBookProvider({ symbol = 'BTCUSDT', currentMonth, children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    fetchMonthVolatility(symbol, currentMonth, dispatch);
  }, [dispatch, symbol, currentMonth]);

  useEffect(() => {
    const ws = connectBinanceDepthStream(symbol, dispatch);
    return () => ws.close();
  }, [symbol, dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      const midPricesRaw = JSON.parse(localStorage.getItem('midPrices') || '[]');
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const filtered = midPricesRaw.filter(mp => mp.timestamp >= oneDayAgo);
      localStorage.setItem('midPrices', JSON.stringify(filtered));
      const prices = filtered.map(mp => mp.price);
      const std = calcStdDev(prices);
      const date = new Date().toISOString().slice(0, 10);
      const level = getVolatilityLevel(std);
      dispatch(setVolatility({ date, level, value: std }));
      localStorage.setItem(`volatility-${date}`, JSON.stringify({ level, value: std }));
    }, 60 * 1000); 
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const unsub = (action) => {
      if (action.type === 'orderBook/addMidPrice') {
        const midPricesRaw = JSON.parse(localStorage.getItem('midPrices') || '[]');
        midPricesRaw.push(action.payload);
        localStorage.setItem('midPrices', JSON.stringify(midPricesRaw));
      }
    };
    window.addEventListener('redux-action', unsub);
    return () => window.removeEventListener('redux-action', unsub);
  }, []);

  return children;
}
