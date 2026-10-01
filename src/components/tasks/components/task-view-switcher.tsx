"use client"

import { TaskViewMode, useTasksStore } from '@/stores/task-store'
import { Button } from '@/components/ui/button'
import { SquaresFour, Table, CaretDown, Check } from '@phosphor-icons/react/dist/ssr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/contexts/i18n-context'

const viewOptions: { value: TaskViewMode; label: string; icon: typeof Table }[] = [
  { value: 'table', label: 'List', icon: Table },
  { value: 'kanban', label: 'Kanban', icon: SquaresFour },
]

export function TaskViewSwitcher() {
  const { viewMode, setViewMode } = useTasksStore()
  const { t } = useI18n()

  const current = viewOptions.find((o) => o.value === viewMode) ?? viewOptions[0]
  const CurrentIcon = current.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 px-3">
          <CurrentIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{current.label}</span>
          <CaretDown size={14} className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {viewOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setViewMode(option.value)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {option.label}
              {viewMode === option.value && (
                <Check size={16} className="ml-auto" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
