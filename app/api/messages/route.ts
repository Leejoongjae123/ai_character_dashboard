import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: 모든 메세지 조회
export async function GET() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: '메세지를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 메세지 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }

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
      .insert([
        {
          messages,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '메세지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
