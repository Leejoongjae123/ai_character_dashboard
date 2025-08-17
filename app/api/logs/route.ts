import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Supabase에서 반환되는 데이터 타입 정의
interface LogWithCharacter {
  id: number;
  created_at: string;
  character_id: number;
  prompt: Record<string, unknown> | string | null;
  origin_image?: string;
  character_image?: string;
  ability1?: string;
  ability1_min?: number;
  ability1_max?: number;
  ability2?: string;
  ability2_min?: number;
  ability2_max?: number;
  character: {
    id: number;
    name: string;
    role: string;
    user_id: string;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const characterId = searchParams.get('characterId');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const abilityType = searchParams.get('abilityType');

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다' }, { status: 400 });
    }

    // logs와 character를 조인하여 조회
    let query = supabase
      .from('logs')
      .select(`
        *,
        character:character_id (
          id,
          name,
          role,
          user_id
        )
      `)
      .eq('character.user_id', userId)
      .order('created_at', { ascending: false });

    // 캐릭터 ID 필터
    if (characterId) {
      query = query.eq('character_id', characterId);
    }

    // 날짜 범위 필터
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data: logs, error } = await query as { data: LogWithCharacter[] | null, error: Error | null };

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 검색 필터 (클라이언트에서 처리하기 위해 모든 데이터 반환 후 필터링)
    let filteredLogs: LogWithCharacter[] = logs || [];

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredLogs = filteredLogs.filter((log: LogWithCharacter) => 
        log.character?.name?.toLowerCase().includes(searchTerm) ||
        log.character?.role?.toLowerCase().includes(searchTerm) ||
        log.ability1?.toLowerCase().includes(searchTerm) ||
        log.ability2?.toLowerCase().includes(searchTerm)
      );
    }

    if (abilityType) {
      filteredLogs = filteredLogs.filter((log: LogWithCharacter) => 
        log.ability1?.includes(abilityType) || log.ability2?.includes(abilityType)
      );
    }

    return NextResponse.json(filteredLogs);
  } catch {
    return NextResponse.json(
      { error: '사용이력 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 