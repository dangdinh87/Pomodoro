import { TaskPriority, TaskStatus } from '@/stores/task-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, RotateCcw, RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useDebouncedCallback } from 'use-debounce'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/app/(main)/history/components/date-range-picker'

interface TaskFiltersProps {
  query: string
  statusFilter: 'all' | TaskStatus
  priorityFilter: 'all' | TaskPriority
  dateRange: DateRange | undefined
  onQueryChange: (value: string) => void
  onStatusChange: (value: 'all' | TaskStatus) => void
  onPriorityChange: (value: 'all' | TaskPriority) => void
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
  onReload,
  onResetFilters,
}: TaskFiltersProps) {
  const [localQuery, setLocalQuery] = useState(query)

  // Sync local query with prop query when it changes externally (e.g. reset)
  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  const debouncedQueryChange = useDebouncedCallback((value: string) => {
    onQueryChange(value)
  }, 300)

  const handleQueryChange = (value: string) => {
    setLocalQuery(value)
    debouncedQueryChange(value)
  }

  const hasActiveFilter =
    query.trim().length > 0 ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative w-full md:w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="task-search"
            placeholder="Search tasks..."
            value={localQuery}
            onChange={(event) => handleQueryChange(event.target.value)}
            className="pl-9 bg-background/50 focus:bg-background transition-colors"
            aria-label="Search tasks"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {hasActiveFilter && (
            <Button
              variant="ghost"
              onClick={() => {
                setLocalQuery('')
                onResetFilters()
              }}
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear Filters</span>
            </Button>
          )}
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            className="w-full sm:w-auto"
          />

          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusChange(value as 'all' | TaskStatus)}
          >
            <SelectTrigger className="w-[130px] bg-background/50">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">
                  {statusFilter === 'all' ? 'Status' :
                    statusFilter === 'pending' ? 'Pending' :
                      statusFilter === 'in_progress' ? 'In Progress' :
                        statusFilter === 'done' ? 'Completed' : 'Cancelled'}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(value) =>
              onPriorityChange(value as 'all' | TaskPriority)
            }
          >
            <SelectTrigger className="w-[130px] bg-background/50">
              <div className="flex items-center gap-2 truncate">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">
                  {priorityFilter === 'all' ? 'Priority' :
                    priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 ml-auto md:ml-0">


          <Separator orientation="vertical" className="h-6 mx-1 hidden md:block" />

          <Button
            variant="ghost"
            onClick={onReload}
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Reload tasks"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Reload</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
