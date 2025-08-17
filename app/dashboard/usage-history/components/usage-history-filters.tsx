'use client';

import { useState } from 'react';
import { UsageLogFilter } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface UsageHistoryFiltersProps {
  onFilter: (filters: UsageLogFilter) => void;
}

export function UsageHistoryFilters({ onFilter }: UsageHistoryFiltersProps) {
  const [filters, setFilters] = useState<UsageLogFilter>({});

  const handleFilterChange = (key: keyof UsageLogFilter, value: string | undefined) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === '') {
      delete newFilters[key];
    } else {
      (newFilters as Record<string, string>)[key] = value;
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
            placeholder="Job ID, 카메라 정보로 검색..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 날짜 필터 */}
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