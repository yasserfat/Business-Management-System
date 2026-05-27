import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '@/types';

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
}

const initialState: TransactionsState = { items: [], loading: false };

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.items = action.payload;
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.items.unshift(action.payload);
    },
    removeTransaction(state, action: PayloadAction<string>) {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setTransactions, addTransaction, removeTransaction, setLoading } = transactionsSlice.actions;
export default transactionsSlice.reducer;
