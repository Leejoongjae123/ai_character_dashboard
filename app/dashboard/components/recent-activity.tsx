import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface RecentActivityProps {
  userId: string;
}

export async function RecentActivity({ userId }: RecentActivityProps) {
  const supabase = await createClient();
  if (!supabase) {
    return <div>Supabase 연결 오류</div>;
  }

  const { data: logs } = await supabase
    .from('logs')
    .select(`
      *,
      character:character_id (
        name
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'use':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return '생성';
      case 'update':
        return '수정';
      case 'delete':
        return '삭제';
      case 'use':
        return '사용';
      default:
        return actionType;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Badge variant={getActionBadgeVariant(log.action_type || '')}>
                    {getActionLabel(log.action_type || '')}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">
                      {log.character?.name || '알 수 없는 캐릭터'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.details?.description || '세부 정보 없음'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            최근 활동이 없습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 