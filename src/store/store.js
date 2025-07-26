import { configureStore } from '@reduxjs/toolkit';
import orderBookReducer from './orderBookSlice';

const store = configureStore({
  reducer: {
    orderBook: orderBookReducer,
  },
});

export default store;
