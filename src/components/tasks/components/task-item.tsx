import { Task } from '@/stores/task-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { AnimatedTrash, AnimatedEdit, AnimatedTarget, AnimatedSquare } from '@/components/ui/animated-icons'
import { BorderBeam } from '@/components/ui/border-beam'
import { useI18n } from '@/contexts/i18n-context'
import { Copy, Calendar, Bookmark, Loader2 } from 'lucide-react'
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
import { MoreHorizontal } from 'lucide-react'

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
      <div className="w-20 h-1.5 bg-muted/50 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-primary/80 transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-muted-foreground/60 tabular-nums text-[11px] font-medium">
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

export function TaskItem({
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

  const priorityVariants: Record<Task['priority'], "destructive" | "default" | "secondary"> = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  }

  return (
    <TooltipProvider>
      <article
        className={cn(
          "group relative overflow-hidden rounded-xl border transition-all duration-300 ease-in-out p-3.5",
          "hover:shadow-lg hover:border-primary/40",
          "bg-card/40 backdrop-blur-md border-muted/30",
          isActive
            ? "border-transparent ring-1 ring-primary/40 bg-primary/5 shadow-xl brightness-110"
            : "shadow-sm hover:shadow-primary/5",
          isDone && "opacity-60 grayscale-[0.2]"
        )}
      >
        {isActive && <BorderBeam size={160} duration={6} borderWidth={2.5} className="z-10 opacity-80" />}

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
                  <Loader2 className={cn(
                    "h-3 w-3 animate-spin",
                    isDone ? "text-primary-foreground" : "text-primary"
                  )} strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex items-start justify-between gap-4">
                <h3 className={cn(
                  "font-bold text-[16px] tracking-tight leading-snug text-foreground line-clamp-2",
                  isDone && "line-through text-muted-foreground font-normal"
                )}>
                  {task.title}
                </h3>
              </div>

              {task.isTemplate && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-[10px] h-5 px-2.5 rounded-md font-bold border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/20">
                    <Bookmark className="h-3 w-3 mr-1.5 fill-current" />
                    {t('tasks.templateBadge')}
                  </Badge>
                </div>
              )}

              <div className="flex gap-2 shrink-0 items-center">
                <Badge
                  variant={priorityVariants[task.priority]}
                  className="text-[10px] h-5.5 px-3 rounded-full font-semibold capitalize"
                >
                  {t(`tasks.priorityLevels.${task.priority}`)}
                </Badge>
                {isActive && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5.5 px-3 rounded-full font-bold border-primary/40 text-primary animate-pulse bg-primary/10 flex items-center gap-1.5 shadow-sm shadow-primary/10"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    {t('tasks.focusing') || 'Focusing'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {dueDateInfo && (
                <div className={cn(
                  "flex items-center gap-1.5 shrink-0",
                  dueDateInfo.overdue && !isDone && "text-destructive",
                  dueDateInfo.today && !isDone && "text-amber-600",
                  dueDateInfo.tomorrow && !isDone && "text-blue-500"
                )}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {dueDateInfo.overdue && !isDone ? t('tasks.overdue') :
                      dueDateInfo.today ? t('tasks.filters.today') :
                        dueDateInfo.tomorrow ? t('tasks.tomorrow') :
                          format(dueDateInfo.date, 'MMM d')}
                  </span>
                </div>
              )}
              <TaskProgress actual={task.actualPomodoros} estimated={task.estimatePomodoros} t={t} />
              <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground/60">
                <span className="tabular-nums font-medium text-[11px]">{formatMinutes(task.timeSpentMs)}</span>
              </div>
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] h-5 px-2.5 bg-secondary/60 hover:bg-secondary/80 text-secondary-foreground border border-secondary font-semibold rounded-md transition-colors"
                    >
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
          "mt-4 pt-3 flex items-center justify-end gap-1 border-t border-muted/20 transition-all duration-300",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
          isActive && "opacity-100 border-primary/20"
        )}>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-sm hover:bg-muted"
                    aria-label={`${t('common.actions')} - ${task.title}`}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px] py-1 px-2 text-center">
                {t('common.actions')}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(task)} className="text-xs gap-2 cursor-pointer">
                <AnimatedEdit className="h-3.5 w-3.5 text-muted-foreground" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClone?.(task.id)} className="text-xs gap-2 cursor-pointer">
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                {t('tasks.clone')}
              </DropdownMenuItem>
              {!task.isTemplate && onSaveAsTemplate && (
                <DropdownMenuItem onClick={() => onSaveAsTemplate(task.id)} className="text-xs gap-2 cursor-pointer">
                  <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('tasks.templates.saveAsTemplate')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
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
}
