import { createClient } from '@/lib/supabase/server';
import { DashboardStats } from './components/dashboard-stats';
import { RecentActivity } from './components/recent-activity';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드 개요</h1>
        <p className="text-muted-foreground">AI 캐릭터 사용 현황을 확인하세요</p>
      </div>
      
      <DashboardStats userId={user.id} />
      <RecentActivity userId={user.id} />
    </div>
  );
} 