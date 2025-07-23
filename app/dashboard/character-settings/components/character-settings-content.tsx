'use client';

import { useState, useEffect } from 'react';
import { CharacterFilter } from '../types';
import { CharacterFilters } from './character-filters';
import { CharacterTable } from './character-table';
import { CharacterModal } from './character-modal';
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

  useEffect(() => {
    fetchCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/characters?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
        setFilteredCharacters(data);
      }
    } catch (error) {
      console.error('캐릭터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: CharacterFilter) => {
    let filtered = [...characters];

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
    fetchCharacters(); // 변경사항 반영을 위해 다시 로드
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