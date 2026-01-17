"use client"

import { Task } from '@/stores/task-store'
import { TaskItem } from './task-item'
import { AnimatedListItem } from '@/components/ui/animated-list'
import { Skeleton } from '@/components/ui/skeleton'
import { LayoutList, FilterX } from 'lucide-react'
import { useI18n } from '@/contexts/i18n-context'
import { AnimatePresence } from 'motion/react'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  activeTaskId: string | null
  hasTasks: boolean
  onToggleStatus: (task: Task) => void
  onToggleActive: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskList({
  tasks,
  isLoading,
  activeTaskId,
  hasTasks,
  onToggleStatus,
  onToggleActive,
  onEdit,
  onDelete,
}: TaskListProps) {
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    const isFiltered = true // We can pass this from parent or check filters here
    
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-muted/10 border border-dashed border-muted/50 rounded-2xl space-y-4">
        <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center animate-pulse">
          <LayoutList className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold tracking-tight">{t('tasks.noTasks')}</h3>
          <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            {t('tasks.noTasksDescription')}
          </p>
        </div>
        <div className="pt-2">
           {/* We could add a clear filters button here if we know it's filtered */}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {tasks.map((task) => (
          <AnimatedListItem key={task.id}>
            <TaskItem
              task={task}
              isActive={activeTaskId === task.id}
              onToggleStatus={onToggleStatus}
              onToggleActive={onToggleActive}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  )
}
