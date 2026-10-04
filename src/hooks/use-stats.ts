import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { getBrowserTimeZone } from '@/lib/stats/study-day';

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
  }[];
}

/**
 * The server groups sessions by study day (04:00 local) in `tz`. The range
 * holds study days as local-midnight dates (see `studyTodayDate`), sent as
 * yyyy-MM-dd keys.
 */
async function fetchStats(
  dateRange: DateRange | undefined,
  tz: string,
): Promise<StatsData> {
  const params = new URLSearchParams({ tz });

  if (dateRange?.from && dateRange?.to) {
    params.set('startDate', format(dateRange.from, 'yyyy-MM-dd'));
    params.set('endDate', format(dateRange.to, 'yyyy-MM-dd'));
  }

  const res = await fetch(`/api/stats?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }

  return res.json();
}

export function useStats(dateRange: DateRange | undefined) {
  const user = useAuthStore((state) => state.user);
  const tz = getBrowserTimeZone();
  const queryKey = [
    'stats',
    tz,
    dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  ];

  return useQuery({
    queryKey,
    enabled: !!user,
    queryFn: () => fetchStats(dateRange, tz),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
