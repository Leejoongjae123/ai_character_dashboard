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
} 