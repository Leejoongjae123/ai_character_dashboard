import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { BarChart3, Users, Star } from 'lucide-react';

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const supabase = await createClient();
  if (!supabase) {
    return <div>Supabase 연결 오류</div>;
  }

  // 통계 데이터 조회
  const [
    { data: characters },
    { data: images },
  ] = await Promise.all([
    supabase
      .from('character')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true),
    supabase
      .from('image')
      .select('result'),
  ]);

  const totalCharacters = characters?.length || 0;
  // image 테이블의 갯수로 총 사용량 계산
  const totalUsage = images?.length || 0;

  // image 테이블의 result에서 character_id 추출하여 선호 캐릭터 계산
  const characterUsageMap = new Map<string, number>();
  
  images?.forEach((image) => {
    if (image.result && image.result.character_id) {
      const characterId = image.result.character_id;
      characterUsageMap.set(characterId, (characterUsageMap.get(characterId) || 0) + 1);
    }
  });

  // 가장 많이 사용된 캐릭터 찾기
  let favoriteCharacterId: string | null = null;
  let maxUsage = 0;
  
  for (const [characterId, usageCount] of characterUsageMap.entries()) {
    if (usageCount > maxUsage) {
      maxUsage = usageCount;
      favoriteCharacterId = characterId;
    }
  }

  // 선호 캐릭터 정보 조회
  const favoriteCharacter = favoriteCharacterId 
    ? characters?.find(c => c.id.toString() === favoriteCharacterId)
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
      description: '이미지 생성 횟수',
    },
    {
      title: '선호 캐릭터',
      value: favoriteCharacter?.name || '없음',
      icon: Star,
      description: '가장 많이 사용한 캐릭터',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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