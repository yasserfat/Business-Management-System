import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';

interface ProductsState {
  items: Product[];
  loading: boolean;
}

const initialState: ProductsState = { items: [], loading: false };

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.items.unshift(action.payload);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    adjustQuantity(state, action: PayloadAction<{ id: string; delta: number }>) {
      const item = state.items.find(p => p.id === action.payload.id);
      if (item) item.quantity = Math.max(0, item.quantity + action.payload.delta);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setProducts, addProduct, updateProduct,
  removeProduct, adjustQuantity, setLoading,
} = productsSlice.actions;

export default productsSlice.reducer;
