import { createServerSupabaseClient } from '@/lib/supabase-server';
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage() {
  const supabase = createServerSupabaseClient();
  const [{ data: appointments }, { data: { session } }] = await Promise.all([
    supabase.from('appointments').select('*').order('date', { ascending: false }), // ← was 'datetime'
    supabase.auth.getSession(),
  ]);

  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Utilisateur';

  return <AppointmentsClient initialData={appointments || []} userName={userName} />;
}