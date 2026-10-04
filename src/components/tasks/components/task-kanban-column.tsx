"use client"

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Check, ListBullets, Timer } from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile'
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

const STATUS_TILE: Record<TaskStatus, { icon: Icon; tone: IconTileTone }> = {
  todo: { icon: ListBullets, tone: 'sky' },
  doing: { icon: Timer, tone: 'butter' },
  done: { icon: Check, tone: 'mint' },
}

export function TaskKanbanColumn({ status, tasks, activeTaskId, draggingTaskId, ...handlers }: TaskKanbanColumnProps) {
  const { t } = useI18n()
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const tile = STATUS_TILE[status]

  return (
    <section
      ref={setNodeRef}
      aria-label={t(STATUS_LABEL_KEY[status])}
      className={cn(
        // A lane is a sticker card; the cards inside are smaller stickers. Dropping onto it turns its shadow accent-coloured.
        'sticker flex min-h-[200px] w-[86%] shrink-0 snap-start flex-col bg-surface-raised p-3 transition-[box-shadow,background-color] duration-150 md:min-h-[320px] md:w-auto md:shrink',
        isOver && 'bg-surface-hover shadow-[4px_4px_0_var(--accent-solid)]',
      )}
    >
      <h3 className="mb-3 flex items-center gap-2 px-1 font-heading text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">
        <IconTile icon={tile.icon} tone={tile.tone} size="sm" weight="bold" />
        {t(STATUS_LABEL_KEY[status])}
        <span className="rounded-full border-2 border-outline bg-surface px-2 text-xs font-bold leading-5 tabular-nums text-ink-secondary">
          {tasks.length}
        </span>
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
          <p className="rounded-md border-2 border-dashed border-ink-faint px-3 py-6 text-center text-[0.8125rem] font-semibold text-ink-muted">
            {t('tasksUi.boardEmpty')}
          </p>
        )}
      </div>
    </section>
  )
}
