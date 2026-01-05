import { useState } from 'react';
import { Task, useTasksStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/contexts/i18n-context';

interface TaskSelectorProps {
  className?: string;
}

export function TaskSelector({ className }: TaskSelectorProps) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { activeTaskId, setActiveTask } = useTasksStore();
  const [isOpen, setIsOpen] = useState(false);


  const activeTask = tasks.find((task) => task.id === activeTaskId);

  const todayTasks = tasks.filter((task) => {
    if (task.status === 'done' || task.status === 'cancelled') return false;
    const taskDate = new Date(task.createdAt);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  const handleSelectTask = (taskId: string) => {
    setActiveTask(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status === 'pending') {
      updateTask({ id: taskId, input: { status: 'in_progress' } });
    }
    // Removed setIsOpen(false) to keep modal open as per user request
  };

  const TaskItemInternal = ({ task }: { task: Task }) => {
    const isActive = task.id === activeTaskId;
    const progress = Math.min(
      100,
      Math.round((task.actualPomodoros / task.estimatePomodoros) * 100),
    );

    return (
      <div
        className={cn(
          'group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer overflow-hidden',
          'bg-card/40 backdrop-blur-sm border-muted/40 hover:border-primary/40 hover:shadow-lg hover:bg-primary/5',
          isActive && 'border-primary ring-1 ring-primary/30 bg-primary/10 shadow-md',
        )}
        onClick={() => handleSelectTask(task.id)}
      >
        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h4 className={cn(
              "font-bold text-sm uppercase tracking-tight truncate",
              isActive && "text-primary"
            )}>{task.title}</h4>
            <Badge
              variant={
                task.priority === 'high'
                  ? 'destructive'
                  : task.priority === 'medium'
                    ? 'default'
                    : 'secondary'
              }
              className="text-[9px] h-4.5 px-1.5 rounded-full font-bold uppercase tracking-wider"
            >
              {t(`tasks.priorityLevels.${task.priority}`)}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span className="opacity-70">Pomodoro:</span>
              <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-0.5 rounded-full">
                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="tabular-nums font-bold">
                  {task.actualPomodoros}/{task.estimatePomodoros}
                </span>
              </div>
            </div>

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px] h-4.5 px-2 bg-secondary/50 text-secondary-foreground border-none font-normal leading-none py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 pt-1">
          {isActive ? (
            <div className="p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110 transition-transform">
              <Play className="h-3 w-3 fill-current" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              <Play className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {!isAuthenticated ? (
        <Link href="/login?redirect=/timer">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-sm hover:bg-background/90 transition-colors dark:bg-background/60 dark:hover:bg-background/80 cursor-pointer">
            <div className="p-1.5 rounded-full bg-muted text-muted-foreground">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{t('timerComponents.taskSelector.loginToSelect')}</span>
          </div>
        </Link>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'h-auto p-0 hover:bg-transparent',
                className,
              )}
              aria-label="Select task for focus"
            >
              {activeTask ? (
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-sm hover:bg-background/90 transition-colors dark:bg-background/60 dark:hover:bg-background/80">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{activeTask.title}</span>
                  </div>
                  <span className="bg-primary/10 px-1.5 py-0.5 rounded-full text-[10px] border border-primary/20 text-primary font-semibold">
                    {activeTask.actualPomodoros}/{activeTask.estimatePomodoros}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-sm hover:bg-background/90 transition-colors dark:bg-background/60 dark:hover:bg-background/80">
                  <div className="p-1.5 rounded-full bg-muted text-muted-foreground">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{t('timerComponents.taskSelector.selectToFocus')}</span>
                </div>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{t('timerComponents.taskSelector.dialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('timerComponents.taskSelector.dialogDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-primary border-primary/30 bg-primary/5">
                    {t('tasks.filters.today') || "Today's Tasks"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground italic">{todayTasks.length} {t('tasks.count') || "tasks"}</span>
                </div>

                {todayTasks.length === 0 ? (
                  <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-muted/50">
                    <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      {t('timerComponents.taskSelector.noPendingTasksToday') || t('timerComponents.taskSelector.noPendingTasks')}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2 px-8">
                      {t('timerComponents.taskSelector.createTaskPrompt')}
                    </p>
                  </div>
                ) : (
                  todayTasks.map((task) => <TaskItemInternal key={task.id} task={task} />)
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="link" asChild>
                <Link href="/tasks">
                  {t('timerComponents.taskSelector.goToTaskList')} <ArrowRight className="ms-1 h-4 w-4" />
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
