'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAppointments, setSearchQuery } from '@/store/slices/appointmentsSlice';
import { openAppointmentModal, openDeleteConfirm, openImageLightbox } from '@/store/slices/uiSlice';
import { Appointment } from '@/types';
import { format, parseISO, eachDayOfInterval, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import AppointmentModal from '@/components/modals/AppointmentModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import ImageLightbox from '@/components/appointments/ImageLightbox';
import { getAppointmentImageUrl } from '@/lib/storage';

interface Props { initialData: Appointment[]; userName: string; }

function groupByDay(appointments: Appointment[], fillGaps: boolean) {
  const map: Record<string, Appointment[]> = {};
  for (const a of appointments) {
    if (!a.date) continue;
    if (!map[a.date]) map[a.date] = [];
    map[a.date].push(a);
  }
  const dates = Object.keys(map).filter(d => getDay(parseISO(d)) !== 5).sort((a, b) => a.localeCompare(b));
  if (dates.length === 0) return [];
  if (!fillGaps) return dates.map(date => [date, map[date]] as [string, Appointment[]]);

  const allDays = eachDayOfInterval({
    start: parseISO(dates[0]),
    end: parseISO(dates[dates.length - 1]),
  }).filter(d => getDay(d) !== 5).map(d => format(d, 'yyyy-MM-dd'));

  return allDays.map(date => [date, map[date] || []] as [string, Appointment[]]);
}

export default function AppointmentsClient({ initialData, userName }: Props) {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(s => s.appointments.items);
  const searchQuery = useAppSelector(s => s.appointments.searchQuery);

  useEffect(() => { dispatch(setAppointments(initialData)); }, []);

  const filtered = appointments.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.includes(searchQuery) ||
    a.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.service_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const urgentAppts = filtered.filter(a => a.urgent);
  const grouped = groupByDay(filtered.filter(a => !a.urgent), !searchQuery);
  const today = new Date().toISOString().split('T')[0];

  function getDayLabel(date: string) {
    if (date === today) return "Aujourd'hui";
    return format(parseISO(date), 'EEEE d MMMM yyyy', { locale: fr });
  }

  const EditBtn = ({ id }: { id: string }) => (
    <button onClick={() => dispatch(openAppointmentModal(id))} className="btn-ghost py-1.5 px-2.5 text-xs">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Modifier
    </button>
  );
  const ThumbnailStrip = ({ a }: { a: Appointment }) => {
    if (!a.appointment_images || a.appointment_images.length === 0) return null;
    const urls = a.appointment_images.map(img => getAppointmentImageUrl(img.storage_path));
    return (
      <div className="bg-surface-50 rounded-xl px-3 py-2 col-span-2">
        <p className="text-ink-subtle mb-1">Photos</p>
        <div className="flex gap-1.5 flex-wrap">
          {urls.map((url, i) => (
            <button
              key={a.appointment_images![i].id}
              type="button"
              onClick={() => dispatch(openImageLightbox({ images: urls, index: i }))}
              className="block"
            >
              <img src={url} alt="" className="w-12 h-12 object-cover rounded-lg border border-surface-200" />
            </button>
          ))}
        </div>
      </div>
    );
  };

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
      <ImageLightbox />

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

      {/* ── URGENT appointments (no date, always on top) ── */}
      {urgentAppts.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-semibold text-orange-700">Urgent</span>
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{urgentAppts.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentAppts.map(a => (
              <div key={a.id} className="card space-y-3 border-2 border-orange-300 bg-orange-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-orange-800">{a.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-sm">{a.name}</p>
                      <a href={`tel:${a.phone}`} className="text-xs text-brand-600 hover:underline">{a.phone}</a>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full flex-shrink-0">
                    Urgent
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/60 rounded-xl px-3 py-2">
                    <p className="text-ink-subtle mb-0.5">Wilaya</p>
                    <p className="font-medium text-ink">{a.wilaya}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl px-3 py-2">
                    <p className="text-ink-subtle mb-0.5">Service</p>
                    <p className="font-medium text-ink">{a.service_type}</p>
                  </div>
                  {a.description && (
                    <div className="bg-white/60 rounded-xl px-3 py-2 col-span-2">
                      <p className="text-ink-subtle mb-0.5">Description</p>
                      <p className="font-medium text-ink">{a.description}</p>
                    </div>
                  )}
                  <div className="bg-white/60 rounded-xl px-3 py-2 col-span-2">
                    <p className="text-ink-subtle mb-0.5">Ajouté par</p>
                    <p className="font-medium text-ink">{a.added_by || '—'}</p>
                  </div>
                  <ThumbnailStrip a={a} />
                </div>

                <div className="flex gap-2 pt-1">
                  <EditBtn id={a.id} />
                  <DeleteBtn id={a.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MOBILE: grouped cards ── */}
      <div className="md:hidden space-y-6">
        {grouped.length === 0 ? (
          <div className="card text-center py-10 text-ink-subtle text-sm">
            {searchQuery ? 'Aucun résultat trouvé' : 'Aucun rendez-vous pour le moment'}
          </div>
        ) : grouped.map(([date, dayAppts]) => (
          <div key={date}>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-3 px-1">
              <span className={`text-xs font-semibold capitalize ${date === today ? 'text-brand-600' : dayAppts.length === 0 ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                {getDayLabel(date)}
              </span>
              <div className="flex-1 h-px bg-surface-200" />
              {dayAppts.length === 0 ? (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Libre</span>
              ) : (
                <span className="text-xs text-ink-subtle bg-surface-100 px-2 py-0.5 rounded-full">
                  {dayAppts.length}
                </span>
              )}
            </div>

            {dayAppts.length === 0 ? (
              <div className="card flex flex-col items-center gap-2 py-3 text-red-600 text-xs border border-red-200 bg-red-50">
                <span>Aucun rendez-vous ce jour</span>
                <button onClick={() => dispatch(openAppointmentModal({ editId: null, date }))} className="btn-ghost py-1 px-2.5 text-xs !text-red-600 hover:!bg-red-100">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter un rendez-vous
                </button>
              </div>
            ) : (
            <div className="space-y-3">
              {dayAppts.map(a => (
                <div key={a.id} className="card space-y-3">
                  {/* Top row: avatar + name + service badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-brand-700">{a.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-ink text-sm">{a.name}</p>
                        <a href={`tel:${a.phone}`} className="text-xs text-brand-600 hover:underline">{a.phone}</a>
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
                      <p className="text-ink-subtle mb-0.5">Date</p>
                      <p className="font-medium text-ink capitalize">{format(parseISO(a.date!), 'EEE dd/MM/yyyy', { locale: fr })}</p>
                    </div>
                    {a.description && (
                      <div className="bg-surface-50 rounded-xl px-3 py-2 col-span-2">
                        <p className="text-ink-subtle mb-0.5">Description</p>
                        <p className="font-medium text-ink">{a.description}</p>
                      </div>
                    )}
                    <div className="bg-surface-50 rounded-xl px-3 py-2 col-span-2">
                      <p className="text-ink-subtle mb-0.5">Ajouté par</p>
                      <p className="font-medium text-ink">{a.added_by || '—'}</p>
                    </div>
                    <ThumbnailStrip a={a} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <EditBtn id={a.id} />
                    <DeleteBtn id={a.id} />
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        ))}
      </div>

      {/* ── DESKTOP: grouped table ── */}
      <div className="hidden md:block space-y-5">
        {grouped.length === 0 ? (
          <div className="card text-center py-12 text-ink-subtle text-sm">
            {searchQuery ? 'Aucun résultat trouvé' : 'Aucun rendez-vous pour le moment'}
          </div>
        ) : grouped.map(([date, dayAppts]) => (
          <div key={date} className="card overflow-hidden p-0">
            {/* Day header */}
            <div className={`flex items-center gap-3 px-5 py-3 border-b ${date === today ? 'bg-brand-50 border-surface-200' : dayAppts.length === 0 ? 'bg-red-50 border-red-100' : 'bg-surface-50 border-surface-200'}`}>
              <svg className={`w-4 h-4 flex-shrink-0 ${date === today ? 'text-brand-500' : dayAppts.length === 0 ? 'text-red-500' : 'text-ink-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-sm font-semibold capitalize ${date === today ? 'text-brand-700' : dayAppts.length === 0 ? 'text-red-700' : 'text-ink'}`}>
                {getDayLabel(date)}
              </span>
              {dayAppts.length === 0 ? (
                <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-1">Libre</span>
              ) : (
                <span className="text-xs text-ink-subtle bg-surface-100 px-2 py-0.5 rounded-full ml-1">
                  {dayAppts.length}
                </span>
              )}
            </div>

            {dayAppts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-red-600 text-sm bg-red-50">
                <span>Aucun rendez-vous ce jour</span>
                <button onClick={() => dispatch(openAppointmentModal({ editId: null, date }))} className="btn-ghost py-1.5 px-2.5 text-xs !text-red-600 hover:!bg-red-100">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter un rendez-vous
                </button>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="table-head text-left px-5 py-3">Client</th>
                    <th className="table-head text-left px-5 py-3">Téléphone</th>
                    <th className="table-head text-left px-5 py-3">Wilaya</th>
                    <th className="table-head text-left px-5 py-3">Service</th>
                    <th className="table-head text-left px-5 py-3">Date</th>
                    <th className="table-head text-left px-5 py-3">Ajouté par</th>
                    <th className="table-head text-left px-5 py-3">Photos</th>
                    <th className="table-head text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {dayAppts.map(a => (
                    <tr key={a.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-brand-700">{a.name.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium text-ink">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <a href={`tel:${a.phone}`} className="text-brand-600 hover:underline">{a.phone}</a>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-muted">{a.wilaya}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full">
                          {a.service_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-muted capitalize">
                        {format(parseISO(a.date!), 'EEE dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-muted">{a.added_by || '—'}</td>
                      <td className="px-5 py-4">
                        {a.appointment_images && a.appointment_images.length > 0 ? (
                          <div className="flex items-center -space-x-2">
                            {a.appointment_images.slice(0, 3).map((img, i) => (
                              <button
                                key={img.id}
                                type="button"
                                onClick={() => dispatch(openImageLightbox({
                                  images: a.appointment_images!.map(x => getAppointmentImageUrl(x.storage_path)),
                                  index: i,
                                }))}
                                className="block"
                              >
                                <img src={getAppointmentImageUrl(img.storage_path)} alt="" className="w-8 h-8 object-cover rounded-lg border-2 border-white shadow-sm" />
                              </button>
                            ))}
                            {a.appointment_images.length > 3 && (
                              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-100 border-2 border-white text-[10px] font-semibold text-ink-muted">
                                +{a.appointment_images.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-subtle text-sm">—</span>
                        )}
                      </td>
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
