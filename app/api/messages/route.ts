import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: 메세지 조회 (pagination 지원)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // 페이지 유효성 검사
    const currentPage = Math.max(1, page);
    const itemsPerPage = Math.min(Math.max(1, limit), 100); // 최대 100개로 제한
    const offset = (currentPage - 1) * itemsPerPage;

    // 쿼리 빌더 시작
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' });

    // 검색 필터 적용
    if (search && search.trim()) {
      query = query.ilike('messages', `%${search.trim()}%`);
    }

    // 날짜 필터 적용
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // 정렬 및 페이지네이션 적용
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    const { data: messages, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const pagination = {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };

    return NextResponse.json({
      data: messages || [],
      pagination,
    });
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
