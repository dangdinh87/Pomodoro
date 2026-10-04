"use client"

import { useState } from 'react'
import { Task, TaskStatus } from '@/stores/task-store'
import { SectionHeading } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/contexts/i18n-context'
import { TaskRow, TaskRowHandlers } from './task-row'

interface TaskListViewProps extends TaskRowHandlers {
  tasks: Task[]
  isLoading: boolean
  activeTaskId: string | null
  forceShowDone: boolean
}

const GROUPS: { status: TaskStatus; labelKey: string }[] = [
  { status: 'doing', labelKey: 'tasksUi.filterDoing' },
  { status: 'todo', labelKey: 'tasksUi.filterTodo' },
  { status: 'done', labelKey: 'tasksUi.filterDone' },
]

export function TaskListView({ tasks, isLoading, activeTaskId, forceShowDone, ...handlers }: TaskListViewProps) {
  const { t } = useI18n()
  const [doneOpen, setDoneOpen] = useState(false)

  if (isLoading && tasks.length === 0) {
    return (
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 px-4 py-3.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {GROUPS.map(({ status, labelKey }) => {
        const group = tasks.filter((task) => task.status === status).sort((a, b) => a.displayOrder - b.displayOrder)
        if (group.length === 0) return null

        const collapsible = status === 'done' && !forceShowDone
        const expanded = !collapsible || doneOpen

        return (
          <section key={status} aria-label={t(labelKey)}>
            <SectionHeading
              action={
                collapsible ? (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setDoneOpen((open) => !open)}
                    className="rounded text-[0.8125rem] font-medium text-brand transition-colors hover:text-brand-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {expanded
                      ? t('tasksUi.hideCompleted')
                      : group.length === 1
                        ? t('tasksUi.showCompletedOne')
                        : t('tasksUi.showCompleted', { count: group.length })}
                  </button>
                ) : undefined
              }
            >
              {t(labelKey)} <span className="ml-1 text-[0.8125rem] font-medium tabular-nums text-ink-faint">{group.length}</span>
            </SectionHeading>
            {expanded && (
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                {group.map((task) => (
                  <TaskRow key={task.id} task={task} isActive={activeTaskId === task.id} {...handlers} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
