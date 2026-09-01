'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeAppointmentModal } from '@/store/slices/uiSlice';
import { addAppointment, updateAppointment } from '@/store/slices/appointmentsSlice';
import { WILAYAS } from '@/lib/constants'; // removed SERVICE_TYPES import
import { Appointment, AppointmentImage } from '@/types';
import { APPOINTMENT_IMAGES_BUCKET, getAppointmentImageUrl } from '@/lib/storage';

interface Props { userName: string; }

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AppointmentModal({ userName }: Props) {
  const dispatch = useAppDispatch();
  const { open, editId, defaultDate } = useAppSelector(s => s.ui.appointmentModal);
  const appointments = useAppSelector(s => s.appointments.items);
  const supabase = createClient();

  const editItem = editId ? appointments.find(a => a.id === editId) : null;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    wilaya: '',
    service_type: '',
    date: '',
    description: '',
    urgent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const [existingImages, setExistingImages] = useState<AppointmentImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const newFilePreviews = useMemo(() => newFiles.map(f => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => {
    return () => newFilePreviews.forEach(url => URL.revokeObjectURL(url));
  }, [newFilePreviews]);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        phone: editItem.phone,
        wilaya: editItem.wilaya,
        service_type: editItem.service_type,
        date: editItem.date ?? new Date().toISOString().slice(0, 10),
        description: editItem.description ?? '',
        urgent: editItem.urgent ?? false,
      });
      setExistingImages(editItem.appointment_images ?? []);
    } else {
      setForm({
        name: '',
        phone: '',
        wilaya: '',
        service_type: '',
        date: defaultDate ?? '',
        description: '',
        urgent: false,
      });
      setExistingImages([]);
    }
    setRemovedImageIds([]);
    setNewFiles([]);
    setError('');
    setWarning('');
  }, [editId, open, defaultDate]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" n'est pas une image.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" dépasse la taille maximale de 5 Mo.`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length) setNewFiles(prev => [...prev, ...valid]);
  };

  const removeExistingImage = (id: string) => {
    setRemovedImageIds(prev => [...prev, id]);
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadNewFiles = async (appointmentId: string): Promise<AppointmentImage[]> => {
    if (newFiles.length === 0) return [];
    const uploaded: { storage_path: string }[] = [];
    let failCount = 0;
    for (const file of newFiles) {
      const path = `${appointmentId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(APPOINTMENT_IMAGES_BUCKET).upload(path, file);
      if (uploadError) { failCount++; continue; }
      uploaded.push({ storage_path: path });
    }
    if (failCount > 0) {
      setWarning(`${failCount} image(s) n'ont pas pu être téléchargées.`);
    }
    if (uploaded.length === 0) return [];
    const { data, error: insertError } = await supabase
      .from('appointment_images')
      .insert(uploaded.map(u => ({ appointment_id: appointmentId, storage_path: u.storage_path })))
      .select();
    if (insertError || !data) return [];
    return data as AppointmentImage[];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWarning('');

    const payload = { ...form, date: form.urgent ? null : form.date, added_by: userName };

    if (editId) {
      const { data, error } = await supabase
        .from('appointments').update(payload).eq('id', editId).select().single();
      if (error) { setError(error.message); setLoading(false); return; }

      let finalImages = existingImages.filter(img => !removedImageIds.includes(img.id));

      if (removedImageIds.length > 0) {
        const { data: removedRows } = await supabase
          .from('appointment_images').delete().in('id', removedImageIds).select();
        const paths = (removedRows as AppointmentImage[] | null)?.map(r => r.storage_path) ?? [];
        if (paths.length) await supabase.storage.from(APPOINTMENT_IMAGES_BUCKET).remove(paths);
      }

      const insertedImages = await uploadNewFiles(editId);
      finalImages = [...finalImages, ...insertedImages];

      dispatch(updateAppointment({ ...(data as Appointment), appointment_images: finalImages }));
      dispatch(closeAppointmentModal());
    } else {
      const newId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('appointments').insert({ id: newId, ...payload }).select().single();
      if (error) { setError(error.message); setLoading(false); return; }

      const insertedImages = await uploadNewFiles(newId);

      dispatch(addAppointment({ ...(data as Appointment), appointment_images: insertedImages }));
      dispatch(closeAppointmentModal());
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => dispatch(closeAppointmentModal())}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
          <h2 className="font-display font-bold text-ink">
            {editId ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          </h2>
          <button onClick={() => dispatch(closeAppointmentModal())} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nom complet</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nom du client" required />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0550 000 000" required />
            </div>
            <div>
              <label className="label">Wilaya</label>
              <select className="input-field" value={form.wilaya} onChange={e => setForm({...form, wilaya: e.target.value})} required>
                <option value="" disabled>Sélectionner une wilaya</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type de service</label>
              <input
                className="input-field"
                value={form.service_type}
                onChange={e => setForm({...form, service_type: e.target.value})}
                placeholder="Ex: Consultation, Livraison..."
                required
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                value={form.urgent ? '' : form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                disabled={form.urgent}
                required={!form.urgent}
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-red-600"
                  checked={form.urgent}
                  onChange={e => setForm({...form, urgent: e.target.checked})}
                />
                <span className="text-sm font-medium text-red-700">Rendez-vous urgent</span>
                <span className="text-xs text-red-500">(sans date, affiché en priorité)</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Détails supplémentaires sur le rendez-vous..."
              />
            </div>
            <div className="col-span-2">
              <label className="label">Photos</label>
              <label className="btn-secondary cursor-pointer inline-flex">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
                </svg>
                Ajouter des photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => { handleFilesSelected(e.target.files); e.target.value = ''; }}
                />
              </label>

              {(existingImages.filter(img => !removedImageIds.includes(img.id)).length > 0 || newFiles.length > 0) && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {existingImages.filter(img => !removedImageIds.includes(img.id)).map(img => (
                    <div key={img.id} className="relative w-16 h-16 group">
                      <img src={getAppointmentImageUrl(img.storage_path)} alt="" className="w-16 h-16 object-cover rounded-xl border border-surface-200" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {newFiles.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 group">
                      <img src={newFilePreviews[i]} alt="" className="w-16 h-16 object-cover rounded-xl border border-surface-200" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="p-3 bg-surface-50 rounded-xl flex items-center gap-2 text-xs text-ink-muted">
            <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Ajouté par : <span className="font-semibold text-ink">{userName}</span>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
          {warning && <p className="text-orange-600 text-sm bg-orange-50 p-3 rounded-xl">{warning}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => dispatch(closeAppointmentModal())} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}