import { useMemo, useState } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/stores/task-store'
import { DateRange } from 'react-day-picker'
import { subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export interface TaskFilters {
  query: string
  statusFilter: 'all' | TaskStatus
  priorityFilter: 'all' | TaskPriority
  tagFilter: 'all' | string
  dateRange: DateRange | undefined
}

export function useTaskFilters() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all')
  const [tagFilter, setTagFilter] = useState<'all' | string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 2),
    to: new Date()
  })

  const hasActiveFilter = useMemo(
    () =>
      query.trim().length > 0 ||
      statusFilter !== 'all' ||
      priorityFilter !== 'all' ||
      tagFilter !== 'all' ||
      dateRange !== undefined,
    [query, statusFilter, priorityFilter, tagFilter, dateRange]
  )

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setTagFilter('all')
    setDateRange({
      from: subDays(new Date(), 2),
      to: new Date()
    })
  }

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
  }
}

export function useFilteredTasks(tasks: Task[], filters: TaskFilters) {
  return useMemo(() => {
    const q = filters.query.trim().toLowerCase()

    // Optimize: Pre-parse dates if date range is active or for sorting
    // We can do this lazily or just handle it efficiently
    const fromDate = filters.dateRange?.from ? startOfDay(filters.dateRange.from) : null
    const toDate = filters.dateRange?.to ? endOfDay(filters.dateRange.to) : null

    return tasks
      .filter((task) => {
        // 1. Status Filter (Fastest check)
        if (filters.statusFilter !== 'all' && task.status !== filters.statusFilter) {
          return false
        }

        // 2. Priority Filter
        if (filters.priorityFilter !== 'all' && task.priority !== filters.priorityFilter) {
          return false
        }

        // 3. Tag Filter
        if (filters.tagFilter !== 'all' && !task.tags.includes(filters.tagFilter)) {
          return false
        }

        // 4. Date Range Filter
        if (fromDate && toDate) {
          if (!task.createdAt) return false
          const taskDate = new Date(task.createdAt)
          if (!isWithinInterval(taskDate, { start: fromDate, end: toDate })) {
            return false
          }
        }

        // 4. Query Filter (Slowest check, do last)
        if (q) {
          const titleMatch = task.title.toLowerCase().includes(q)
          if (titleMatch) return true

          const descMatch = (task.description ?? '').toLowerCase().includes(q)
          if (descMatch) return true

          const tagMatch = task.tags.some((tag) => tag.toLowerCase().includes(q))
          if (tagMatch) return true

          return false
        }

        return true
      })
      .sort((a, b) => {
        // Sort by createdAt DESC
        // Optimization: Lexicographical comparison of ISO strings works for dates!
        // No need to new Date() if the format is ISO 8601
        if (a.createdAt && b.createdAt) {
          return b.createdAt.localeCompare(a.createdAt)
        }
        return 0
      })
  }, [tasks, filters])
}
