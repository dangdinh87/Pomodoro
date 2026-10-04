"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { isPast, isToday, isTomorrow } from 'date-fns'
import { BookmarkSimple, CircleNotch, Copy, DotsThree, Flag, Pencil, Target, Trash, CalendarBlank, X } from '@phosphor-icons/react/dist/ssr'
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
  onToggleStatus: (task: Task) => void | Promise<void>
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
// Ticking a box plays the bounce for this long before the row moves to the Done group.
const COMPLETE_BOUNCE_MS = 380

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
                'size-2 rounded-full border-[1.5px]',
                i < done ? 'border-outline bg-primary' : 'border-control-edge',
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
  const reduceMotion = useReducedMotion()
  const quick = variant === 'list'
  const isToggling = togglingTaskIds?.has(task.id)

  // Completing: show the tick (box bounce + strikethrough) first, then hand over to the real status
  // update, which moves the row to the Done group. Un-completing and reduced motion skip the wait.
  const [ticked, setTicked] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const commit = useRef(() => {})
  useEffect(() => {
    commit.current = () => {
      timer.current = null
      void Promise.resolve(onToggleStatus(task)).finally(() => setTicked(false))
    }
  })
  // Leaving mid-bounce (panel closed) must not drop the completion.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current)
        commit.current()
      }
    },
    [],
  )

  const isDone = task.status === 'done' || ticked
  const handleCheckedChange = () => {
    if (ticked) return
    if (task.status === 'done' || reduceMotion) return void onToggleStatus(task)
    setTicked(true)
    timer.current = setTimeout(() => commit.current(), COMPLETE_BOUNCE_MS)
  }

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
          ? 'sticker-sm gap-2.5 py-3 pl-6 pr-1.5 hover:bg-surface-raised'
          : 'gap-3 px-4 py-3.5 hover:bg-surface-raised/60 focus-within:bg-surface-raised/60',
        // Selected for focus: a soft tint, and the hard shadow (card) or a left bar (row) in the accent colour.
        isActive && 'bg-brand-soft/50 hover:bg-brand-soft/50',
        isActive && (variant === 'card' ? 'shadow-[3px_3px_0_var(--accent-solid)]' : 'shadow-[inset_4px_0_0_var(--accent-solid)]'),
      )}
    >
      {dragHandle}
      <motion.div
        className="relative mt-px flex size-[22px] shrink-0 items-center justify-center"
        animate={ticked && !reduceMotion ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: COMPLETE_BOUNCE_MS / 1000, ease: 'easeOut' }}
      >
        <Checkbox
          checked={isDone}
          onCheckedChange={handleCheckedChange}
          disabled={isToggling}
          aria-label={`${isDone ? t('tasks.actions.markIncomplete') : t('tasks.actions.markComplete')} - ${task.title}`}
        />
        {isToggling && (
          <CircleNotch size={12} weight="bold" className="pointer-events-none absolute animate-spin text-on-accent" />
        )}
      </motion.div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <h3
          className={cn(
            'line-clamp-3 wrap-break-word text-[0.9375rem] font-semibold leading-snug text-ink',
            variant === 'list' && 'md:line-clamp-1',
            isDone && 'text-ink-muted line-through',
          )}
        >
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-muted">
          {isActive && (
            <Badge variant="brand">
              <span className="size-1.5 rounded-full bg-primary" />
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
              <Flag size={11} weight="fill" aria-hidden />
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
              {hiddenTags > 0 && <span className="font-bold text-ink-muted">+{hiddenTags}</span>}
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
            {isActive ? <X size={14} weight="bold" /> : <Target size={14} />}
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
                {isActive ? <X size={15} weight="bold" /> : <Target size={15} />}
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
