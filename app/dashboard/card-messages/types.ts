export interface MessageFilter {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MessageFormData {
  messages: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MessageResponse {
  data: import('@/lib/types').Message[];
  pagination: PaginationInfo;
}