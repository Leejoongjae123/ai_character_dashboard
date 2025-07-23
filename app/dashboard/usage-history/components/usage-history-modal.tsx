'use client';

import { UsageLog } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Zap, Image as ImageIcon, FileText } from 'lucide-react';
import Image from 'next/image';

interface UsageHistoryModalProps {
  log: UsageLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UsageHistoryModal({ log, isOpen, onClose }: UsageHistoryModalProps) {
  if (!log) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatPrompt = (prompt: Record<string, unknown> | string | null) => {
    if (!prompt) return '없음';
    if (typeof prompt === 'string') return prompt;
    return JSON.stringify(prompt, null, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            사용이력 상세정보
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">생성시간</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {formatDate(log.created_at)}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">캐릭터 정보</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="font-medium">{log.character?.name || '알 수 없음'}</p>
                <Badge variant="secondary">{log.character?.role || '미지정'}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* 능력 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">능력 설정</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">능력 1</h4>
                <div className="space-y-1">
                  <p className="text-sm">{log.ability1 || '미지정'}</p>
                  {log.ability1_min !== undefined && log.ability1_max !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      범위: {log.ability1_min} ~ {log.ability1_max}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">능력 2</h4>
                <div className="space-y-1">
                  <p className="text-sm">{log.ability2 || '미지정'}</p>
                  {log.ability2_min !== undefined && log.ability2_max !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      범위: {log.ability2_min} ~ {log.ability2_max}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 프롬프트 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">프롬프트</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap break-words">
                {formatPrompt(log.prompt)}
              </pre>
            </div>
          </div>

          {/* 이미지 정보 */}
          {(log.origin_image || log.character_image) && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">이미지</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  {log.origin_image && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">원본 이미지</h4>
                      <div className="relative aspect-square w-full max-w-xs border rounded-lg overflow-hidden">
                        <Image
                          src={log.origin_image}
                          alt="원본 이미지"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {log.character_image && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">캐릭터 이미지</h4>
                      <div className="relative aspect-square w-full max-w-xs border rounded-lg overflow-hidden">
                        <Image
                          src={log.character_image}
                          alt="캐릭터 이미지"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 기술적 정보 */}
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium">기술적 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">로그 ID:</span> {log.id}
              </div>
              <div>
                <span className="font-medium">캐릭터 ID:</span> {log.character_id}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 