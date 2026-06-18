import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  appointmentModal: { open: boolean; editId: string | null; defaultDate: string | null };
  productModal: { open: boolean; editId: string | null };
  transactionModal: { open: boolean };
  deleteConfirm: { open: boolean; type: string; id: string | null };
}

const initialState: UIState = {
  appointmentModal: { open: false, editId: null, defaultDate: null },
  productModal: { open: false, editId: null },
  transactionModal: { open: false },
  deleteConfirm: { open: false, type: '', id: null },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAppointmentModal(state, action: PayloadAction<string | null | { editId: string | null; date?: string }>) {
      const payload = action.payload;
      if (payload !== null && typeof payload === 'object') {
        state.appointmentModal = { open: true, editId: payload.editId, defaultDate: payload.date ?? null };
      } else {
        state.appointmentModal = { open: true, editId: payload, defaultDate: null };
      }
    },
    closeAppointmentModal(state) {
      state.appointmentModal = { open: false, editId: null, defaultDate: null };
    },
    openProductModal(state, action: PayloadAction<string | null>) {
      state.productModal = { open: true, editId: action.payload };
    },
    closeProductModal(state) {
      state.productModal = { open: false, editId: null };
    },
    openTransactionModal(state) {
      state.transactionModal.open = true;
    },
    closeTransactionModal(state) {
      state.transactionModal.open = false;
    },
    openDeleteConfirm(state, action: PayloadAction<{ type: string; id: string }>) {
      state.deleteConfirm = { open: true, ...action.payload };
    },
    closeDeleteConfirm(state) {
      state.deleteConfirm = { open: false, type: '', id: null };
    },
  },
});

export const {
  openAppointmentModal, closeAppointmentModal,
  openProductModal, closeProductModal,
  openTransactionModal, closeTransactionModal,
  openDeleteConfirm, closeDeleteConfirm,
} = uiSlice.actions;

export default uiSlice.reducer;
