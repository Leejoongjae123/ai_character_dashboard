import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Image 테이블 데이터 타입 정의
interface ImageRecord {
  id: number;
  created_at: string;
  job_id: string | null;
  picture_camera: string | null;
  result: Record<string, unknown> | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Pagination 계산
    const offset = (page - 1) * limit;

    // image 테이블 조회
    let query = supabase
      .from('image')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // 날짜 범위 필터
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      const dateTo24h = new Date(dateTo);
      dateTo24h.setHours(23, 59, 59, 999);
      query = query.lte('created_at', dateTo24h.toISOString());
    }

    // 검색 필터
    if (search) {
      query = query.or(`job_id.ilike.%${search}%,picture_camera.ilike.%${search}%`);
    }

    // Pagination 적용
    query = query.range(offset, offset + limit - 1);

    const { data: images, error, count } = await query as { 
      data: ImageRecord[] | null, 
      error: Error | null,
      count: number | null 
    };

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: images || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch {
    return NextResponse.json(
      { error: '이미지 이력 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 