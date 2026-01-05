"use client"

import { Task } from '@/stores/task-store'
import { TaskItem } from './task-item'
import { AnimatedListItem } from '@/components/ui/animated-list'
import { Skeleton } from '@/components/ui/skeleton'
import { LayoutList } from 'lucide-react'
import { useI18n } from '@/contexts/i18n-context'
import { AnimatePresence } from 'motion/react'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  activeTaskId: string | null
  onToggleStatus: (task: Task) => void
  onToggleActive: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskList({
  tasks,
  isLoading,
  activeTaskId,
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
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20 border border-dashed rounded-xl space-y-3">
        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
          <LayoutList className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold">{t('tasks.noTasks')}</h3>
          <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
            {t('tasks.noTasksDescription')}
          </p>
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
