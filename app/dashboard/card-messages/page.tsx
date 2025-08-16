import { createClient } from '@/lib/supabase/server';
import { CardMessagesContent } from './components/card-messages-content';

export default async function CardMessagesPage() {
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
        <h1 className="text-2xl font-bold text-foreground">카드 메세지 관리</h1>
        <p className="text-muted-foreground">카드 메세지를 추가, 수정, 삭제할 수 있습니다</p>
      </div>
      
      <CardMessagesContent />
    </div>
  );
}
