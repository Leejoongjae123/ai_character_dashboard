'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface SingleImageUploadProps {
  label: string;
  description?: string;
  characterId?: number;
  initialImageUrl?: string | null;
  onImageChange?: (imageUrl: string | null) => void;
  imageType: 'picture_select' | 'picture_character';
}

export function SingleImageUpload({ 
  label, 
  description, 
  characterId, 
  initialImageUrl, 
  onImageChange,
  imageType 
}: SingleImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB 제한
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 미리보기 생성
    const previewUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreview(previewUrl);

    // 이미지 업로드 시작
    await uploadImage(selectedFile);
  };

  const uploadImage = async (fileToUpload: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('imageType', imageType);
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
      
      setImageUrl(data.url);
      setFile(null);
      setPreview(null);
      
      // 상위 컴포넌트에 변경사항 알림
      onImageChange?.(data.url);

    } catch (error) {
      console.error('Upload error:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (imageUrl && characterId) {
      // 서버에서 이미지 삭제
      try {
        await fetch('/api/upload/character-images', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            characterId,
            imageType,
            url: imageUrl,
          }),
        });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    // 로컬 상태 업데이트
    setImageUrl(null);
    setFile(null);
    
    // 미리보기 URL 정리
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }

    // 상위 컴포넌트에 변경사항 알림
    onImageChange?.(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || imageUrl;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      
      <div className="relative">
        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
          {displayImage ? (
            <div className="relative w-full h-full">
              <Image
                src={displayImage}
                alt={label}
                fill
                className="object-cover rounded-lg"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-xs">업로드 중...</div>
                </div>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-white border-gray-300 text-black hover:bg-gray-50"
                onClick={removeImage}
                disabled={uploading}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-700"
              onClick={triggerFileSelect}
              disabled={uploading}
            >
              {uploading ? (
                <div className="text-xs">업로드 중...</div>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span className="text-xs">이미지 추가</span>
                </>
              )}
            </button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              handleFileSelect(selectedFile);
            }
            e.target.value = ''; // 같은 파일 다시 선택 가능하게
          }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground">
        • 지원 형식: JPG, PNG, WebP
        • 최대 파일 크기: 5MB
      </div>
    </div>
  );
}
