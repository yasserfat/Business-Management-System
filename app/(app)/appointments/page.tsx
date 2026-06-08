import { createServerSupabaseClient } from '@/lib/supabase-server';
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage() {
  const supabase =  await  createServerSupabaseClient();
const [{ data: appointments }, { data: { user } }] = await Promise.all([
  supabase.from('appointments').select('*').order('date', { ascending: false }),
  supabase.auth.getUser(),
]);
const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

  return <AppointmentsClient initialData={appointments || []} userName={userName} />;
}