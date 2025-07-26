import { updateOrderBook, addMidPrice } from '../store/orderBookSlice';

export function connectBinanceDepthStream(symbol, dispatch) {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.b && data.a) {
      const bids = data.b.map(([price, qty]) => ({ price: parseFloat(price), qty: parseFloat(qty) }));
      const asks = data.a.map(([price, qty]) => ({ price: parseFloat(price), qty: parseFloat(qty) }));
      dispatch(updateOrderBook({ bids, asks }));
      if (bids.length && asks.length) {
        const mid = (bids[0].price + asks[0].price) / 2;
        dispatch(addMidPrice({ price: mid, timestamp: Date.now() }));
      }
    }
  };

  ws.onerror = (err) => {
    console.error('Binance WebSocket error:', err);
  };

  ws.onclose = () => {
    console.warn('Binance WebSocket closed.');
  };

  return ws;
}
