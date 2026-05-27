'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeTransactionModal } from '@/store/slices/uiSlice';
import { addTransaction } from '@/store/slices/transactionsSlice';
import { Transaction } from '@/types';

interface Props { userName: string; }

export default function TransactionModal({ userName }: Props) {
  const dispatch = useAppDispatch();
  const open = useAppSelector(s => s.ui.transactionModal.open);
  const supabase = createClient();

  const [form, setForm] = useState({
    type: 'IN' as 'IN' | 'OUT',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ type: 'IN', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...form, amount: parseFloat(form.amount), added_by: userName })
      .select().single();

    if (error) { setError(error.message); }
    else { dispatch(addTransaction(data as Transaction)); dispatch(closeTransactionModal()); }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => dispatch(closeTransactionModal())}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
          <h2 className="font-display font-bold text-ink">Nouvelle transaction</h2>
          <button onClick={() => dispatch(closeTransactionModal())} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div>
            <label className="label">Type</label>
            <div className="flex rounded-xl border border-surface-200 overflow-hidden">
              {(['IN', 'OUT'] as const).map(t => (
                <button key={t} type="button"
                  onClick={() => setForm({...form, type: t})}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-150 ${
                    form.type === t
                      ? t === 'IN' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                      : 'text-ink-muted hover:bg-surface-50'
                  }`}
                >
                  {t === 'IN' ? '↓ Entrée' : '↑ Sortie'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Montant (DA)</label>
            <input type="number" min="0.01" step="0.01" className="input-field" value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" required />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description de la transaction" required />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
          </div>
          <div className="p-3 bg-surface-50 rounded-xl flex items-center gap-2 text-xs text-ink-muted">
            <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Ajouté par : <span className="font-semibold text-ink">{userName}</span>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => dispatch(closeTransactionModal())} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" className={`flex-1 justify-center btn-primary ${form.type === 'OUT' ? '!bg-red-600 hover:!bg-red-700' : ''}`} disabled={loading}>
              {loading ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
