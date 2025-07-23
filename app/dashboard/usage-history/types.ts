export interface UsageLog {
  id: number;
  created_at: string;
  character_id: number;
  prompt: any; // jsonb
  origin_image?: string;
  character_image?: string;
  ability1?: string;
  ability1_min?: number;
  ability1_max?: number;
  ability2?: string;
  ability2_min?: number;
  ability2_max?: number;
  // character 정보 조인해서 가져올 데이터
  character?: {
    name: string;
    role: string;
  };
}

export interface UsageLogFilter {
  search?: string;
  characterId?: number;
  dateFrom?: string;
  dateTo?: string;
  abilityType?: string;
} 