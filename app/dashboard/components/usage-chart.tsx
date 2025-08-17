'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChartData, UsageChartProps, PeriodType } from './chart-types';

export function UsageChart({ userId }: UsageChartProps) {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/charts/usage?userId=${userId}&period=${period}`);
        if (response.ok) {
          const chartData = await response.json();
          setData(chartData);
        }
      } catch (error) {
        console.log('차트 데이터 로딩 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, period]);

  const getPeriodLabel = (period: PeriodType) => {
    switch (period) {
      case 'daily':
        return '하루';
      case 'weekly':
        return '일주일';
      case 'monthly':
        return '한달';
      default:
        return '하루';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">이미지 생성량</CardTitle>
        <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">하루</SelectItem>
            <SelectItem value="weekly">일주일</SelectItem>
            <SelectItem value="monthly">한달</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-muted-foreground">데이터 로딩 중...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label) => `날짜: ${label}`}
                  formatter={(value) => [`${value}개`, '생성량']}
                />
                <Bar 
                  dataKey="count" 
                  fill="#000000" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {getPeriodLabel(period)} 단위 이미지 생성량
        </p>
      </CardContent>
    </Card>
  );
}
