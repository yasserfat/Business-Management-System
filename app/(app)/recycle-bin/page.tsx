import { createServerSupabaseClient } from '@/lib/supabase-server';
import RecycleBinClient from './RecycleBinClient';

export default async function RecycleBinPage() {
  const supabase = await createServerSupabaseClient();
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, appointment_images(*)')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  return <RecycleBinClient initialData={appointments || []} />;
}
