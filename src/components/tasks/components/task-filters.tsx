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
  tagFilter: 'all' | string
  dateRange: DateRange | undefined
  availableTags: string[]
  onQueryChange: (query: string) => void
  onStatusChange: (status: 'all' | TaskStatus) => void
  onPriorityChange: (priority: 'all' | TaskPriority) => void
  onTagChange: (tag: 'all' | string) => void
  onDateRangeChange: (range: DateRange | undefined) => void
  onReload: () => void
  onResetFilters: () => void
}

export function TaskFilters({
  query,
  statusFilter,
  priorityFilter,
  tagFilter,
  dateRange,
  availableTags,
  onQueryChange,
  onStatusChange,
  onPriorityChange,
  onTagChange,
  onDateRangeChange,
  onResetFilters,
}: TaskFiltersProps) {
  const { t } = useI18n()

  // Check if any filter is active
  const hasActiveFilters = query.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    tagFilter !== 'all' ||
    dateRange !== undefined

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('tasks.filters.searchPlaceholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9 h-9 bg-card/50"
        />
      </div>

      <Select
        value={statusFilter === 'all' ? undefined : statusFilter}
        onValueChange={(val: any) => onStatusChange(val || 'all')}
      >
        <SelectTrigger
          className="w-[130px] h-9 bg-card/50"
          onClear={() => onStatusChange('all')}
          showClear={statusFilter !== 'all'}
        >
          <SelectValue placeholder={t('tasks.status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('tasks.filters.all')}</SelectItem>
          <SelectItem value="pending">{t('tasks.statuses.pending')}</SelectItem>
          <SelectItem value="in_progress">{t('tasks.statuses.in_progress')}</SelectItem>
          <SelectItem value="done">{t('tasks.statuses.done')}</SelectItem>
          <SelectItem value="cancelled">{t('tasks.statuses.cancelled')}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={priorityFilter === 'all' ? undefined : priorityFilter}
        onValueChange={(val: any) => onPriorityChange(val || 'all')}
      >
        <SelectTrigger
          className="w-[130px] h-9 bg-card/50"
          onClear={() => onPriorityChange('all')}
          showClear={priorityFilter !== 'all'}
        >
          <SelectValue placeholder={t('tasks.priority')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('tasks.filters.all')}</SelectItem>
          <SelectItem value="low">{t('tasks.priorityLevels.low')}</SelectItem>
          <SelectItem value="medium">{t('tasks.priorityLevels.medium')}</SelectItem>
          <SelectItem value="high">{t('tasks.priorityLevels.high')}</SelectItem>
        </SelectContent>
      </Select>

      {availableTags.length > 0 && (
        <Select
          value={tagFilter === 'all' ? undefined : tagFilter}
          onValueChange={(val: any) => onTagChange(val || 'all')}
        >
          <SelectTrigger
            className="w-[130px] h-9 bg-card/50"
            onClear={() => onTagChange('all')}
            showClear={tagFilter !== 'all'}
          >
            <SelectValue placeholder={t('tasks.filters.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tasks.filters.all')}</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        className="h-9"
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={onResetFilters}
        disabled={!hasActiveFilters}
        title={t('tasks.filters.reset')}
        className="h-9 w-9 shrink-0"
      >
        <FilterX className="h-4 w-4" />
      </Button>
    </div>
  )
}
