"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, FilterX } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { useI18n } from '@/contexts/i18n-context'
import { TaskStatus, TaskPriority } from '@/stores/task-store'
import { DateRangePicker } from '@/app/(main)/history/components/date-range-picker'

interface TaskFiltersProps {
  query: string
  statusFilter: 'all' | TaskStatus
  priorityFilter: 'all' | TaskPriority
  dateRange: DateRange | undefined
  onQueryChange: (query: string) => void
  onStatusChange: (status: 'all' | TaskStatus) => void
  onPriorityChange: (priority: 'all' | TaskPriority) => void
  onDateRangeChange: (range: DateRange | undefined) => void
  onReload: () => void
  onResetFilters: () => void
}

export function TaskFilters({
  query,
  statusFilter,
  priorityFilter,
  dateRange,
  onQueryChange,
  onStatusChange,
  onPriorityChange,
  onDateRangeChange,
  onResetFilters,
}: TaskFiltersProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('tasks.filters.searchPlaceholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9 h-10 bg-card/50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <Select value={statusFilter} onValueChange={(val: any) => onStatusChange(val)}>
          <SelectTrigger className="w-full md:w-[130px] h-10 bg-card/50">
            <SelectValue placeholder={t('tasks.filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tasks.filters.all')}</SelectItem>
            <SelectItem value="pending">{t('tasks.statuses.pending')}</SelectItem>
            <SelectItem value="in_progress">{t('tasks.statuses.in_progress')}</SelectItem>
            <SelectItem value="done">{t('tasks.statuses.done')}</SelectItem>
            <SelectItem value="cancelled">{t('tasks.statuses.cancelled')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(val: any) => onPriorityChange(val)}>
          <SelectTrigger className="w-full md:w-[130px] h-10 bg-card/50">
            <SelectValue placeholder={t('tasks.filters.priority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tasks.filters.all')}</SelectItem>
            <SelectItem value="low">{t('tasks.priorityLevels.low')}</SelectItem>
            <SelectItem value="medium">{t('tasks.priorityLevels.medium')}</SelectItem>
            <SelectItem value="high">{t('tasks.priorityLevels.high')}</SelectItem>
          </SelectContent>
        </Select>

        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          className="h-10"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={onResetFilters}
          title={t('tasks.filters.reset')}
          className="h-10 w-10 shrink-0 bg-card/50"
        >
          <FilterX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
