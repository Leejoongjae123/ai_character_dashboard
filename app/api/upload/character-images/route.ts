import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const characterId = formData.get('characterId') as string;
    const slotIndex = formData.get('slotIndex') as string;
    const imageType = formData.get('imageType') as string;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 });
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드할 수 있습니다' }, { status: 400 });
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다' }, { status: 400 });
    }

    // 파일명 생성 (타임스탬프 + 랜덤 + 확장자)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    
    let fileName: string;
    if (imageType === 'picture_select' || imageType === 'picture_character') {
      // 단일 이미지 타입 (picture_select, picture_character)
      fileName = `character_${characterId || 'new'}_${imageType}_${timestamp}_${randomId}.${fileExtension}`;
    } else {
      // 기존 multiple 이미지 타입 (picture_cartoon)
      fileName = `character_${characterId || 'new'}_slot_${slotIndex}_${timestamp}_${randomId}.${fileExtension}`;
    }

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('character')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: '파일 업로드에 실패했습니다' }, { status: 500 });
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('character')
      .getPublicUrl(fileName);

    const responseData: any = {
      url: publicUrl,
      fileName: fileName,
      message: '이미지가 성공적으로 업로드되었습니다'
    };

    // slotIndex가 있는 경우에만 추가 (picture_cartoon 타입)
    if (slotIndex !== null && slotIndex !== undefined) {
      responseData.slotIndex = parseInt(slotIndex);
    }

    // imageType이 있는 경우 추가
    if (imageType) {
      responseData.imageType = imageType;
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { characterId, slotIndex, url, imageType } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다' }, { status: 400 });
    }

    // URL에서 파일명 추출
    const fileName = url.split('/').pop();
    
    if (!fileName) {
      return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 });
    }

    // Supabase Storage에서 파일 삭제
    const { error: deleteError } = await supabase.storage
      .from('character')
      .remove([fileName]);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json({ error: '파일 삭제에 실패했습니다' }, { status: 500 });
    }

    const responseData: any = {
      message: '이미지가 성공적으로 삭제되었습니다',
      characterId
    };

    // slotIndex가 있는 경우에만 추가
    if (slotIndex !== null && slotIndex !== undefined) {
      responseData.slotIndex = slotIndex;
    }

    // imageType이 있는 경우 추가
    if (imageType) {
      responseData.imageType = imageType;
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
