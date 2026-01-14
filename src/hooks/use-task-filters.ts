import { useMemo, useState } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/stores/task-store'
import { DateRange } from 'react-day-picker'
import { subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export interface TaskFilters {
  query: string
  statusFilter: 'all' | TaskStatus
  priorityFilter: 'all' | TaskPriority
  dateRange: DateRange | undefined
}

export function useTaskFilters() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 2),
    to: new Date()
  })

  const hasActiveFilter = useMemo(
    () =>
      query.trim().length > 0 ||
      statusFilter !== 'all' ||
      priorityFilter !== 'all' ||
      dateRange !== undefined,
    [query, statusFilter, priorityFilter, dateRange]
  )

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setDateRange({
      from: subDays(new Date(), 2),
      to: new Date()
    })
  }

  return {
    query,
    statusFilter,
    priorityFilter,
    dateRange,
    hasActiveFilter,
    setQuery,
    setStatusFilter,
    setPriorityFilter,
    setDateRange,
    resetFilters,
  }
}

export function useFilteredTasks(tasks: Task[], filters: TaskFilters) {
  return useMemo(() => {
    const q = filters.query.trim().toLowerCase()

    return tasks
      .filter((task) => {
        const matchesQuery =
          !q ||
          task.title.toLowerCase().includes(q) ||
          (task.description ?? '').toLowerCase().includes(q) ||
          task.tags.some((tag) => tag.toLowerCase().includes(q))

        const matchesStatus =
          filters.statusFilter === 'all' ? true : task.status === filters.statusFilter
        const matchesPriority =
          filters.priorityFilter === 'all' ? true : task.priority === filters.priorityFilter

        const matchesDate = filters.dateRange?.from && filters.dateRange?.to
          ? task.createdAt
            ? isWithinInterval(new Date(task.createdAt), {
              start: startOfDay(filters.dateRange.from),
              end: endOfDay(filters.dateRange.to)
            })
            : false
          : true

        return matchesQuery && matchesStatus && matchesPriority && matchesDate
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })
  }, [tasks, filters])
}
