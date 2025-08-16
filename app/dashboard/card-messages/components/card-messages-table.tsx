'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Message } from '@/lib/types';
import { Edit } from 'lucide-react';

interface CardMessagesTableProps {
  messages: Message[];
  onRowClick: (message: Message) => void;
}

export function CardMessagesTable({ messages, onRowClick }: CardMessagesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>메세지 목록 ({messages.length}개)</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>메세지 내용</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="w-[50px]">편집</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow 
                  key={message.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick(message)}
                >
                  <TableCell>
                    <span className="font-medium">#{message.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[400px]">
                      <p className="truncate">
                        {message.messages || '내용 없음'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            메세지가 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
