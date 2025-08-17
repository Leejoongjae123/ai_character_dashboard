'use client';

import { UsageLog } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Camera, 
  FileText, 
  Hash, 
  CheckCircle, 
  XCircle, 
  Timer, 
  Image as ImageIcon,
  User,
  MessageSquare,
  Upload,
  Download,
  Zap,
  Copy
} from 'lucide-react';

interface UsageHistoryModalProps {
  log: UsageLog | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ResultData {
  error?: string | null;
  job_id?: string;
  timing?: {
    total_time?: number;
    image_upload?: number;
    face_description?: number;
    image_generation?: number;
    background_removal?: number;
    prompt_translation?: number;
    character_image_fetch?: number;
  };
  success?: boolean;
  character_id?: string;
  face_description?: string;
  result_image_url?: string;
  translated_prompt?: string;
  character_image_url?: string;
  background_removed_image_url?: string | null;
}

export function UsageHistoryModal({ log, isOpen, onClose }: UsageHistoryModalProps) {
  if (!log) {
    return null;
  }

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

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(2)}초`;
  };

  const result = log.result as ResultData | null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // 클립보드 복사 실패시 무시
    }
  };

  const InfoRow = ({ 
    icon: Icon, 
    label, 
    value, 
    type = "text" 
  }: { 
    icon: React.ComponentType<any>; 
    label: string; 
    value: string; 
    type?: "text" | "url" | "badge" | "time";
  }) => {
    const renderValue = () => {
      switch (type) {
        case "badge":
          const success = value === "true";
          return (
            <Badge variant={success ? "default" : "destructive"} className={success ? "bg-green-100 text-green-800 border-green-200" : ""}>
              {success ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              {success ? "성공" : "실패"}
            </Badge>
          );
        case "time":
          return <Badge variant="outline">{value}</Badge>;
        case "url":
          return (
            <div className="flex gap-2">
              <Input
                value={value}
                readOnly
                className="flex-1 text-xs bg-muted/50"
                style={{ textOverflow: 'ellipsis' }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(value)}
                className="shrink-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          );
        default:
          return (
            <div className="flex gap-2">
              <Input
                value={value}
                readOnly
                className="flex-1 bg-muted/50"
                style={{ textOverflow: 'ellipsis' }}
              />
              {value && value.length > 20 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(value)}
                  className="shrink-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
      }
    };

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4" />
          {label}
        </Label>
        {renderValue()}
      </div>
    );
  };

  const ImagePreview = ({ url, title }: { url?: string; title: string }) => {
    if (!url) {
      return null;
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={url} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-muted hidden">
              <p className="text-sm text-muted-foreground">이미지를 불러올 수 없습니다</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 break-all">{url}</p>
        </CardContent>
      </Card>
    );
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            이미지 생성 이력 상세정보 (ID: {log.id})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">기본 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={Calendar}
                label="생성 시간"
                value={formatDate(log.created_at)}
              />
              
              <InfoRow
                icon={CheckCircle}
                label="처리 상태"
                value={result?.success?.toString() || "알 수 없음"}
                type="badge"
              />
              
              <InfoRow
                icon={Hash}
                label="작업 ID"
                value={result?.job_id || log.job_id || '데이터 없음'}
              />
              
              <InfoRow
                icon={User}
                label="캐릭터 ID"
                value={result?.character_id || '데이터 없음'}
              />
              
              <InfoRow
                icon={Camera}
                label="카메라 정보"
                value={log.picture_camera || '데이터 없음'}
              />
              
              {result?.timing?.total_time && (
                <InfoRow
                  icon={Timer}
                  label="총 처리 시간"
                  value={formatTime(result.timing.total_time)}
                  type="time"
                />
              )}
            </div>
          </div>

          {/* 에러 메시지 (있는 경우) */}
          {result?.error && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-red-700">오류 정보</h3>
              <InfoRow
                icon={XCircle}
                label="오류 메시지"
                value={result.error}
              />
            </div>
          )}

          {/* 프롬프트 및 설명 */}
          {(result?.translated_prompt || result?.face_description) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">분석 결과</h3>
              
              {result?.translated_prompt && (
                <InfoRow
                  icon={MessageSquare}
                  label="번역된 프롬프트"
                  value={result.translated_prompt}
                />
              )}
              
              {result?.face_description && (
                <InfoRow
                  icon={User}
                  label="얼굴 분석 결과"
                  value={result.face_description}
                />
              )}
            </div>
          )}

          {/* 처리 시간 상세 */}
          {result?.timing && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">처리 시간 상세</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.timing.image_upload && (
                  <InfoRow
                    icon={Upload}
                    label="이미지 업로드"
                    value={formatTime(result.timing.image_upload)}
                    type="time"
                  />
                )}
                
                {result.timing.face_description && (
                  <InfoRow
                    icon={User}
                    label="얼굴 분석"
                    value={formatTime(result.timing.face_description)}
                    type="time"
                  />
                )}
                
                {result.timing.prompt_translation && (
                  <InfoRow
                    icon={MessageSquare}
                    label="프롬프트 번역"
                    value={formatTime(result.timing.prompt_translation)}
                    type="time"
                  />
                )}
                
                {result.timing.character_image_fetch && (
                  <InfoRow
                    icon={Download}
                    label="캐릭터 이미지 가져오기"
                    value={formatTime(result.timing.character_image_fetch)}
                    type="time"
                  />
                )}
                
                {result.timing.image_generation && (
                  <InfoRow
                    icon={Zap}
                    label="이미지 생성"
                    value={formatTime(result.timing.image_generation)}
                    type="time"
                  />
                )}
                
                {result.timing.background_removal && (
                  <InfoRow
                    icon={ImageIcon}
                    label="배경 제거"
                    value={formatTime(result.timing.background_removal)}
                    type="time"
                  />
                )}
              </div>
            </div>
          )}

          {/* 이미지 URL */}
          {(result?.result_image_url || result?.character_image_url || result?.background_removed_image_url) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">이미지 URL</h3>
              
              {result?.character_image_url && (
                <InfoRow
                  icon={ImageIcon}
                  label="캐릭터 이미지 URL"
                  value={result.character_image_url}
                  type="url"
                />
              )}
              
              {result?.result_image_url && (
                <InfoRow
                  icon={ImageIcon}
                  label="생성 결과 이미지 URL"
                  value={result.result_image_url}
                  type="url"
                />
              )}
              
              {result?.background_removed_image_url && (
                <InfoRow
                  icon={ImageIcon}
                  label="배경 제거 이미지 URL"
                  value={result.background_removed_image_url}
                  type="url"
                />
              )}
            </div>
          )}

          {/* 이미지 미리보기 */}
          {(result?.result_image_url || result?.character_image_url || result?.background_removed_image_url) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">이미지 미리보기</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <ImagePreview url={result?.character_image_url} title="캐릭터 이미지" />
                <ImagePreview url={result?.result_image_url} title="생성 결과 이미지" />
                {result?.background_removed_image_url && (
                  <ImagePreview url={result.background_removed_image_url} title="배경 제거 이미지" />
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 