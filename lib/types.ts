export interface Character {
  id: number;
  created_at: string;
  role?: string;
  description?: string;
  ability1?: string;
  ability1_min?: number;
  ability1_max?: number;
  ability2?: string;
  ability2_min?: number;
  ability2_max?: number;
  images?: Record<string, unknown> | string[] | null;
  user_id?: string;
  name?: string;
  is_active?: boolean;
  usage_count?: number;
  last_used?: string;
  picture_cartoon?: Array<{ url: string }> | null;
  picture_select?: string | null; // 캐릭터 선택용 이미지 (단일 이미지)
  picture_character?: string | null; // 캐릭터 상세 이미지 (단일 이미지)
}

export interface Statistics {
  id: number;
  created_at: string;
  user_id?: string;
  total_characters?: number;
  total_usage_count?: number;
  last_activity?: string;
  favorite_character_id?: number;
  weekly_usage?: Record<string, unknown> | number[] | null;
  monthly_usage?: Record<string, unknown> | number[] | null;
}

export interface Log {
  id: number;
  created_at: string;
  user_id?: string;
  action_type?: string;
  character_id?: number;
  details?: Record<string, unknown> | null;
  ip_address?: string;
  user_agent?: string;
}

export interface Image {
  id: number;
  created_at: string;
  job_id?: string;
  url?: string;
}

export interface Message {
  id: number;
  created_at: string;
  messages?: string;
}

// 프론트엔드에서 사용할 추가 타입들
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
}

export interface DashboardStats {
  totalCharacters: number;
  totalUsage: number;
  favoriteCharacter?: Character;
  weeklyUsage: number[];
  monthlyUsage: number[];
  lastActivity?: string;
} 