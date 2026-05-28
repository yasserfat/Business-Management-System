'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeAppointmentModal } from '@/store/slices/uiSlice';
import { addAppointment, updateAppointment } from '@/store/slices/appointmentsSlice';
import { WILAYAS, SERVICE_TYPES } from '@/lib/constants';
import { Appointment } from '@/types';

interface Props { userName: string; }

export default function AppointmentModal({ userName }: Props) {
  const dispatch = useAppDispatch();
  const { open, editId } = useAppSelector(s => s.ui.appointmentModal);
  const appointments = useAppSelector(s => s.appointments.items);
  const supabase = createClient();

  const editItem = editId ? appointments.find(a => a.id === editId) : null;

  const [form, setForm] = useState({
  name: '', phone: '', wilaya: WILAYAS[18], service_type: SERVICE_TYPES[0],
  datetime: new Date().toISOString().slice(0, 10),
  description: '',   // ← add this
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        phone: editItem.phone,
        wilaya: editItem.wilaya,
        service_type: editItem.service_type,
        datetime: editItem.datetime.slice(0, 10),
          description: editItem.description ?? '', 
      });
    } else {
      setForm({ name: '', phone: '', wilaya: WILAYAS[18], service_type: SERVICE_TYPES[0], datetime: new Date().toISOString().slice(0, 10) });
    }
    setError('');
  }, [editId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { ...form, added_by: userName };

    if (editId) {
      const { data, error } = await supabase
        .from('appointments').update(payload).eq('id', editId).select().single();
      if (error) { setError(error.message); }
      else { dispatch(updateAppointment(data as Appointment)); dispatch(closeAppointmentModal()); }
    } else {
      const { data, error } = await supabase
        .from('appointments').insert(payload).select().single();
      if (error) { setError(error.message); }
      else { dispatch(addAppointment(data as Appointment)); dispatch(closeAppointmentModal()); }
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
              <select className="input-field" value={form.wilaya} onChange={e => setForm({...form, wilaya: e.target.value})}>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type de service</label>
              <input className="input-field" value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value})}/>
              
            </div>
            <div>
              <label className="label">Date </label>
<input type="date" className="input-field" value={form.datetime} onChange={e => setForm({...form, datetime: e.target.value})} required />
            </div>
          </div>
          <div className="col-span-2">
  <label className="label">Description</label>
  <textarea
    className="input-field resize-none"
    rows={3}
    value={form.description}
    onChange={e => setForm({...form, description: e.target.value})}
    placeholder="Notes ou détails supplémentaires..."
  />
</div>
          <div className="p-3 bg-surface-50 rounded-xl flex items-center gap-2 text-xs text-ink-muted">
            <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Ajouté par : <span className="font-semibold text-ink">{userName}</span>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
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
