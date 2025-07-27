import dayjs from 'dayjs';
import { setVolatility } from '../store/orderBookSlice';

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


// Fetch 1m klines for a given day and calculate volatility, volume, open, high, low, close price, and liquidity
async function fetchDayVolatility(symbol, date) {
  const start = dayjs(date).startOf('day').valueOf();
  const end = dayjs(date).endOf('day').valueOf();
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&startTime=${start}&endTime=${end}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const klines = await res.json();
  // Mid-price = (high+low)/2 for each kline
  const mids = klines.map(k => (parseFloat(k[2]) + parseFloat(k[3])) / 2);
  const std = calcStdDev(mids);
  // Volume: sum of all 1m volumes
  const volume = klines.reduce((sum, k) => sum + parseFloat(k[5]), 0);
  // Open, High, Low, Close
  const open = klines.length > 0 ? parseFloat(klines[0][1]) : null;
  const close = klines.length > 0 ? parseFloat(klines[klines.length - 1][4]) : null;
  const high = klines.length > 0 ? Math.max(...klines.map(k => parseFloat(k[2]))) : null;
  const low = klines.length > 0 ? Math.min(...klines.map(k => parseFloat(k[3]))) : null;
  // Liquidity: use quote asset volume (k[7]) as a proxy for liquidity (or use taker buy base/quote volume)
  // We'll use quote asset volume (k[7])
  const liquidity = klines.reduce((sum, k) => sum + parseFloat(k[7]), 0);
  return { std, level: getVolatilityLevel(std), volume, open, high, low, close, liquidity };
}

// Fetch and dispatch volatility for all days in the month
export async function fetchMonthVolatility(symbol, month, dispatch) {
  const startOfMonth = dayjs(month).startOf('month');
  const endOfMonth = dayjs(month).endOf('month');
  let d = startOfMonth;
  while (d.isBefore(endOfMonth) || d.isSame(endOfMonth, 'day')) {
    const { std, level, volume, open, high, low, close, liquidity } = (await fetchDayVolatility(symbol, d.format('YYYY-MM-DD'))) || {};
    if (std !== undefined && level) {
      dispatch(setVolatility({ date: d.format('YYYY-MM-DD'), level, value: std, volume, open, high, low, close, liquidity }));
    }
    d = d.add(1, 'day');
  }
}
