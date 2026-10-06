"use client"

import { useState } from 'react'
import { Task, TaskStatus } from '@/stores/task-store'
import { Tomo } from '@/components/brand/tomo'
import { Button } from '@/components/ui/button'
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

/** Tomo's pat on the back, the last row of the Done group (only rendered when the group has tasks). */
function DoneCheer() {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-3 bg-surface-raised px-4 py-2.5">
      <Tomo face="party" size={40} tight />
      <p className="text-[0.875rem] font-bold leading-snug text-ink-secondary">{t('tasksUi.doneCheer')}</p>
    </div>
  )
}

export function TaskListView({ tasks, isLoading, activeTaskId, forceShowDone, ...handlers }: TaskListViewProps) {
  const { t } = useI18n()
  const [doneOpen, setDoneOpen] = useState(false)

  if (isLoading && tasks.length === 0) {
    return (
      <div className="sticker divide-y-2 divide-border overflow-hidden">
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
                  <Button
                    type="button"
                    variant="link"
                    aria-expanded={expanded}
                    onClick={() => setDoneOpen((open) => !open)}
                    className="text-[0.8125rem] text-brand"
                  >
                    {expanded
                      ? t('tasksUi.hideCompleted')
                      : group.length === 1
                        ? t('tasksUi.showCompletedOne')
                        : t('tasksUi.showCompleted', { count: group.length })}
                  </Button>
                ) : undefined
              }
            >
              {t(labelKey)} <span className="ml-1 text-[0.8125rem] font-semibold tabular-nums text-ink-muted">{group.length}</span>
            </SectionHeading>
            {expanded && (
              <div className="sticker divide-y-2 divide-border overflow-hidden">
                {group.map((task) => (
                  <TaskRow key={task.id} task={task} isActive={activeTaskId === task.id} {...handlers} />
                ))}
                {status === 'done' && <DoneCheer />}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
