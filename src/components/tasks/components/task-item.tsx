"use client"

import { Task } from '@/stores/task-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { AnimatedTrash, AnimatedEdit, AnimatedTarget, AnimatedPlay, AnimatedSquare } from '@/components/ui/animated-icons'
import { BorderBeam } from '@/components/ui/border-beam'
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

const priorityMap: Record<Task['priority'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  high: { label: 'High', variant: 'destructive' },
  medium: { label: 'Medium', variant: 'default' },
  low: { label: 'Low', variant: 'secondary' },
}

const statusLabel: Record<Task['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'default' },
  done: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

function formatMinutes(ms?: number): string {
  if (!ms) return '0 min'
  const minutes = Math.max(1, Math.round(ms / 60000))
  return `${minutes} min`
}

function TaskProgress({ actual, estimated }: { actual: number; estimated: number }) {
  const percentage = Math.min(100, Math.round((actual / estimated) * 100))

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-muted-foreground">
        {actual}/{estimated}
      </span>
    </div>
  )
}

const statusStyles: Record<Task['status'], string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200/80",
  done: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200/80",
  cancelled: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200/80",
}

export function TaskItem({
  task,
  isActive,
  onToggleStatus,
  onToggleActive,
  onEdit,
  onDelete,
}: TaskItemProps) {

  const priority = priorityMap[task.priority]
  const status = statusLabel[task.status]
  const isDone = task.status === 'done'
  const isCancelled = task.status === 'cancelled'
  const isCompleted = isDone || isCancelled

  return (
    <TooltipProvider>

      <article
        className={cn(
          "group relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 ease-in-out",
          "hover:shadow-lg hover:border-primary/50",
          // light styles
          "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
          // dark styles
          "dark:bg-transparent dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]",
          isActive && "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20 dark:bg-primary/20 z-10",
          isDone && "opacity-60 bg-muted/30 border-dashed",
          isCancelled && "opacity-60 bg-destructive/5 border-destructive/20"
        )}
        aria-label={`Task: ${task.title}`}
      >

        <div className="flex items-start gap-4">

          <Checkbox
            checked={isDone}
            onCheckedChange={() => onToggleStatus(task)}
            disabled={isCancelled}
            aria-label={`Mark ${task.title} as ${isDone ? 'pending' : 'completed'}`}
            className="mt-1.5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground disabled:opacity-50"
          />

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn(
                "font-semibold text-base line-clamp-2 break-words",
                isDone && "line-through text-muted-foreground decoration-muted-foreground/50",
                isCancelled && "text-muted-foreground decoration-destructive/50 line-through"
              )}>
                {task.title}
              </h3>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={priority.variant} className="text-[10px] px-1.5 py-0 h-5 uppercase tracking-wider font-bold">
                  {priority.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-5 uppercase tracking-wider font-bold border",
                    statusStyles[task.status]
                  )}
                >
                  {isActive ? '🔥 Active' : status.label}
                </Badge>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {!isDone && (
                <>
                  <div className="flex items-center gap-2" title="Pomodoros completed / estimated">
                    <span className="font-medium">Progress:</span>
                    <TaskProgress actual={task.actualPomodoros} estimated={task.estimatePomodoros} />
                  </div>
                  <div className="flex items-center gap-1" title="Total time spent">
                    <span className="font-medium">Time:</span>
                    <span>{formatMinutes(task.timeSpentMs)}</span>
                  </div>
                </>
              )}
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal bg-secondary/50 hover:bg-secondary/70">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Toolbar - Visible on hover or when active */}
        <div className={cn(
          "absolute top-4 right-4 flex items-center gap-1 opacity-0 transition-opacity duration-200",
          "group-hover:opacity-100 focus-within:opacity-100",
          isActive && "opacity-100"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToggleActive(task)}
                disabled={isDone}
                className={cn(
                  "h-8 w-8 transition-colors",
                  isActive ? "shadow-sm" : "hover:bg-primary/10 hover:text-primary",
                  isCompleted && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
                )}
              >
                {isActive ? <AnimatedSquare className="fill-current" /> : <AnimatedTarget />}
                <span className="sr-only">{isActive ? 'Stop focusing' : 'Focus'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCancelled ? 'Task is cancelled' : isDone ? 'Task is completed' : isActive ? 'Stop focusing' : 'Focus on this task'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(task)}
                disabled={isDone}
                className={cn(
                  "h-8 w-8 hover:bg-primary/10 hover:text-primary",
                  isCompleted && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
                )}
              >
                <AnimatedEdit />
                <span className="sr-only">Edit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCancelled ? 'Cannot edit cancelled task' : isDone ? 'Cannot edit completed task' : 'Edit task'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <AnimatedTrash />
                <span className="sr-only">Delete</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete permanently</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </article>
    </TooltipProvider>
  )
}
