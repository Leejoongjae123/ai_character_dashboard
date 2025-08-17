import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // 전체 개수 조회
    const { count, error: countError } = await supabase
      .from('character')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // 페이지네이션을 적용한 데이터 조회
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: characters, error } = await supabase
      .from('character')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: characters,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }
    
    const body = await request.json();

    const { data: character, error } = await supabase
      .from('character')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 로그 생성
    await supabase.from('logs').insert([{
      user_id: body.user_id,
      action_type: 'create',
      character_id: character.id,
      details: {
        description: `캐릭터 "${character.name}" 생성`
      }
    }]);

    return NextResponse.json(character);
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 