import { createClient } from '@/lib/supabase/server';
import { UsageHistoryContent } from './components/usage-history-content';

export default async function UsageHistoryPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">사용이력</h1>
        <p className="text-muted-foreground">AI 캐릭터 사용 기록을 확인하고 관리하세요</p>
      </div>
      
      <UsageHistoryContent userId={user.id} />
    </div>
  );
} 