import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  bids: [],
  asks: [],
  midPrices: [], 
  volatility: {},
  volume: {}, 
  close: {}, 
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
    },
    resetOrderBook: (state) => {
      state.bids = [];
      state.asks = [];
      state.midPrices = [];
      state.volatility = {};
    },
  },
});

export const { updateOrderBook, addMidPrice, setVolatility, resetOrderBook } = orderBookSlice.actions;
export default orderBookSlice.reducer;
