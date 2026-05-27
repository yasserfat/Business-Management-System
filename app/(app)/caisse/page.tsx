import { createServerSupabaseClient } from '@/lib/supabase-server';
import CaisseClient from './CaisseClient';

export default async function CaissePage() {
  const supabase = createServerSupabaseClient();
  const [{ data: transactions }, { data: { session } }] = await Promise.all([
    supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    supabase.auth.getSession(),
  ]);

  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Utilisateur';
  return <CaisseClient initialData={transactions || []} userName={userName} />;
}
