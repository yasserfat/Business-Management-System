import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Sidebar from '@/components/layout/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const userName = session.user.user_metadata?.full_name || '';
  const userEmail = session.user.email || '';

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} userEmail={userEmail} />
      <main className=" lg:ml-[var(--sidebar-width)] flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
