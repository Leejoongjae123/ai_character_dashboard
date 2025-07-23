'use client';

import { useState, useEffect } from 'react';
import { UsageLogFilter } from '../types';
import { Character } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface UsageHistoryFiltersProps {
  onFilter: (filters: UsageLogFilter) => void;
  userId: string;
}

export function UsageHistoryFilters({ onFilter, userId }: UsageHistoryFiltersProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filters, setFilters] = useState<UsageLogFilter>({});

  useEffect(() => {
    fetchCharacters();
  }, [userId]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/characters?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error('캐릭터 로딩 중 오류:', error);
    }
  };

  const handleFilterChange = (key: keyof UsageLogFilter, value: string | number | undefined) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === '' || value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* 검색 */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="캐릭터명, 역할, 능력으로 검색..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 캐릭터 선택 */}
        <Select 
          value={filters.characterId?.toString() || 'all'} 
          onValueChange={(value) => handleFilterChange('characterId', value === 'all' ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="캐릭터 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 캐릭터</SelectItem>
            {characters.map((character) => (
              <SelectItem key={character.id} value={character.id.toString()}>
                {character.name} ({character.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 능력 타입 */}
        <Select 
          value={filters.abilityType || 'all'} 
          onValueChange={(value) => handleFilterChange('abilityType', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="능력 타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 능력</SelectItem>
            <SelectItem value="창의성">창의성</SelectItem>
            <SelectItem value="분석력">분석력</SelectItem>
            <SelectItem value="감정이입">감정이입</SelectItem>
            <SelectItem value="논리력">논리력</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 날짜 필터 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">기간:</span>
          <Input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-40"
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-40"
          />
        </div>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            필터 초기화
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>활성 필터: {Object.keys(filters).length}개</span>
        </div>
      )}
    </div>
  );
} 