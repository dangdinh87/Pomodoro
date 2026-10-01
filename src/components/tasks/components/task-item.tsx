import React from 'react'
import { Task } from '@/stores/task-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { AnimatedTrash, AnimatedEdit, AnimatedTarget, AnimatedSquare } from '@/components/ui/animated-icons'
import { useI18n } from '@/contexts/i18n-context'
import { Copy, Calendar, BookmarkSimple, CircleNotch, DotsThree } from '@phosphor-icons/react/dist/ssr';
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TaskItemProps {
  task: Task
  isActive: boolean
  onToggleStatus: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onClone?: (id: string) => void
  onSaveAsTemplate?: (id: string) => void
  togglingTaskIds?: Set<string>
}

function formatMinutes(ms?: number): string {
  if (!ms) return '0 min'
  const minutes = Math.max(1, Math.round(ms / 60000))
  return `${minutes} min`
}

function TaskProgress({ actual, estimated, t }: { actual: number; estimated: number; t: any }) {
  const percentage = Math.min(100, Math.round((actual / estimated) * 100))

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-20 h-1.5 bg-surface-raised rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-ink-muted tabular-nums text-[0.6875rem] font-medium">
        {actual}/{estimated}
      </span>
    </div>
  )
}

function getDueDateInfo(dueDate: string | null | undefined) {
  if (!dueDate) return null
  const date = new Date(dueDate)
  const overdue = isPast(date) && !isToday(date)
  const today = isToday(date)
  const tomorrow = isTomorrow(date)
  return { date, overdue, today, tomorrow }
}

export const TaskItem = React.memo(function TaskItem({
  task,
  isActive,
  onToggleStatus,
  onEdit,
  onDelete,
  onClone,
  onSaveAsTemplate,
  togglingTaskIds,
}: TaskItemProps) {
  const { t } = useI18n()
  const isDone = task.status === 'done'
  const dueDateInfo = getDueDateInfo(task.dueDate)

  const priorityVariants: Record<Task['priority'], "destructive" | "warning" | "secondary"> = {
    high: "destructive",
    medium: "warning",
    low: "secondary",
  }

  return (
    <TooltipProvider>
      <article
        className={cn(
          "group relative rounded-lg border bg-surface transition-colors duration-150 p-3.5",
          isActive
            ? "border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]"
            : "border-border hover:border-border-strong",
          isDone && "opacity-60"
        )}
      >
        <div className="flex items-start gap-5">
          <div className="pt-1.5 min-w-[32px] flex justify-center relative">
            <div className="relative flex items-center justify-center h-5 w-5">
              <Checkbox
                checked={isDone}
                onCheckedChange={() => onToggleStatus(task)}
                className={cn(
                  "h-5 w-5 rounded-full transition-all hover:scale-110 active:scale-90 data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                  togglingTaskIds?.has(task.id) && "opacity-50"
                )}
                disabled={togglingTaskIds?.has(task.id)}
                aria-label={`${isDone ? t('tasks.actions.markIncomplete') : t('tasks.actions.markComplete')} - ${task.title}`}
              />
              {togglingTaskIds?.has(task.id) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <CircleNotch className={cn(
                    "h-3 w-3 animate-spin",
                    isDone ? "text-primary-foreground" : "text-primary"
                  )} weight="bold" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex items-start justify-between gap-4">
                <h3 className={cn(
                  "font-semibold text-[0.9375rem] leading-snug text-ink line-clamp-2",
                  isDone && "line-through text-ink-muted font-normal"
                )}>
                  {task.title}
                </h3>
              </div>

              {task.isTemplate && (
                <div className="mt-1">
                  <Badge variant="secondary">
                    <BookmarkSimple size={12} weight="fill" />
                    {t('tasks.templateBadge')}
                  </Badge>
                </div>
              )}

              <div className="flex gap-2 shrink-0 items-center">
                <Badge variant={priorityVariants[task.priority]} className="capitalize">
                  {t(`tasks.priorityLevels.${task.priority}`)}
                </Badge>
                {isActive && (
                  <Badge variant="brand">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t('tasks.focusing') || 'Focusing'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-ink-muted">
              {dueDateInfo && (
                <div className={cn(
                  "flex items-center gap-1.5 shrink-0",
                  dueDateInfo.overdue && !isDone && "text-danger-ink",
                  dueDateInfo.today && !isDone && "text-warning-ink"
                )}>
                  <Calendar size={14} />
                  <span className="font-medium">
                    {dueDateInfo.overdue && !isDone ? t('tasks.overdue') :
                      dueDateInfo.today ? t('tasks.filters.today') :
                        dueDateInfo.tomorrow ? t('tasks.tomorrow') :
                          format(dueDateInfo.date, 'MMM d')}
                  </span>
                </div>
              )}
              <TaskProgress actual={task.actualPomodoros} estimated={task.estimatePomodoros} t={t} />
              <div className="flex items-center gap-1.5 shrink-0 text-ink-muted">
                <span className="tabular-nums font-medium text-[0.6875rem]">{formatMinutes(task.timeSpentMs)}</span>
              </div>
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions - Bottom Aligned */}
        <div className={cn(
          "mt-4 pt-3 flex items-center justify-end gap-1 border-t border-border transition-opacity duration-150",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
          isActive && "opacity-100"
        )}>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={`${t('common.actions')} - ${task.title}`}
              >
                <DotsThree size={14} className="text-ink-muted" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(task)} className="text-xs gap-2 cursor-pointer">
                <AnimatedEdit className="h-3.5 w-3.5 text-ink-muted" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClone?.(task.id)} className="text-xs gap-2 cursor-pointer">
                <Copy size={14} className="text-ink-muted" />
                {t('tasks.clone')}
              </DropdownMenuItem>
              {!task.isTemplate && onSaveAsTemplate && (
                <DropdownMenuItem onClick={() => onSaveAsTemplate(task.id)} className="text-xs gap-2 cursor-pointer">
                  <BookmarkSimple size={14} className="text-ink-muted" />
                  {t('tasks.templates.saveAsTemplate')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-xs gap-2 text-danger-ink focus:text-danger-ink cursor-pointer"
              >
                <AnimatedTrash className="h-3.5 w-3.5" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </article>
    </TooltipProvider>
  )
})
