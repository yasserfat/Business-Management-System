'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeDeleteConfirm } from '@/store/slices/uiSlice';
import { removeAppointment } from '@/store/slices/appointmentsSlice';
import { removeProduct } from '@/store/slices/productsSlice';
import { removeTransaction } from '@/store/slices/transactionsSlice';

export default function DeleteConfirmModal() {
  const dispatch = useAppDispatch();
  const { open, type, id } = useAppSelector(s => s.ui.deleteConfirm);
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const tableMap: Record<string, string> = {
    appointment: 'appointments',
    product: 'products',
    transaction: 'transactions',
  };

  const handleDelete = async () => {
    if (!id || !type) return;
    setLoading(true);
    const table = tableMap[type];
    await supabase.from(table).delete().eq('id', id);
    if (type === 'appointment') dispatch(removeAppointment(id));
    if (type === 'product') dispatch(removeProduct(id));
    if (type === 'transaction') dispatch(removeTransaction(id));
    dispatch(closeDeleteConfirm());
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => dispatch(closeDeleteConfirm())}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm animate-scale-in p-6" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-ink text-center mb-2">Confirmer la suppression</h3>
        <p className="text-ink-muted text-sm text-center mb-6">Cette action est irréversible. Voulez-vous vraiment supprimer cet élément ?</p>
        <div className="flex gap-3">
          <button onClick={() => dispatch(closeDeleteConfirm())} className="btn-secondary flex-1 justify-center">Annuler</button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center" disabled={loading}>
            {loading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}
