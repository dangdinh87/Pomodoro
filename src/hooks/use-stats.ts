import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

export interface StatsData {
  summary: {
    totalFocusTime: number;
    completedSessions: number;
    streak: {
      current: number;
      longest: number;
    };
  };
  dailyFocus: {
    date: string;
    duration: number;
  }[];
  distribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

async function fetchStats(
  dateRange: DateRange | undefined,
): Promise<StatsData> {
  let url = '/api/stats';

  if (dateRange?.from && dateRange?.to) {
    const params = new URLSearchParams({
      startDate: format(dateRange.from, 'yyyy-MM-dd'),
      endDate: format(dateRange.to, 'yyyy-MM-dd'),
    });
    url += `?${params.toString()}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }

  return res.json();
}

export function useStats(dateRange: DateRange | undefined) {
  const user = useAuthStore((state) => state.user);
  const queryKey = [
    'stats',
    dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  ];

  return useQuery({
    queryKey,
    enabled: !!user,
    queryFn: () => fetchStats(dateRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
