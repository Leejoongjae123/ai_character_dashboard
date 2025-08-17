import { createClient } from '@/lib/supabase/server';
import { UsageHistoryContent } from './components/usage-history-content';

export default async function UsageHistoryPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <div>Supabase 연결 오류</div>;
  }
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">이미지 생성 이력</h1>
        <p className="text-muted-foreground">이미지 생성 기록을 확인하고 상세 결과를 조회하세요</p>
      </div>
      
      <UsageHistoryContent userId={user.id} />
    </div>
  );
} 