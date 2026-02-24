"use client"

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/stores/task-store'
import { SortableTaskItem } from './sortable-task-item'
import { AnimatePresence } from 'motion/react'
import { AnimatedListItem } from '@/components/ui/animated-list'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/contexts/i18n-context'

interface TaskKanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  activeTaskId: string | null
  draggingTaskId: string | null
  onToggleStatus: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onClone?: (id: string) => void
  onSaveAsTemplate?: (id: string) => void
  togglingTaskIds?: Set<string>
}

const statusConfig = {
  todo: {
    title: 'todo',
    colorClass: 'border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50',
    badgeVariant: 'secondary' as const,
    headerClass: 'text-slate-700 dark:text-slate-300',
  },
  doing: {
    title: 'doing',
    colorClass: 'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/50',
    badgeVariant: 'default' as const,
    headerClass: 'text-blue-700 dark:text-blue-300',
  },
  done: {
    title: 'done',
    colorClass: 'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-900/50',
    badgeVariant: 'default' as const,
    headerClass: 'text-green-700 dark:text-green-300',
  },
}

export function TaskKanbanColumn({
  status,
  tasks,
  activeTaskId,
  draggingTaskId,
  onToggleStatus,
  onEdit,
  onDelete,
  onClone,
  onSaveAsTemplate,
  togglingTaskIds,
}: TaskKanbanColumnProps) {
  const { t } = useI18n()
  const { setNodeRef, isOver } = useDroppable({ id: status })

  const config = statusConfig[status]
  const taskIds = tasks.map((task) => task.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border-2 transition-all duration-200 min-h-[400px]',
        config.colorClass,
        isOver && 'ring-2 ring-primary/50 shadow-lg scale-[1.02]'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-current/10">
        <h3 className={cn('text-sm font-bold uppercase tracking-wider', config.headerClass)}>
          {t(`tasks.statuses.${config.title}`)}
        </h3>
        <Badge variant={config.badgeVariant} className="text-xs font-bold rounded-full h-6 min-w-[28px] justify-center">
          {tasks.length}
        </Badge>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout" initial={false}>
            {tasks.map((task) => (
              <AnimatedListItem key={task.id}>
                <SortableTaskItem
                  task={task}
                  isActive={activeTaskId === task.id}
                  isDragging={draggingTaskId === task.id}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClone={onClone}
                  onSaveAsTemplate={onSaveAsTemplate}
                  isToggling={togglingTaskIds?.has(task.id)}
                />
              </AnimatedListItem>
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground/50">
            {t('tasks.noTasks')}
          </div>
        )}
      </div>
    </div>
  )
}
