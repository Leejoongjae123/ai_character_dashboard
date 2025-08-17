'use client';

import { useState, useEffect } from 'react';
import { MessageFilter, PaginationInfo, MessageResponse } from '../types';
import { CardMessagesFilters } from './card-messages-filters';
import { CardMessagesTable } from './card-messages-table';
import { CardMessagesModal } from './card-messages-modal';
import { CardMessagesPagination } from './card-messages-pagination';
import { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CardMessagesContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [currentFilters, setCurrentFilters] = useState<MessageFilter>({});

  useEffect(() => {
    fetchMessages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMessages = async (page: number = pagination.currentPage, filters: MessageFilter = currentFilters) => {
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

      const response = await fetch(`/api/messages?${searchParams}`);
      if (response.ok) {
        const data: MessageResponse = await response.json();
        setMessages(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.log('메세지 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: MessageFilter) => {
    setCurrentFilters(filters);
    fetchMessages(1, filters); // 필터가 변경되면 첫 페이지부터 다시 시작
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMessages(newPage, currentFilters);
    }
  };

  const handleRowClick = (message: Message) => {
    setSelectedMessage(message);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedMessage(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
    setIsCreating(false);
    fetchMessages(pagination.currentPage, currentFilters); // 변경사항 반영을 위해 다시 로드
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          새 메세지 추가
        </Button>
      </div>
      
      <CardMessagesFilters 
        messages={messages}
        onFilter={handleFilter}
      />
      
      <CardMessagesTable 
        messages={messages}
        onRowClick={handleRowClick}
        totalItems={pagination.totalItems}
      />

      <CardMessagesPagination 
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />

      <CardMessagesModal 
        message={selectedMessage}
        isOpen={isModalOpen}
        isCreating={isCreating}
        onClose={handleModalClose}
      />
    </div>
  );
}
