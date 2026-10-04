"use client"

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVertical } from '@phosphor-icons/react/dist/ssr'
import { Task } from '@/stores/task-store'
import { useI18n } from '@/contexts/i18n-context'
import { cn } from '@/lib/utils'
import { TaskRow, TaskRowHandlers } from './task-row'

interface SortableTaskItemProps extends TaskRowHandlers {
  task: Task
  isActive: boolean
  isDragging?: boolean
}

export const SortableTaskItem = React.memo(function SortableTaskItem({
  task,
  isActive,
  isDragging,
  ...handlers
}: SortableTaskItemProps) {
  const { t } = useI18n()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative', (isDragging || isSortableDragging) && 'z-50 opacity-50')}
    >
      <TaskRow
        task={task}
        isActive={isActive}
        variant="card"
        dragHandle={
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="focus-ring absolute left-1 top-3 z-10 cursor-grab touch-none rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-offset-0 active:cursor-grabbing"
            aria-label={t('tasksUi.dragHandle')}
          >
            <DotsSixVertical size={16} />
          </button>
        }
        {...handlers}
      />
    </div>
  )
})
