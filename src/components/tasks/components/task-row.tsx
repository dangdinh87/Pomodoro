"use client"

import React from 'react'
import { isPast, isToday, isTomorrow } from 'date-fns'
import { BookmarkSimple, CircleNotch, Copy, DotsThree, Pencil, Play, Stop, Trash, CalendarBlank } from '@phosphor-icons/react/dist/ssr'
import { Task } from '@/stores/task-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/contexts/i18n-context'
import { cn } from '@/lib/utils'

export interface TaskRowHandlers {
  onToggleStatus: (task: Task) => void
  onFocus: (task: Task) => void
  onStopFocus: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onClone?: (id: string) => void
  onSaveAsTemplate?: (id: string) => void
  togglingTaskIds?: Set<string>
}

interface TaskRowProps extends TaskRowHandlers {
  task: Task
  isActive: boolean
  variant?: 'list' | 'card'
  dragHandle?: React.ReactNode
}

const MAX_DOTS = 8
const MAX_TAGS = 3

function PomodoroProgress({ done, total, label }: { done: number; total: number; label: string }) {
  const showDots = total > 0 && total <= MAX_DOTS
  return (
    <span className="inline-flex items-center gap-1.5" title={label} aria-label={label}>
      {showDots && (
        <span className="inline-flex items-center gap-[3px]" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                i < done ? 'bg-primary' : 'border border-ink-faint',
              )}
            />
          ))}
        </span>
      )}
      <span className="tabular-nums" aria-hidden>
        {done}/{total}
      </span>
    </span>
  )
}

export const TaskRow = React.memo(function TaskRow({
  task,
  isActive,
  variant = 'list',
  dragHandle,
  onToggleStatus,
  onFocus,
  onStopFocus,
  onEdit,
  onDelete,
  onClone,
  onSaveAsTemplate,
  togglingTaskIds,
}: TaskRowProps) {
  const { t, lang } = useI18n()
  const isDone = task.status === 'done'
  const quick = variant === 'list'
  const isToggling = togglingTaskIds?.has(task.id)

  const due = task.dueDate ? new Date(task.dueDate) : null
  const dueToday = !!due && isToday(due)
  const overdue = !!due && !dueToday && isPast(due)
  const dueLabel = !due
    ? null
    : dueToday
      ? t('tasksUi.dueToday')
      : overdue
        ? t('tasksUi.overdue')
        : isTomorrow(due)
          ? t('tasksUi.dueTomorrow')
          : due.toLocaleDateString(lang, { month: 'short', day: 'numeric' })

  const visibleTags = task.tags.slice(0, MAX_TAGS)
  const hiddenTags = task.tags.length - visibleTags.length

  return (
    <article
      className={cn(
        'group relative flex items-start transition-colors duration-150',
        variant === 'card'
          ? 'gap-2.5 rounded-md border border-border bg-surface py-3 pl-6 pr-1.5 hover:border-border-strong'
          : 'gap-3 px-4 py-3 hover:bg-surface-raised/60 focus-within:bg-surface-raised/60',
        isActive && 'ring-1 ring-inset ring-brand/50',
        variant === 'list' && 'first:rounded-t-lg last:rounded-b-lg',
      )}
    >
      {dragHandle}
      <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <Checkbox
          checked={isDone}
          onCheckedChange={() => onToggleStatus(task)}
          disabled={isToggling}
          className="h-5 w-5 rounded-full border-ink-faint bg-surface data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
          aria-label={`${isDone ? t('tasks.actions.markIncomplete') : t('tasks.actions.markComplete')} - ${task.title}`}
        />
        {isToggling && (
          <CircleNotch size={12} weight="bold" className="pointer-events-none absolute animate-spin text-primary" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <h3
          className={cn(
            'line-clamp-3 wrap-break-word text-[0.9375rem] font-medium leading-snug text-ink',
            variant === 'list' && 'md:line-clamp-1',
            isDone && 'text-ink-muted line-through',
          )}
        >
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-muted">
          {isActive && (
            <Badge variant="brand">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('tasksUi.focusingBadge')}
            </Badge>
          )}
          {task.isTemplate && (
            <Badge variant="secondary">
              <BookmarkSimple size={11} weight="fill" />
              {t('tasks.templateBadge')}
            </Badge>
          )}
          {task.priority !== 'low' && !isDone && (
            <Badge variant={task.priority === 'high' ? 'destructive' : 'warning'}>
              {t(`tasks.priorityLevels.${task.priority}`)}
            </Badge>
          )}
          {dueLabel && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                !isDone && overdue && 'text-danger-ink',
                !isDone && dueToday && 'text-warning-ink',
              )}
            >
              <CalendarBlank size={13} />
              {dueLabel}
            </span>
          )}
          {task.tags.length > 0 && (
            <span className="inline-flex flex-wrap items-center gap-1">
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {hiddenTags > 0 && <span className="text-ink-faint">+{hiddenTags}</span>}
            </span>
          )}
          <PomodoroProgress
            done={task.actualPomodoros}
            total={task.estimatePomodoros}
            label={t('tasksUi.pomodoroProgress', { done: task.actualPomodoros, total: task.estimatePomodoros })}
          />
        </div>
      </div>

      <div className={cn('flex shrink-0 items-center gap-0.5', variant === 'list' && '-mr-2')}>
        {quick && !isDone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (isActive ? onStopFocus(task) : onFocus(task))}
            className="hidden gap-1.5 text-ink-secondary opacity-0 transition-opacity focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 md:inline-flex"
            aria-label={`${isActive ? t('tasksUi.stopFocus') : t('tasksUi.focus')} - ${task.title}`}
          >
            {isActive ? <Stop size={14} weight="fill" /> : <Play size={14} weight="fill" />}
            {isActive ? t('tasksUi.stopFocus') : t('tasksUi.focus')}
          </Button>
        )}
        {quick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          className="hidden text-ink-muted opacity-0 transition-opacity focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 md:inline-flex"
          aria-label={`${t('tasksUi.edit')} - ${task.title}`}
        >
          <Pencil size={16} />
        </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-ink-muted"
              aria-label={`${t('tasksUi.more')} - ${task.title}`}
            >
              <DotsThree size={18} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!isDone && (
              <DropdownMenuItem
                onClick={() => (isActive ? onStopFocus(task) : onFocus(task))}
                className={cn('cursor-pointer gap-2', quick && 'md:hidden')}
              >
                {isActive ? <Stop size={15} weight="fill" /> : <Play size={15} weight="fill" />}
                {isActive ? t('tasksUi.stopFocus') : t('tasksUi.focus')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(task)} className={cn('cursor-pointer gap-2', quick && 'md:hidden')}>
              <Pencil size={15} />
              {t('tasksUi.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className={cn(quick && 'md:hidden')} />
            <DropdownMenuItem onClick={() => onClone?.(task.id)} className="cursor-pointer gap-2">
              <Copy size={15} />
              {t('tasksUi.duplicate')}
            </DropdownMenuItem>
            {!task.isTemplate && onSaveAsTemplate && (
              <DropdownMenuItem onClick={() => onSaveAsTemplate(task.id)} className="cursor-pointer gap-2">
                <BookmarkSimple size={15} />
                {t('tasksUi.saveAsTemplate')}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="cursor-pointer gap-2 text-danger-ink focus:text-danger-ink"
            >
              <Trash size={15} />
              {t('tasksUi.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
})
