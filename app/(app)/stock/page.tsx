import { createServerSupabaseClient } from '@/lib/supabase-server';
import StockClient from './StockClient';

export default async function StockPage() {
  const supabase = await  createServerSupabaseClient();
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  return <StockClient initialData={products || []} />;
}
