'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeProductModal } from '@/store/slices/uiSlice';
import { addProduct, updateProduct } from '@/store/slices/productsSlice';
import { Product } from '@/types';

export default function ProductModal() {
  const dispatch = useAppDispatch();
  const { open, editId } = useAppSelector(s => s.ui.productModal);
  const products = useAppSelector(s => s.products.items);
  const supabase = createClient();

  const editItem = editId ? products.find(p => p.id === editId) : null;

  const [form, setForm] = useState({ name: '', buying_price: '', selling_price: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        buying_price: String(editItem.buying_price),
        selling_price: String(editItem.selling_price),
        quantity: String(editItem.quantity),
      });
    } else {
      setForm({ name: '', buying_price: '', selling_price: '', quantity: '' });
    }
    setError('');
  }, [editId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: form.name,
      buying_price: parseFloat(form.buying_price),
      selling_price: parseFloat(form.selling_price),
      quantity: parseInt(form.quantity),
    };

    if (editId) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editId).select().single();
      if (error) { setError(error.message); }
      else { dispatch(updateProduct(data as Product)); dispatch(closeProductModal()); }
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) { setError(error.message); }
      else { dispatch(addProduct(data as Product)); dispatch(closeProductModal()); }
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => dispatch(closeProductModal())}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
          <h2 className="font-display font-bold text-ink">
            {editId ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={() => dispatch(closeProductModal())} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nom du produit</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nom du produit" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prix d'achat (DA)</label>
              <input type="number" min="0" step="0.01" className="input-field" value={form.buying_price} onChange={e => setForm({...form, buying_price: e.target.value})} placeholder="0" required />
            </div>
            <div>
              <label className="label">Prix de vente (DA)</label>
              <input type="number" min="0" step="0.01" className="input-field" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})} placeholder="0" required />
            </div>
          </div>
          <div>
            <label className="label">Quantité initiale</label>
            <input type="number" min="0" className="input-field" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" required />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => dispatch(closeProductModal())} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
