import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { BarChart3, Users, Activity, Star } from 'lucide-react';

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const supabase = await createClient();

  // 통계 데이터 조회
  const [
    { data: characters },
    { data: statistics },
    { data: recentLogs },
  ] = await Promise.all([
    supabase
      .from('character')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true),
    supabase
      .from('statistics')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const totalCharacters = characters?.length || 0;
  const totalUsage = statistics?.total_usage_count || 0;
  const favoriteCharacterId = statistics?.favorite_character_id;
  const recentActivity = recentLogs?.length || 0;

  // 선호 캐릭터 정보 조회
  const favoriteCharacter = favoriteCharacterId 
    ? characters?.find(c => c.id === favoriteCharacterId)
    : null;

  const statsCards = [
    {
      title: '총 캐릭터 수',
      value: totalCharacters.toString(),
      icon: Users,
      description: '활성화된 캐릭터',
    },
    {
      title: '총 사용량',
      value: totalUsage.toString(),
      icon: BarChart3,
      description: '누적 사용 횟수',
    },
    {
      title: '최근 활동',
      value: recentActivity.toString(),
      icon: Activity,
      description: '최근 5개 활동',
    },
    {
      title: '선호 캐릭터',
      value: favoriteCharacter?.name || '없음',
      icon: Star,
      description: '가장 많이 사용한 캐릭터',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 