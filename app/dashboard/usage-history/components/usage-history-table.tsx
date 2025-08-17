'use client';

import { UsageLog } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UsageHistoryTableProps {
  logs: UsageLog[];
  onRowClick: (log: UsageLog) => void;
}

export function UsageHistoryTable({ logs, onRowClick }: UsageHistoryTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  const formatJsonPreview = (obj: Record<string, unknown> | null) => {
    if (!obj) {
      return '-';
    }
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return '빈 객체';
    }
    return `${keys.length}개 필드: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        이미지 생성 이력이 없습니다
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>생성 날짜</TableHead>
            <TableHead>Job ID</TableHead>
            <TableHead>카메라 정보</TableHead>
            <TableHead>결과 데이터</TableHead>
            <TableHead className="w-20">상세보기</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow 
              key={log.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(log)}
            >
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div className="text-sm">
                    {new Date(log.created_at).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(log.created_at)}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="font-mono text-sm">
                  {log.job_id ? truncateText(log.job_id, 20) : '-'}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {log.picture_camera ? truncateText(log.picture_camera, 30) : '-'}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatJsonPreview(log.result)}
                </div>
              </TableCell>
              
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(log);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 