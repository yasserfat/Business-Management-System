'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDeletedAppointments, removeFromRecycleBin } from '@/store/slices/recycleBinSlice';
import { openDeleteConfirm, openImageLightbox } from '@/store/slices/uiSlice';
import { Appointment } from '@/types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import ImageLightbox from '@/components/appointments/ImageLightbox';
import { getAppointmentImageUrl } from '@/lib/storage';

interface Props { initialData: Appointment[]; }

export default function RecycleBinClient({ initialData }: Props) {
  const dispatch = useAppDispatch();
  const supabase = createClient();
  const items = useAppSelector(s => s.recycleBin.items);

  useEffect(() => { dispatch(setDeletedAppointments(initialData)); }, []);

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from('appointments')
      .update({ deleted_at: null, deleted_by_name: null, deleted_by_email: null })
      .eq('id', id);
    if (!error) dispatch(removeFromRecycleBin(id));
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in mt-[60px] lg:mt-0 overflow-x-hidden">
      <DeleteConfirmModal />
      <ImageLightbox />

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Corbeille</h1>
        <p className="text-ink-muted text-sm mt-1">{items.length} rendez-vous supprimé(s)</p>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12 text-ink-subtle text-sm">
          La corbeille est vide
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(a => {
            const urls = (a.appointment_images ?? []).map(img => getAppointmentImageUrl(img.storage_path));
            return (
              <div key={a.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-ink-muted">{a.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-sm">{a.name}</p>
                      <a href={`tel:${a.phone}`} className="text-xs text-brand-600 hover:underline">{a.phone}</a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRestore(a.id)} className="btn-secondary py-1.5 px-2.5 text-xs">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restaurer
                    </button>
                    <button
                      onClick={() => dispatch(openDeleteConfirm({ type: 'appointment-permanent', id: a.id }))}
                      className="btn-ghost py-1.5 px-2.5 text-xs !text-red-500 hover:!bg-red-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer définitivement
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-surface-50 rounded-xl px-3 py-2">
                    <p className="text-ink-subtle mb-0.5">Wilaya</p>
                    <p className="font-medium text-ink">{a.wilaya}</p>
                  </div>
                  <div className="bg-surface-50 rounded-xl px-3 py-2">
                    <p className="text-ink-subtle mb-0.5">Service</p>
                    <p className="font-medium text-ink">{a.service_type}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl px-3 py-2">
                    <p className="text-red-500 mb-0.5">Supprimé le</p>
                    <p className="font-medium text-red-700 capitalize">
                      {a.deleted_at ? format(parseISO(a.deleted_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : '—'}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl px-3 py-2">
                    <p className="text-red-500 mb-0.5">Supprimé par</p>
                    <p className="font-medium text-red-700">
                      {a.deleted_by_name || '—'}
                      {a.deleted_by_email && <span className="block text-[10px] text-red-500 font-normal">{a.deleted_by_email}</span>}
                    </p>
                  </div>
                </div>

                {urls.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {urls.map((url, i) => (
                      <button key={a.appointment_images![i].id} type="button" onClick={() => dispatch(openImageLightbox({ images: urls, index: i }))}>
                        <img src={url} alt="" className="w-12 h-12 object-cover rounded-lg border border-surface-200" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
