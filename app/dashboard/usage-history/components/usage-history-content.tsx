'use client';

import { useState, useEffect } from 'react';
import { UsageLogFilter, UsageLog } from '../types';
import { UsageHistoryFilters } from './usage-history-filters';
import { UsageHistoryTable } from './usage-history-table';
import { UsageHistoryModal } from './usage-history-modal';

interface UsageHistoryContentProps {
  userId: string;
}

export function UsageHistoryContent({ userId }: UsageHistoryContentProps) {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<UsageLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<UsageLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/logs?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
      }
    } catch (error) {
      console.error('사용이력 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: UsageLogFilter) => {
    let filtered = [...logs];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.character?.name?.toLowerCase().includes(searchTerm) ||
        log.character?.role?.toLowerCase().includes(searchTerm) ||
        log.ability1?.toLowerCase().includes(searchTerm) ||
        log.ability2?.toLowerCase().includes(searchTerm) ||
        (log.prompt && JSON.stringify(log.prompt).toLowerCase().includes(searchTerm))
      );
    }

    if (filters.characterId) {
      filtered = filtered.filter(log => log.character_id === filters.characterId);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.created_at) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999); // 해당 날짜의 끝까지 포함
      filtered = filtered.filter(log => 
        new Date(log.created_at) <= dateTo
      );
    }

    if (filters.abilityType) {
      filtered = filtered.filter(log => 
        log.ability1?.includes(filters.abilityType!) || 
        log.ability2?.includes(filters.abilityType!)
      );
    }

    setFilteredLogs(filtered);
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
          <h2 className="text-lg font-semibold">전체 사용이력</h2>
          <p className="text-sm text-muted-foreground">
            총 {filteredLogs.length}개의 사용이력이 있습니다
          </p>
        </div>
      </div>
      
      <UsageHistoryFilters 
        onFilter={handleFilter}
        userId={userId}
      />
      
      <UsageHistoryTable 
        logs={filteredLogs}
        onRowClick={handleRowClick}
      />

      <UsageHistoryModal 
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
} 