export interface ChartData {
  date: string;
  count: number;
  displayDate: string;
}

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface UsageChartProps {
  userId: string;
}

export interface ChartApiResponse {
  data: ChartData[];
  error?: string;
}
