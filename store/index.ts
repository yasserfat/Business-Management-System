import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import productsReducer from './slices/productsSlice';
import transactionsReducer from './slices/transactionsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    appointments: appointmentsReducer,
    products: productsReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
