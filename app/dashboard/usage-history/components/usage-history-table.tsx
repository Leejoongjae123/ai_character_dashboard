'use client';

import { UsageLog } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Image } from 'lucide-react';
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

  const formatAbilityRange = (ability: string | undefined, min: number | undefined, max: number | undefined) => {
    if (!ability) return '-';
    if (min !== undefined && max !== undefined) {
      return `${ability} (${min}-${max})`;
    }
    return ability;
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        사용이력이 없습니다
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
            <TableHead>캐릭터</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>능력 1</TableHead>
            <TableHead>능력 2</TableHead>
            <TableHead>프롬프트</TableHead>
            <TableHead>이미지</TableHead>
            <TableHead className="w-20">작업</TableHead>
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
                <div className="font-medium">
                  {log.character?.name || '알 수 없음'}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="secondary">
                  {log.character?.role || '미지정'}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {formatAbilityRange(log.ability1, log.ability1_min, log.ability1_max)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {formatAbilityRange(log.ability2, log.ability2_min, log.ability2_max)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground max-w-xs">
                  {log.prompt ? (
                    typeof log.prompt === 'string' 
                      ? truncateText(log.prompt)
                      : truncateText(JSON.stringify(log.prompt))
                  ) : '-'}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {log.origin_image && (
                    <Badge variant="outline" className="text-xs">
                      <Image className="w-3 h-3 mr-1" />
                      원본
                    </Badge>
                  )}
                  {log.character_image && (
                    <Badge variant="outline" className="text-xs">
                      <Image className="w-3 h-3 mr-1" />
                      캐릭터
                    </Badge>
                  )}
                  {!log.origin_image && !log.character_image && (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
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