"use client"

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/stores/task-store'
import { SortableTaskItem } from './sortable-task-item'
import { TaskRowHandlers } from './task-row'
import { useI18n } from '@/contexts/i18n-context'
import { cn } from '@/lib/utils'

interface TaskKanbanColumnProps extends TaskRowHandlers {
  status: TaskStatus
  tasks: Task[]
  activeTaskId: string | null
  draggingTaskId: string | null
}

const STATUS_LABEL_KEY: Record<TaskStatus, string> = {
  todo: 'tasksUi.filterTodo',
  doing: 'tasksUi.filterDoing',
  done: 'tasksUi.filterDone',
}

export function TaskKanbanColumn({ status, tasks, activeTaskId, draggingTaskId, ...handlers }: TaskKanbanColumnProps) {
  const { t } = useI18n()
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <section
      ref={setNodeRef}
      aria-label={t(STATUS_LABEL_KEY[status])}
      className={cn(
        'flex min-h-[200px] w-[86%] shrink-0 snap-start flex-col rounded-lg border bg-surface-raised p-3 transition-colors duration-150 md:min-h-[320px] md:w-auto md:shrink',
        isOver ? 'border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]' : 'border-transparent',
      )}
    >
      <h3 className="mb-3 flex items-center gap-2 px-1 font-heading text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">
        {t(STATUS_LABEL_KEY[status])}
        <span className="text-[0.8125rem] font-medium tabular-nums text-ink-faint">{tasks.length}</span>
      </h3>

      <div className="flex-1 space-y-2">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              isActive={activeTaskId === task.id}
              isDragging={draggingTaskId === task.id}
              {...handlers}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="rounded-md border border-dashed border-border-strong px-3 py-6 text-center text-[0.8125rem] text-ink-muted">
            {t('tasksUi.boardEmpty')}
          </p>
        )}
      </div>
    </section>
  )
}
