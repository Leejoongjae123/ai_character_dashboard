'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { CharacterFilter } from '../types';
import { Character } from '@/lib/types';

interface CharacterFiltersProps {
  characters: Character[];
  onFilter: (filters: CharacterFilter) => void;
}

export function CharacterFilters({ characters, onFilter }: CharacterFiltersProps) {
  const [filters, setFilters] = useState<CharacterFilter>({});

  const handleFilterChange = (key: keyof CharacterFilter, value: string | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilter({});
  };

  // 유니크한 역할 목록 추출
  const uniqueRoles = Array.from(
    new Set(characters.map(char => char.role).filter(Boolean))
  );

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-medium">필터 및 검색</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">검색</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="캐릭터명, 역할 등..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">역할</label>
          <Select 
            value={filters.role || 'all'} 
            onValueChange={(value) => handleFilterChange('role', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role!}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">상태</label>
          <Select 
            value={filters.isActive === undefined ? 'all' : filters.isActive.toString()} 
            onValueChange={(value) => 
              handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="true">활성</SelectItem>
              <SelectItem value="false">비활성</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={handleReset} className="w-full">
            필터 초기화
          </Button>
        </div>
      </div>
    </div>
  );
} 