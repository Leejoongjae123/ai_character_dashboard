'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Character } from '@/lib/types';
import { Edit } from 'lucide-react';

interface CharacterTableProps {
  characters: Character[];
  onRowClick: (character: Character) => void;
}

export function CharacterTable({ characters, onRowClick }: CharacterTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>캐릭터 목록 ({characters.length}개)</CardTitle>
      </CardHeader>
      <CardContent>
        {characters.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>능력</TableHead>
                <TableHead>사용횟수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>최근 사용</TableHead>
                <TableHead className="w-[50px]">편집</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {characters.map((character) => (
                <TableRow 
                  key={character.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick(character)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{character.name || '이름 없음'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {character.description || '설명 없음'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {character.role || '역할 없음'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {character.ability1 && (
                        <div className="text-xs">
                          <span className="font-medium">{character.ability1}:</span>
                          <span className="text-muted-foreground ml-1">
                            {character.ability1_min}-{character.ability1_max}
                          </span>
                        </div>
                      )}
                      {character.ability2 && (
                        <div className="text-xs">
                          <span className="font-medium">{character.ability2}:</span>
                          <span className="text-muted-foreground ml-1">
                            {character.ability2_min}-{character.ability2_max}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="font-medium">{character.usage_count || 0}</p>
                      <p className="text-xs text-muted-foreground">회</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={character.is_active ? "default" : "secondary"}>
                      {character.is_active ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {character.last_used ? (
                      <div>
                        <p className="text-sm">
                          {formatDistanceToNow(new Date(character.last_used), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(character.last_used).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">사용 안함</span>
                    )}
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
            캐릭터가 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 