import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ImageData {
  created_at: string;
  result: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || 'daily';

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다' }, { status: 400 });
    }

    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 실패' }, { status: 500 });
    }
    
    // 기간에 따른 날짜 범위 설정
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    let groupByFormat: string;

    switch (period) {
      case 'weekly':
        startDate = subWeeks(now, 4); // 4주
        dateFormat = 'MM/dd';
        groupByFormat = 'week';
        break;
      case 'monthly':
        startDate = subMonths(now, 6); // 6개월
        dateFormat = 'yyyy/MM';
        groupByFormat = 'month';
        break;
      default: // daily
        startDate = subDays(now, 7); // 7일
        dateFormat = 'MM/dd';
        groupByFormat = 'day';
        break;
    }

    // 이미지 데이터 조회 (created_at 기준으로 필터링)
    const { data: images, error } = await supabase
      .from('image')
      .select('created_at, result')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true }) as { data: ImageData[] | null; error: any };

    if (error) {
      return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 });
    }

    // 날짜별로 그룹화
    const dateCountMap = new Map<string, number>();

    // 기간에 따라 빈 데이터 초기화
    if (period === 'daily') {
      for (let i = 0; i < 7; i++) {
        const date = subDays(now, 6 - i);
        const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
        dateCountMap.set(dateKey, 0);
      }
    } else if (period === 'weekly') {
      for (let i = 0; i < 4; i++) {
        const date = subWeeks(now, 3 - i);
        const dateKey = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        dateCountMap.set(dateKey, 0);
      }
    } else if (period === 'monthly') {
      for (let i = 0; i < 6; i++) {
        const date = subMonths(now, 5 - i);
        const dateKey = format(startOfMonth(date), 'yyyy-MM-dd');
        dateCountMap.set(dateKey, 0);
      }
    }

    // 실제 데이터 카운트
    images?.forEach((image: ImageData) => {
      if (image.created_at) {
        const imageDate = parseISO(image.created_at);
        let dateKey: string;

        if (period === 'daily') {
          dateKey = format(startOfDay(imageDate), 'yyyy-MM-dd');
        } else if (period === 'weekly') {
          dateKey = format(startOfWeek(imageDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        } else {
          dateKey = format(startOfMonth(imageDate), 'yyyy-MM-dd');
        }

        if (dateCountMap.has(dateKey)) {
          dateCountMap.set(dateKey, (dateCountMap.get(dateKey) || 0) + 1);
        }
      }
    });

    // 차트 데이터 형식으로 변환
    const chartData = Array.from(dateCountMap.entries())
      .map(([dateKey, count]) => {
        const date = parseISO(dateKey);
        let displayDate: string;

        if (period === 'weekly') {
          displayDate = format(date, 'MM/dd', { locale: ko }) + '주';
        } else if (period === 'monthly') {
          displayDate = format(date, 'yyyy/MM', { locale: ko });
        } else {
          displayDate = format(date, 'MM/dd', { locale: ko });
        }

        return {
          date: dateKey,
          count,
          displayDate
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(chartData);

  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
