import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  bids: [],
  asks: [],
  midPrices: [], 
  volatility: {},
  volume: {}, 
  close: {},
  open: {},
  high: {},
  low: {},
  liquidity: {},
};

const orderBookSlice = createSlice({
  name: 'orderBook',
  initialState,
  reducers: {
    updateOrderBook: (state, action) => {
      state.bids = action.payload.bids;
      state.asks = action.payload.asks;
    },
    addMidPrice: (state, action) => {
      state.midPrices.push(action.payload);
    },
    setVolatility: (state, action) => {
      state.volatility[action.payload.date] = {
        level: action.payload.level,
        value: action.payload.value,
      };
      if (action.payload.volume !== undefined) {
        state.volume[action.payload.date] = action.payload.volume;
      }
      if (action.payload.close !== undefined) {
        state.close[action.payload.date] = action.payload.close;
      }
      if (action.payload.open !== undefined) {
        state.open[action.payload.date] = action.payload.open;
      }
      if (action.payload.high !== undefined) {
        state.high[action.payload.date] = action.payload.high;
      }
      if (action.payload.low !== undefined) {
        state.low[action.payload.date] = action.payload.low;
      }
      if (action.payload.liquidity !== undefined) {
        state.liquidity[action.payload.date] = action.payload.liquidity;
      }
    },
    resetOrderBook: (state) => {
      state.bids = [];
      state.asks = [];
      state.midPrices = [];
      state.volatility = {};
      state.volume = {};
      state.close = {};
      state.open = {};
      state.high = {};
      state.low = {};
      state.liquidity = {};
    },
  },
});

export const { updateOrderBook, addMidPrice, setVolatility, resetOrderBook } = orderBookSlice.actions;
export default orderBookSlice.reducer;
