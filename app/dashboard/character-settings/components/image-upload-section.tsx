'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageSlot {
  id: number;
  file?: File;
  url?: string;
  preview?: string;
}

interface ImageUploadSectionProps {
  characterId?: number;
  initialImages?: Array<{ url: string }>;
  onImagesChange?: (images: Array<{ url: string }>) => void;
}

export function ImageUploadSection({ characterId, initialImages = [], onImagesChange }: ImageUploadSectionProps) {
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() => {
    const slots = Array.from({ length: 5 }, (_, index) => ({
      id: index,
      url: initialImages[index]?.url,
    }));
    return slots;
  });
  
  const [uploading, setUploading] = useState<Set<number>>(new Set());
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileSelect = async (slotIndex: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB 제한
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 미리보기 생성
    const preview = URL.createObjectURL(file);
    
    setImageSlots(prev => prev.map(slot => 
      slot.id === slotIndex 
        ? { ...slot, file, preview }
        : slot
    ));

    // 이미지 업로드 시작
    await uploadImage(slotIndex, file);
  };

  const uploadImage = async (slotIndex: number, file: File) => {
    setUploading(prev => new Set(prev).add(slotIndex));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slotIndex', slotIndex.toString());
      if (characterId) {
        formData.append('characterId', characterId.toString());
      }

      const response = await fetch('/api/upload/character-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || '이미지 업로드에 실패했습니다.');
        return;
      }

      const data = await response.json();
      
      setImageSlots(prev => prev.map(slot => 
        slot.id === slotIndex 
          ? { ...slot, url: data.url, file: undefined, preview: undefined }
          : slot
      ));

          // 상위 컴포넌트에 변경사항 알림
    const updatedImages = imageSlots
      .map(slot => (slot.id === slotIndex ? { url: data.url } : slot.url ? { url: slot.url } : null))
      .filter(Boolean) as Array<{ url: string }>;
    
    onImagesChange?.(updatedImages);

    } catch (error) {
      console.error('Upload error:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(prev => {
        const newSet = new Set(prev);
        newSet.delete(slotIndex);
        return newSet;
      });
    }
  };

  const removeImage = async (slotIndex: number) => {
    const slot = imageSlots[slotIndex];
    
    if (slot.url && characterId) {
      // 서버에서 이미지 삭제
      try {
        await fetch('/api/upload/character-images', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            characterId,
            slotIndex,
            url: slot.url,
          }),
        });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    // 로컬 상태 업데이트
    setImageSlots(prev => prev.map(slot => 
      slot.id === slotIndex 
        ? { id: slot.id }
        : slot
    ));

    // 상위 컴포넌트에 변경사항 알림
    const updatedImages = imageSlots
      .map(slot => slot.id === slotIndex ? null : (slot.url ? { url: slot.url } : null))
      .filter(Boolean) as Array<{ url: string }>;
    
    onImagesChange?.(updatedImages);

    // 미리보기 URL 정리
    if (slot.preview) {
      URL.revokeObjectURL(slot.preview);
    }
  };

  const triggerFileSelect = (slotIndex: number) => {
    fileInputRefs.current[slotIndex]?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">캐리커쳐 생성용 이미지 (최대 5개)</Label>
        <p className="text-sm text-muted-foreground mt-1">
          이미지를 업로드하면 캐릭터의 picture_cartoon 필드에 저장됩니다.
        </p>
      </div>
      
      <div className="grid grid-cols-5 gap-4">
        {imageSlots.map((slot, index) => (
          <div key={slot.id} className="relative">
            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
              {slot.preview || slot.url ? (
                <div className="relative w-full h-full">
                  <Image
                    src={slot.preview || slot.url || ''}
                    alt={`캐릭터 이미지 ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {uploading.has(slot.id) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-xs">업로드 중...</div>
                    </div>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-white border-gray-300 text-black hover:bg-gray-50"
                    onClick={() => removeImage(slot.id)}
                    disabled={uploading.has(slot.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700"
                  onClick={() => triggerFileSelect(slot.id)}
                  disabled={uploading.has(slot.id)}
                >
                  {uploading.has(slot.id) ? (
                    <div className="text-xs">업로드 중...</div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="text-xs">이미지 추가</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            <input
              ref={(el) => { fileInputRefs.current[slot.id] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(slot.id, file);
                }
                e.target.value = ''; // 같은 파일 다시 선택 가능하게
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground">
        • 지원 형식: JPG, PNG, WebP
        • 최대 파일 크기: 5MB
        • 권장 비율: 1:1 (정사각형)
      </div>
    </div>
  );
}
