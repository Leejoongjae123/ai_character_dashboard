import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  id: string;
}

// PUT: 메세지 수정
export async function PUT(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages) {
      return NextResponse.json({ error: '메세지 내용이 필요합니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('messages')
      .update({
        messages,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '메세지를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: '메세지 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 메세지 삭제
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '메세지가 삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json(
      { error: '메세지 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
