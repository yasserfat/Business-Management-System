import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment } from '@/types';

interface AppointmentsState {
  items: Appointment[];
  loading: boolean;
  searchQuery: string;
}

const initialState: AppointmentsState = {
  items: [],
  loading: false,
  searchQuery: '',
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments(state, action: PayloadAction<Appointment[]>) {
      state.items = action.payload;
    },
    addAppointment(state, action: PayloadAction<Appointment>) {
      state.items.unshift(action.payload);
    },
    updateAppointment(state, action: PayloadAction<Appointment>) {
      const idx = state.items.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeAppointment(state, action: PayloadAction<string>) {
      state.items = state.items.filter(a => a.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setAppointments, addAppointment, updateAppointment,
  removeAppointment, setLoading, setSearchQuery,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
