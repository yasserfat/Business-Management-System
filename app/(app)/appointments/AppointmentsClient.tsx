'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAppointments, setSearchQuery } from '@/store/slices/appointmentsSlice';
import { openAppointmentModal, openDeleteConfirm } from '@/store/slices/uiSlice';
import { Appointment } from '@/types';
import { format } from 'date-fns';
import AppointmentModal from '@/components/modals/AppointmentModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

interface Props { initialData: Appointment[]; userName: string; }

export default function AppointmentsClient({ initialData, userName }: Props) {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(s => s.appointments.items);
  const searchQuery = useAppSelector(s => s.appointments.searchQuery);

  useEffect(() => { dispatch(setAppointments(initialData)); }, []);

const filtered = appointments
  .filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.includes(searchQuery) ||
    a.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.service_type.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const EditBtn = ({ id }: { id: string }) => (
    <button onClick={() => dispatch(openAppointmentModal(id))} className="btn-ghost py-1.5 px-2.5 text-xs">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Modifier
    </button>
  );
  const DeleteBtn = ({ id }: { id: string }) => (
    <button onClick={() => dispatch(openDeleteConfirm({ type: 'appointment', id }))} className="btn-ghost py-1.5 px-2.5 text-xs !text-red-500 hover:!bg-red-50">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Supprimer
    </button>
  );

  return (
    <div className="p-4 md:p-8 animate-fade-in mt-[60px] lg:mt-0 overflow-x-hidden">
      <AppointmentModal userName={userName} />
      <DeleteConfirmModal />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Rendez-vous</h1>
          <p className="text-ink-muted text-sm mt-1">{appointments.length} rendez-vous au total</p>
        </div>
        <button onClick={() => dispatch(openAppointmentModal(null))} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nouveau rendez-vous</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="input-field pl-10"
          placeholder="Rechercher par nom, téléphone, wilaya..."
          value={searchQuery}
          onChange={e => dispatch(setSearchQuery(e.target.value))}
        />
      </div>

      {/* ── MOBILE: cards ── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-10 text-ink-subtle text-sm">
            {searchQuery ? 'Aucun résultat trouvé' : 'Aucun rendez-vous pour le moment'}
          </div>
        ) : filtered.map(a => (
          <div key={a.id} className="card space-y-3">
            {/* Top row: avatar + name + service badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-brand-700">{a.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{a.name}</p>
                  <p className="text-xs text-ink-muted">{a.phone}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full flex-shrink-0">
                {a.service_type}
              </span>
            </div>

            {/* Info row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-50 rounded-xl px-3 py-2">
                <p className="text-ink-subtle mb-0.5">Wilaya</p>
                <p className="font-medium text-ink">{a.wilaya}</p>
              </div>
              <div className="bg-surface-50 rounded-xl px-3 py-2">
                <p className="text-ink-subtle mb-0.5">Date </p>
                <p className="font-medium text-ink">{format(new Date(a.datetime), 'dd/MM/yy')}</p>
              </div>
              <div className="bg-surface-50 rounded-xl px-3 py-2 col-span-2">
                <p className="text-ink-subtle mb-0.5">Ajouté par</p>
                <p className="font-medium text-ink">{a.added_by || '—'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <EditBtn id={a.id} />
              <DeleteBtn id={a.id} />
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
                <th className="table-head text-left px-5 py-3.5">Client</th>
                <th className="table-head text-left px-5 py-3.5">Téléphone</th>
                <th className="table-head text-left px-5 py-3.5">Wilaya</th>
                <th className="table-head text-left px-5 py-3.5">Service</th>
                <th className="table-head text-left px-5 py-3.5">Date </th>
                <th className="table-head text-left px-5 py-3.5">Ajouté par</th>
                <th className="table-head text-left px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-ink-subtle text-sm">
                    {searchQuery ? 'Aucun résultat trouvé' : 'Aucun rendez-vous pour le moment'}
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-brand-700">{a.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-ink">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink-muted">{a.phone}</td>
                  <td className="px-5 py-4 text-sm text-ink-muted">{a.wilaya}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full">
                      {a.service_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink-muted">{format(new Date(a.datetime), 'dd/MM/yyyy')}</td>
                  <td className="px-5 py-4 text-sm text-ink-muted">{a.added_by || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <EditBtn id={a.id} />
                      <DeleteBtn id={a.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
