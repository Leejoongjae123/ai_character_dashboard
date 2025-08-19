import { Character } from '@/lib/types';

export interface CharacterFilter {
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface CharacterFormData {
  name: string;
  role: string;
  description: string;
  ability1: string;
  ability1_min: number;
  ability1_max: number;
  ability2: string;
  ability2_min: number;
  ability2_max: number;
  is_active: boolean;
  star_count: number; // 별점 (1~5)
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CharacterApiResponse {
  data: Character[];
  pagination: PaginationInfo;
} 