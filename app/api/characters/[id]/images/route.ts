import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// 캐릭터의 picture_cartoon 필드 업데이트
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }
    
    const { id } = await params;
    const { images } = await request.json();

    // images 형태 검증: [{"url": "xxx"}, {"url": "yyy"}]
    if (!Array.isArray(images)) {
      return NextResponse.json({ error: '이미지 배열이 필요합니다' }, { status: 400 });
    }

    // 각 이미지 객체가 올바른 형태인지 확인
    const validImages = images.filter(img => 
      img && typeof img === 'object' && typeof img.url === 'string' && img.url.trim() !== ''
    );

    // 최대 5개 제한
    if (validImages.length > 5) {
      return NextResponse.json({ error: '최대 5개의 이미지만 업로드할 수 있습니다' }, { status: 400 });
    }

    // 캐릭터 소유권 확인
    const { data: character, error: fetchError } = await supabase
      .from('character')
      .select('user_id, name')
      .eq('id', id)
      .single();

    if (fetchError || !character) {
      return NextResponse.json({ error: '캐릭터를 찾을 수 없습니다' }, { status: 404 });
    }

    if (character.user_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // picture_cartoon 필드 업데이트
    const { data: updatedCharacter, error: updateError } = await supabase
      .from('character')
      .update({ 
        picture_cartoon: validImages.length > 0 ? validImages : null 
      })
      .eq('id', id)
      .select('id, name, picture_cartoon')
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: '이미지 업데이트에 실패했습니다' }, { status: 500 });
    }

    // 로그 생성
    await supabase.from('logs').insert([{
      user_id: user.id,
      action_type: 'update_images',
      character_id: parseInt(id),
      details: {
        description: `캐릭터 "${character.name}" 이미지 업데이트 (${validImages.length}개)`,
        image_count: validImages.length
      }
    }]);

    return NextResponse.json({
      success: true,
      character: updatedCharacter,
      message: `이미지가 성공적으로 업데이트되었습니다 (${validImages.length}개)`
    });

  } catch (error) {
    console.error('Images API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 캐릭터의 현재 이미지 목록 조회
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 연결 오류' }, { status: 500 });
    }

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }
    
    const { id } = await params;

    // 캐릭터 정보 조회
    const { data: character, error } = await supabase
      .from('character')
      .select('id, name, picture_cartoon, user_id')
      .eq('id', id)
      .single();

    if (error || !character) {
      return NextResponse.json({ error: '캐릭터를 찾을 수 없습니다' }, { status: 404 });
    }

    if (character.user_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    return NextResponse.json({
      characterId: character.id,
      characterName: character.name,
      images: character.picture_cartoon || []
    });

  } catch (error) {
    console.error('Images GET API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
