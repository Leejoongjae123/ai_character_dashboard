'use client';

import { useState, useEffect } from 'react';
import { CharacterFilter, CharacterApiResponse, PaginationInfo } from '../types';
import { CharacterFilters } from './character-filters';
import { CharacterTable } from './character-table';
import { CharacterModal } from './character-modal';
import { CharacterPagination } from './character-pagination';
import { Character } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CharacterSettingsContentProps {
  userId: string;
}

export function CharacterSettingsContent({ userId }: CharacterSettingsContentProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
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
  const [currentFilters, setCurrentFilters] = useState<CharacterFilter>({});

  useEffect(() => {
    fetchCharacters(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchCharacters = async (page: number = pagination.currentPage, filters: CharacterFilter = currentFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: pagination.itemsPerPage.toString()
      });

      const response = await fetch(`/api/characters?${params}`);
      if (response.ok) {
        const data: CharacterApiResponse = await response.json();
        setCharacters(data.data);
        setPagination(data.pagination);
        
        // 필터 적용
        applyFilters(data.data, filters);
      }
    } catch (error) {
      console.error('캐릭터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: Character[], filters: CharacterFilter) => {
    let filtered = [...data];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(character => 
        character.name?.toLowerCase().includes(searchTerm) ||
        character.role?.toLowerCase().includes(searchTerm) ||
        character.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.role) {
      filtered = filtered.filter(character => character.role === filters.role);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(character => character.is_active === filters.isActive);
    }

    setFilteredCharacters(filtered);
  };

  const handleFilter = (filters: CharacterFilter) => {
    setCurrentFilters(filters);
    applyFilters(characters, filters);
  };

  const handlePageChange = (page: number) => {
    fetchCharacters(page, currentFilters);
  };

  const handleRowClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedCharacter(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCharacter(null);
    setIsCreating(false);
    fetchCharacters(pagination.currentPage, currentFilters); // 변경사항 반영을 위해 다시 로드
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          새 캐릭터 생성
        </Button>
      </div>
      
      <CharacterFilters 
        characters={characters}
        onFilter={handleFilter}
      />
      
      <CharacterTable 
        characters={filteredCharacters}
        onRowClick={handleRowClick}
        totalCount={pagination.totalItems}
      />

      <CharacterPagination 
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      <CharacterModal 
        character={selectedCharacter}
        isOpen={isModalOpen}
        isCreating={isCreating}
        userId={userId}
        onClose={handleModalClose}
      />
    </div>
  );
} 