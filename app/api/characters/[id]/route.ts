import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }
    
    const { id } = await params;
    const body = await request.json();

    const { data: character, error } = await supabase
      .from('character')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 로그 생성
    await supabase.from('logs').insert([{
      user_id: character.user_id,
      action_type: 'update',
      character_id: character.id,
      details: {
        description: `캐릭터 "${character.name}" 수정`
      }
    }]);

    return NextResponse.json(character);
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }
    
    const { id } = await params;

    // 먼저 캐릭터 정보를 가져옴
    const { data: character } = await supabase
      .from('character')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('character')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 로그 생성
    if (character) {
      await supabase.from('logs').insert([{
        user_id: character.user_id,
        action_type: 'delete',
        character_id: parseInt(id),
        details: {
          description: `캐릭터 "${character.name}" 삭제`
        }
      }]);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 