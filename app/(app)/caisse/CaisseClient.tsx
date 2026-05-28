'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTransactions } from '@/store/slices/transactionsSlice';
import { openTransactionModal, openDeleteConfirm } from '@/store/slices/uiSlice';
import { Transaction } from '@/types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import TransactionModal from '@/components/modals/TransactionModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

interface Props { initialData: Transaction[]; userName: string; }

function fmt(n: number) { return n.toLocaleString('fr-DZ'); }

function groupByDay(txs: Transaction[]) {
  const map: Record<string, Transaction[]> = {};
  for (const t of txs) {
    if (!map[t.date]) map[t.date] = [];
    map[t.date].push(t);
  }
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

// ── Delete button ─────────────────────────────────────────────────────────────
function DeleteBtn({ id, dispatch }: { id: string; dispatch: ReturnType<typeof useAppDispatch> }) {
  return (
    <button
      onClick={() => dispatch(openDeleteConfirm({ type: 'transaction', id }))}
      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      title="Supprimer"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}

// ── Transaction list (cards only, no table) ───────────────────────────────────
function TransactionRows({ txs, dispatch }: { txs: Transaction[]; dispatch: ReturnType<typeof useAppDispatch> }) {
  return (
    <div className="space-y-2 p-3">
      {txs.map(t => (
        <div key={t.id} className="flex items-center gap-3 bg-surface-50 rounded-xl p-3">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
            ${t.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
            {t.type === 'IN' ? '↓' : '↑'}
          </div>

          {/* Description + by */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{t.description}</p>
            <p className="text-xs text-ink-muted truncate">{t.added_by || '—'}</p>
          </div>

          {/* Amount + delete */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-sm font-bold ${t.type === 'IN' ? 'text-emerald-700' : 'text-red-600'}`}>
              {t.type === 'IN' ? '+' : '-'}{fmt(t.amount)} DA
            </span>
            <DeleteBtn id={t.id} dispatch={dispatch} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Day group (collapsible) ───────────────────────────────────────────────────
function DayGroup({ date, txs, dispatch }: { date: string; txs: Transaction[]; dispatch: ReturnType<typeof useAppDispatch> }) {
  const [open, setOpen] = useState(false);
  const dayIN  = txs.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const dayOUT = txs.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
  const balance = dayIN - dayOUT;
  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  const dateLabel = isToday
    ? "Aujourd'hui"
    : format(parseISO(date), 'EEE d MMM yyyy', { locale: fr });

  return (
    <div className="card overflow-hidden p-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-50 transition-colors text-left"
      >
        {/* Calendar icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
          ${isToday ? 'bg-brand-100' : 'bg-surface-100'}`}>
          <svg className={`w-4 h-4 ${isToday ? 'text-brand-600' : 'text-ink-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Date + count */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold capitalize truncate ${isToday ? 'text-brand-700' : 'text-ink'}`}>
            {dateLabel}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-ink-muted">{txs.length} tx</span>
            <span className="text-xs text-emerald-700 font-medium">+{fmt(dayIN)}</span>
            <span className="text-xs text-red-500 font-medium">-{fmt(dayOUT)}</span>
          </div>
        </div>

        {/* Balance + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}{fmt(balance)} DA
          </span>
          <svg className={`w-4 h-4 text-ink-muted transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-surface-200 animate-fade-in">
          <TransactionRows txs={txs} dispatch={dispatch} />
        </div>
      )}
    </div>
  );
}

// ── Monthly chart (fully responsive, no x-scroll) ────────────────────────────
function MonthlyChart({ transactions }: { transactions: Transaction[] }) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const [fromDay, setFromDay] = useState(1);
  const [toDay,   setToDay]   = useState(daysInMonth);

  useEffect(() => {
    const dim = new Date(year, month + 1, 0).getDate();
    setFromDay(1); setToDay(dim);
  }, [month, year]);

  const filtered = useMemo(() => {
    const from = `${year}-${String(month+1).padStart(2,'0')}-${String(fromDay).padStart(2,'0')}`;
    const to   = `${year}-${String(month+1).padStart(2,'0')}-${String(toDay).padStart(2,'0')}`;
    return transactions.filter(t => t.date >= from && t.date <= to);
  }, [transactions, year, month, fromDay, toDay]);

  const days = useMemo(() => {
    const result = [];
    for (let d = fromDay; d <= toDay; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayTxs  = filtered.filter(t => t.date === dateStr);
      const inAmt   = dayTxs.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
      const outAmt  = dayTxs.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
      result.push({ day: d, inAmt, outAmt, count: dayTxs.length });
    }
    return result;
  }, [filtered, fromDay, toDay, year, month]);

  const totalIN      = filtered.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const totalOUT     = filtered.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
  const totalBalance = totalIN - totalOUT;
  const maxVal       = Math.max(...days.map(d => Math.max(d.inAmt, d.outAmt)), 1);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const hasData = days.some(d => d.inAmt > 0 || d.outAmt > 0);

  return (
    <div className="card space-y-4">
      {/* Title + month nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-semibold text-ink">Résumé mensuel</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-100 transition-colors">
            <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-ink capitalize w-28 text-center">
            {format(new Date(year, month, 1), 'MMM yyyy', { locale: fr })}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-100 transition-colors">
            <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day range filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-ink-muted font-semibold">Plage :</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-ink-muted">Du</span>
          <input type="number" min={1} max={toDay} value={fromDay}
            onChange={e => setFromDay(Math.max(1, Math.min(parseInt(e.target.value)||1, toDay)))}
            className="w-14 px-2 py-1.5 text-xs text-center border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-ink-muted">au</span>
          <input type="number" min={fromDay} max={daysInMonth} value={toDay}
            onChange={e => setToDay(Math.max(fromDay, Math.min(parseInt(e.target.value)||daysInMonth, daysInMonth)))}
            className="w-14 px-2 py-1.5 text-xs text-center border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <button onClick={() => { setFromDay(1); setToDay(daysInMonth); }}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
          Tout le mois
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-700 font-semibold mb-1">Entrées</p>
          <p className="text-xs font-bold text-emerald-800 break-all">+{fmt(totalIN)} DA</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xs text-red-600 font-semibold mb-1">Sorties</p>
          <p className="text-xs font-bold text-red-700 break-all">-{fmt(totalOUT)} DA</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${totalBalance >= 0 ? 'bg-brand-50' : 'bg-red-50'}`}>
          <p className={`text-xs font-semibold mb-1 ${totalBalance >= 0 ? 'text-brand-700' : 'text-red-600'}`}>Solde</p>
          <p className={`text-xs font-bold break-all ${totalBalance >= 0 ? 'text-brand-800' : 'text-red-700'}`}>
            {totalBalance >= 0 ? '+' : ''}{fmt(totalBalance)} DA
          </p>
        </div>
      </div>

      {/* Responsive bar chart — fills container width, no x-scroll */}
      {hasData ? (
        <div ref={containerRef} className="w-full">
          {/* Bars: use CSS grid to fill width evenly */}
          <div
            className="grid items-end gap-0.5"
            style={{
              gridTemplateColumns: `repeat(${days.length}, 1fr)`,
              height: '80px',
            }}
          >
            {days.map(d => (
              <div key={d.day} className="flex flex-col items-center justify-end gap-0.5 h-full">
                <div className="w-full flex items-end justify-center gap-px" style={{ height: '72px' }}>
                  <div
                    className="flex-1 bg-emerald-400 rounded-t-sm transition-all duration-300 max-w-[8px]"
                    style={{ height: d.inAmt > 0 ? `${Math.max(4, (d.inAmt / maxVal) * 100)}%` : '2px' }}
                    title={`Jour ${d.day} — Entrées: ${fmt(d.inAmt)} DA`}
                  />
                  <div
                    className="flex-1 bg-red-400 rounded-t-sm transition-all duration-300 max-w-[8px]"
                    style={{ height: d.outAmt > 0 ? `${Math.max(4, (d.outAmt / maxVal) * 100)}%` : '2px' }}
                    title={`Jour ${d.day} — Sorties: ${fmt(d.outAmt)} DA`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Day labels — same grid, show every 5th or fewer */}
          <div
            className="grid gap-0.5 mt-1"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {days.map(d => (
              <div key={d.day} className="text-center">
                {(d.day === 1 || d.day % 5 === 0 || d.day === toDay) ? (
                  <span className={`text-[9px] font-medium leading-none ${d.count > 0 ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                    {d.day}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-400 rounded-sm" />
              <span className="text-xs text-ink-muted">Entrées</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded-sm" />
              <span className="text-xs text-ink-muted">Sorties</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-subtle text-center py-6">Aucune transaction sur cette période</p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CaisseClient({ initialData, userName }: Props) {
  const dispatch     = useAppDispatch();
  const transactions = useAppSelector(s => s.transactions.items);

  useEffect(() => { dispatch(setTransactions(initialData)); }, []);

  const today        = new Date().toISOString().split('T')[0];
  const todayTx      = transactions.filter(t => t.date === today);
  const todayIN      = todayTx.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const todayOUT     = todayTx.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
  const todayBalance = todayIN - todayOUT;
  const totalIN      = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const totalOUT     = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
const dayGroups = useMemo(() => [...groupByDay(transactions)], [transactions]);
console.log('dayGroups order:', dayGroups.map(([date]) => date));
  return (
    <div className="p-4 md:p-8 animate-fade-in w-full max-w-full overflow-hidden">
      <TransactionModal userName={userName} />
      <DeleteConfirmModal />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
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

      {/* Today summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card border-l-4 border-l-emerald-500">
          <p className="text-xs text-ink-muted uppercase tracking-wide font-semibold mb-2">Entrées aujourd'hui</p>
          <p className="font-display text-2xl font-bold text-emerald-700">+{fmt(todayIN)} DA</p>
          <p className="text-xs text-ink-subtle mt-1">Total: {fmt(totalIN)} DA</p>
        </div>
        <div className="card border-l-4 border-l-red-500">
          <p className="text-xs text-ink-muted uppercase tracking-wide font-semibold mb-2">Sorties aujourd'hui</p>
          <p className="font-display text-2xl font-bold text-red-600">-{fmt(todayOUT)} DA</p>
          <p className="text-xs text-ink-subtle mt-1">Total: {fmt(totalOUT)} DA</p>
        </div>
        <div className={`card border-l-4 ${todayBalance >= 0 ? 'border-l-brand-500' : 'border-l-red-400'}`}>
          <p className="text-xs text-ink-muted uppercase tracking-wide font-semibold mb-2">Solde du jour</p>
          <p className={`font-display text-2xl font-bold ${todayBalance >= 0 ? 'text-brand-700' : 'text-red-600'}`}>
            {todayBalance >= 0 ? '+' : ''}{fmt(todayBalance)} DA
          </p>
          <p className="text-xs text-ink-subtle mt-1">Solde total: {fmt(totalIN - totalOUT)} DA</p>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="mb-6">
        <MonthlyChart transactions={transactions} />
      </div>

      {/* Day groups */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-ink">Transactions par jour</h2>
        <span className="text-xs text-ink-subtle">{dayGroups.length} jour{dayGroups.length > 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        {dayGroups.length === 0 ? (
          <div className="card text-center py-10 text-ink-subtle text-sm">
            Aucune transaction enregistrée
          </div>
        ) : dayGroups.map(([date, txs]) => (
  <DayGroup key={date} date={date} txs={txs} dispatch={dispatch} />
        ))}
      </div>
    </div>
  );
}
