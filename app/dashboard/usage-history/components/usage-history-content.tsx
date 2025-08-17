'use client';

import { useState, useEffect } from 'react';
import { UsageLogFilter, UsageLog, UsageHistoryResponse, PaginationInfo } from '../types';
import { UsageHistoryFilters } from './usage-history-filters';
import { UsageHistoryTable } from './usage-history-table';
import { UsageHistoryModal } from './usage-history-modal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UsageHistoryContentProps {
  userId: string;
}

export function UsageHistoryContent({ userId }: UsageHistoryContentProps) {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<UsageLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentFilters, setCurrentFilters] = useState<UsageLogFilter>({});

  useEffect(() => {
    fetchLogs(1); // 첫 페이지부터 시작
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchLogs = async (page: number = pagination.currentPage, filters: UsageLogFilter = currentFilters) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
      });

      if (filters.search) {
        searchParams.append('search', filters.search);
      }
      if (filters.dateFrom) {
        searchParams.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        searchParams.append('dateTo', filters.dateTo);
      }

      const response = await fetch(`/api/logs?${searchParams}`);
      if (response.ok) {
        const data: UsageHistoryResponse = await response.json();
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      // 에러 처리 생략
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: UsageLogFilter) => {
    setCurrentFilters(filters);
    fetchLogs(1, filters); // 필터가 변경되면 첫 페이지부터 다시 시작
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLogs(newPage, currentFilters);
    }
  };

  const handleRowClick = (log: UsageLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">이미지 생성 이력</h2>
          <p className="text-sm text-muted-foreground">
            총 {pagination.totalItems}개의 이미지 생성 이력이 있습니다
          </p>
        </div>
      </div>
      
      <UsageHistoryFilters 
        onFilter={handleFilter}
      />
      
      <UsageHistoryTable 
        logs={logs}
        onRowClick={handleRowClick}
      />

      {/* Pagination UI */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {pagination.totalItems > 0 ? (
            <>
              {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} 항목
            </>
          ) : (
            '항목이 없습니다'
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, Math.min(
                pagination.totalPages - 4,
                pagination.currentPage - 2
              )) + i;
              
              if (pageNumber <= pagination.totalPages) {
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                  >
                    {pageNumber}
                  </Button>
                );
              }
              return null;
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <UsageHistoryModal 
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
} 