import { createServerSupabaseClient } from '@/lib/supabase-server';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const today = new Date().toISOString().split('T')[0];

  const [
    { data: todayAppointments },
    { data: allProducts },
    { data: todayTransactions },
    { data: recentAppointments },
    { data: recentTransactions },
  ] = await Promise.all([
    supabase.from('appointments').select('id').eq('date', today),  // ← was datetime range
    supabase.from('products').select('id, quantity'),
    supabase.from('transactions').select('type, amount').eq('date', today),
    supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const totalStockItems = allProducts?.length || 0;
  const todayIN = todayTransactions?.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0) || 0;
  const todayOUT = todayTransactions?.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0) || 0;
  const todayBalance = todayIN - todayOUT;

  const dateLabel = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <div className="p-8 animate-fade-in mt-[60px] lg:mt-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">Tableau de bord</h1>
        <p className="text-ink-muted text-sm mt-1 capitalize">{dateLabel}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="card group hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-ink-subtle bg-surface-100 px-2 py-1 rounded-lg">Aujourd'hui</span>
          </div>
          <p className="font-display text-3xl font-bold text-ink">{todayAppointments?.length || 0}</p>
          <p className="text-ink-muted text-sm mt-1">Rendez-vous du jour</p>
        </div>

        <div className="card group hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition-colors">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xs text-ink-subtle bg-surface-100 px-2 py-1 rounded-lg">Total</span>
          </div>
          <p className="font-display text-3xl font-bold text-ink">{totalStockItems}</p>
          <p className="text-ink-muted text-sm mt-1">Produits en stock</p>
        </div>

        <div className="card group hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              todayBalance >= 0 ? 'bg-emerald-50 group-hover:bg-emerald-100' : 'bg-red-50 group-hover:bg-red-100'
            }`}>
              <svg className={`w-5 h-5 ${todayBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs text-ink-subtle bg-surface-100 px-2 py-1 rounded-lg">Aujourd'hui</span>
          </div>
          <p className={`font-display text-3xl font-bold ${todayBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {todayBalance.toLocaleString('fr-DZ')} <span className="text-lg font-semibold">DA</span>
          </p>
          <p className="text-ink-muted text-sm mt-1">Solde de la journée</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-ink mb-4">Accès rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/appointments', label: 'Rendez-vous', color: 'bg-brand-600 hover:bg-brand-700', icon: '📅' },
            { href: '/stock', label: 'Stock', color: 'bg-violet-600 hover:bg-violet-700', icon: '📦' },
            { href: '/caisse', label: 'Caisse', color: 'bg-emerald-600 hover:bg-emerald-700', icon: '💰' },
            { href: '/caisse', label: 'Nouvelle transaction', color: 'bg-amber-500 hover:bg-amber-600', icon: '➕' },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className={`${item.color} text-white rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-150 hover:shadow-md active:scale-95 flex items-center gap-2.5`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-ink">Derniers rendez-vous</h2>
            <Link href="/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              Voir tout →
            </Link>
          </div>
          {!recentAppointments?.length ? (
            <p className="text-ink-subtle text-sm py-4 text-center">Aucun rendez-vous</p>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-700">{a.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{a.name}</p>
                    <p className="text-xs text-ink-muted">{a.service_type} — {a.wilaya}</p>
                  </div>
                  <span className="text-xs text-ink-subtle flex-shrink-0">
                {a.date ? format(new Date(a.date + 'T00:00:00'), 'dd/MM/yyyy') : '—'}  {/* ← was a.datetime with HH:mm */}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-ink">Dernières transactions</h2>
            <Link href="/caisse" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              Voir tout →
            </Link>
          </div>
          {!recentTransactions?.length ? (
            <p className="text-ink-subtle text-sm py-4 text-center">Aucune transaction</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    t.type === 'IN' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <span className="text-sm">{t.type === 'IN' ? '↓' : '↑'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{t.description}</p>
                    <p className="text-xs text-ink-muted">{t.added_by || 'N/A'}</p>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${
                    t.type === 'IN' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString('fr-DZ')} DA
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}