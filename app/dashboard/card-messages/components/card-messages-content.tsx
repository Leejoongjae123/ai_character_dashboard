'use client';

import { useState, useEffect } from 'react';
import { MessageFilter } from '../types';
import { CardMessagesFilters } from './card-messages-filters';
import { CardMessagesTable } from './card-messages-table';
import { CardMessagesModal } from './card-messages-modal';
import { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CardMessagesContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setFilteredMessages(data);
      }
    } catch (error) {
      console.log('메세지 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: MessageFilter) => {
    let filtered = [...messages];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(message => 
        message.messages?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(message => 
        new Date(message.created_at) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(message => 
        new Date(message.created_at) <= new Date(filters.dateTo!)
      );
    }

    setFilteredMessages(filtered);
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
    fetchMessages(); // 변경사항 반영을 위해 다시 로드
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
        messages={filteredMessages}
        onRowClick={handleRowClick}
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
