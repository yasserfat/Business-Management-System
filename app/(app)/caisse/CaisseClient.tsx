'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTransactions } from '@/store/slices/transactionsSlice';
import { openTransactionModal, openDeleteConfirm } from '@/store/slices/uiSlice';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import TransactionModal from '@/components/modals/TransactionModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

interface Props { initialData: Transaction[]; userName: string; }

export default function CaisseClient({ initialData, userName }: Props) {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector(s => s.transactions.items);

  useEffect(() => { dispatch(setTransactions(initialData)); }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayTx = transactions.filter(t => t.date === today);
  const todayIN  = todayTx.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const todayOUT = todayTx.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
  const todayBalance = todayIN - todayOUT;
  const totalIN  = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const totalOUT = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);

  const DeleteBtn = ({ id }: { id: string }) => (
    <button onClick={() => dispatch(openDeleteConfirm({ type: 'transaction', id }))} className="btn-ghost py-1.5 px-2.5 text-xs !text-red-500 hover:!bg-red-50">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Supprimer
    </button>
  );

  return (
    <div className="p-4 md:p-8 animate-fade-in mt-[60px] lg:mt-0">
      <TransactionModal userName={userName} />
      <DeleteConfirmModal />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Caisse</h1>
          <p className="text-ink-muted text-sm mt-1">{transactions.length} transactions au total</p>
        </div>
        <button onClick={() => dispatch(openTransactionModal())} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nouvelle transaction</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card border-l-4 border-l-emerald-500">
          <p className="text-xs text-ink-muted uppercase tracking-wide font-semibold mb-2">Entrées aujourd'hui</p>
          <p className="font-display text-2xl font-bold text-emerald-700">+{todayIN.toLocaleString('fr-DZ')} DA</p>
          <p className="text-xs text-ink-subtle mt-1">Total: {totalIN.toLocaleString('fr-DZ')} DA</p>
        </div>
        <div className="card border-l-4 border-l-red-500">
          <p className="text-xs text-ink-muted uppercase tracking-wide font-semibold mb-2">Sorties aujourd'hui</p>
          <p className="font-display text-2xl font-bold text-red-600">-{todayOUT.toLocaleString('fr-DZ')} DA</p>
          <p className="text-xs text-ink-subtle mt-1">Total: {totalOUT.toLocaleString('fr-DZ')} DA</p>
        </div>
        <div className={`card border-l-4 ${todayBalance >= 0 ? 'border-l-brand-500' : 'border-l-red-400'}`}>
          <p className="text-xs text-ink-muted uppercase tracking-wide font-semibold mb-2">Solde du jour</p>
          <p className={`font-display text-2xl font-bold ${todayBalance >= 0 ? 'text-brand-700' : 'text-red-600'}`}>
            {todayBalance >= 0 ? '+' : ''}{todayBalance.toLocaleString('fr-DZ')} DA
          </p>
          <p className="text-xs text-ink-subtle mt-1">Solde total: {(totalIN - totalOUT).toLocaleString('fr-DZ')} DA</p>
        </div>
      </div>

      {/* Section title */}
      <div className="mb-3">
        <h2 className="font-display font-semibold text-ink">Historique des transactions</h2>
      </div>

      {/* ── MOBILE: cards ── */}
      <div className="md:hidden space-y-3">
        {transactions.length === 0 ? (
          <div className="card text-center py-10 text-ink-subtle text-sm">
            Aucune transaction enregistrée
          </div>
        ) : transactions.map(t => (
          <div key={t.id} className="card space-y-3">
            {/* Top row: type icon + description + amount */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                  t.type === 'IN' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {t.type === 'IN' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{t.description}</p>
                  <p className="text-xs text-ink-muted">{t.added_by || '—'}</p>
                </div>
              </div>
              <p className={`text-base font-bold flex-shrink-0 ${t.type === 'IN' ? 'text-emerald-700' : 'text-red-600'}`}>
                {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString('fr-DZ')} DA
              </p>
            </div>

            {/* Bottom row: badge + date + delete */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {t.type === 'IN'
                  ? <span className="badge-in">↓ Entrée</span>
                  : <span className="badge-out">↑ Sortie</span>
                }
                <span className="text-xs text-ink-subtle">{format(new Date(t.date), 'dd/MM/yyyy')}</span>
              </div>
              <DeleteBtn id={t.id} />
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: table ── */}
      <div className="hidden md:block card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="table-head text-left px-5 py-3.5">Date</th>
                <th className="table-head text-left px-5 py-3.5">Type</th>
                <th className="table-head text-left px-5 py-3.5">Description</th>
                <th className="table-head text-left px-5 py-3.5">Ajouté par</th>
                <th className="table-head text-right px-5 py-3.5">Montant</th>
                <th className="table-head text-left px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-subtle text-sm">
                    Aucune transaction enregistrée
                  </td>
                </tr>
              ) : transactions.map(t => (
                <tr key={t.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-ink-muted whitespace-nowrap">{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                  <td className="px-5 py-4">
                    {t.type === 'IN' ? <span className="badge-in">↓ Entrée</span> : <span className="badge-out">↑ Sortie</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-ink max-w-xs truncate">{t.description}</td>
                  <td className="px-5 py-4 text-sm text-ink-muted">{t.added_by || '—'}</td>
                  <td className={`px-5 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'IN' ? 'text-emerald-700' : 'text-red-600'}`}>
                    {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString('fr-DZ')} DA
                  </td>
                  <td className="px-5 py-4"><DeleteBtn id={t.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}