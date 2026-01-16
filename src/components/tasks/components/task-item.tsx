import { memo } from 'react'
import { Task } from '@/stores/task-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { AnimatedTrash, AnimatedEdit, AnimatedTarget, AnimatedSquare } from '@/components/ui/animated-icons'
import { BorderBeam } from '@/components/ui/border-beam'
import { useI18n } from '@/contexts/i18n-context'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TaskItemProps {
  task: Task
  isActive: boolean
  onToggleStatus: (task: Task) => void
  onToggleActive: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
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
      <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-muted-foreground whitespace-nowrap">
        {actual}/{estimated}
      </span>
    </div>
  )
}

export const TaskItem = memo(function TaskItem({
  task,
  isActive,
  onToggleStatus,
  onToggleActive,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const { t } = useI18n()
  const isDone = task.status === 'done'
  const isCancelled = task.status === 'cancelled'
  const isCompleted = isDone || isCancelled

  const priorityVariants: Record<Task['priority'], "destructive" | "default" | "secondary"> = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  }

  return (
    <TooltipProvider>
      <article
        className={cn(
          "group relative rounded-xl border transition-all duration-300 ease-in-out p-4",
          "hover:shadow-xl hover:border-primary/40 hover:-translate-y-0.5",
          "bg-card/40 backdrop-blur-md border-muted/40",
          isActive
            ? "border-transparent ring-2 ring-primary/40 bg-primary/5 shadow-2xl brightness-110"
            : "shadow-md hover:shadow-primary/5",
          isDone && "opacity-60 grayscale-[0.2]"
        )}
      >
        {isActive && <BorderBeam size={160} duration={6} borderWidth={2.5} radius={12} className="z-10 opacity-80" />}

        <div className="flex items-start gap-5">
          <div className="pt-1.5">
            <Checkbox
              checked={isDone}
              onCheckedChange={() => onToggleStatus(task)}
              disabled={isCancelled}
              className="h-5 w-5 rounded-full transition-all hover:scale-110 active:scale-90 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>

          <div className="flex-1 min-w-0 pr-24">
            <div className="flex items-center flex-wrap gap-2.5 mb-2 min-h-[1.75rem]">
              <h3 className={cn(
                "font-bold text-base uppercase tracking-tight leading-snug text-foreground/90",
                isDone && "line-through text-muted-foreground font-medium",
                isCancelled && "text-muted-foreground line-through"
              )}>
                {task.title}
              </h3>

              <div className="flex gap-2 shrink-0 items-center">
                <Badge
                  variant={priorityVariants[task.priority]}
                  className="text-[10px] h-5 px-2 rounded-full font-extrabold uppercase tracking-widest shadow-sm"
                >
                  {t(`tasks.priorityLevels.${task.priority}`)}
                </Badge>
                {isActive && (
                  <Badge variant="outline" className="text-[10px] h-5 px-2 rounded-full font-extrabold uppercase tracking-widest border-primary text-primary animate-pulse bg-primary/20 shadow-primary/20 shadow-sm">
                    Focusing
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-x-6 gap-y-3 text-[12px] text-muted-foreground/80 font-medium">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="shrink-0 opacity-70 uppercase tracking-tighter decoration-primary/30 underline-offset-4 decoration-2">{t('tasks.progress')}:</span>
                <TaskProgress actual={task.actualPomodoros} estimated={task.estimatePomodoros} t={t} />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="opacity-70 uppercase tracking-tighter decoration-primary/30 underline-offset-4 decoration-2">{t('tasks.time')}:</span>
                <span className="tabular-nums font-bold text-foreground/70">{formatMinutes(task.timeSpentMs)}</span>
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

        {/* Actions - Redesigned to be more compact */}
        <div className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
          isActive && "opacity-100"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleActive(task)}
                disabled={isDone}
                className={cn(
                  "h-7 w-7 rounded-sm",
                  isActive ? "text-primary bg-primary/10" : "hover:text-primary hover:bg-primary/5"
                )}
              >
                {isActive ? <AnimatedSquare className="h-3.5 w-3.5 fill-current" /> : <AnimatedTarget className="h-3.5 w-3.5 text-current" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] py-1 px-2">
              {isActive ? t('tasks.actions.stopFocus') : t('tasks.actions.startFocus')}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                disabled={isDone}
                className="h-7 w-7 rounded-sm hover:text-primary hover:bg-primary/5"
              >
                <AnimatedEdit className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] py-1 px-2">
              {t('tasks.actions.edit')}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="h-7 w-7 rounded-sm hover:text-destructive hover:bg-destructive/5"
              >
                <AnimatedTrash className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] py-1 px-2 text-destructive">
              {t('tasks.actions.delete')}
            </TooltipContent>
          </Tooltip>
        </div>
      </article>
    </TooltipProvider>
  )
})
