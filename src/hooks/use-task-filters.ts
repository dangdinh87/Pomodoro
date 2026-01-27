import { useMemo, useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '@/stores/task-store';
import { DateRange } from 'react-day-picker';
import { subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export interface TaskFilters {
  query: string;
  statusFilter: 'all' | TaskStatus;
  priorityFilter: 'all' | TaskPriority;
  tagFilter: 'all' | string;
  dateRange: DateRange | undefined;
}

export function useTaskFilters() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>(
    'all',
  );
  const [tagFilter, setTagFilter] = useState<'all' | string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const hasActiveFilter = useMemo(
    () =>
      query.trim().length > 0 ||
      statusFilter !== 'all' ||
      priorityFilter !== 'all' ||
      tagFilter !== 'all' ||
      dateRange !== undefined,
    [query, statusFilter, priorityFilter, tagFilter, dateRange],
  );

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTagFilter('all');
    setDateRange({
      from: new Date(),
      to: new Date(),
    });
  };

  return {
    query,
    statusFilter,
    priorityFilter,
    tagFilter,
    dateRange,
    hasActiveFilter,
    setQuery,
    setStatusFilter,
    setPriorityFilter,
    setTagFilter,
    setDateRange,
    resetFilters,
  };
}
