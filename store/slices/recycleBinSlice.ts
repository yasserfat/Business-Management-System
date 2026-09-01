import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment } from '@/types';

interface RecycleBinState {
  items: Appointment[];
}

const initialState: RecycleBinState = {
  items: [],
};

const recycleBinSlice = createSlice({
  name: 'recycleBin',
  initialState,
  reducers: {
    setDeletedAppointments(state, action: PayloadAction<Appointment[]>) {
      state.items = action.payload;
    },
    removeFromRecycleBin(state, action: PayloadAction<string>) {
      state.items = state.items.filter(a => a.id !== action.payload);
    },
  },
});

export const { setDeletedAppointments, removeFromRecycleBin } = recycleBinSlice.actions;
export default recycleBinSlice.reducer;
