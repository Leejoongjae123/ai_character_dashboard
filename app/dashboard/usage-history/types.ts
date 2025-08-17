export interface UsageLog {
  id: number;
  created_at: string;
  job_id: string | null;
  picture_camera: string | null;
  result: Record<string, unknown> | null; // jsonb - 이것이 중요한 데이터
}

export interface UsageLogFilter {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsageHistoryResponse {
  data: UsageLog[];
  pagination: PaginationInfo;
} 