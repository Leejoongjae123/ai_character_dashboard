import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from './components/sidebar';
import { Header } from './components/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const supabase = await createClient();
  if (!supabase) {
    return <div>Supabase 연결 오류</div>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 