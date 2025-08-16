'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MessageFilter } from '../types';
import { Message } from '@/lib/types';
import { Search, RotateCcw } from 'lucide-react';

interface CardMessagesFiltersProps {
  messages: Message[];
  onFilter: (filters: MessageFilter) => void;
}

export function CardMessagesFilters({ messages, onFilter }: CardMessagesFiltersProps) {
  const [filters, setFilters] = useState<MessageFilter>({
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleFilterChange = (key: keyof MessageFilter, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    const resetFilters: MessageFilter = {
      search: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          필터 및 검색
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">검색어</Label>
            <Input
              id="search"
              placeholder="메세지 내용 검색..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="dateFrom">시작 날짜</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="dateTo">종료 날짜</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            총 {messages.length}개의 메세지
          </p>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            필터 초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
