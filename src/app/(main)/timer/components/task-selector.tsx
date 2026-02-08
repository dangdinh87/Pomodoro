import { useState, useMemo, useEffect } from 'react';
import { Task, useTasksStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Play, Square, CheckCircle2, ArrowRight } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/contexts/i18n-context';

interface TaskSelectorProps {
  className?: string;
}

export function TaskSelector({ className }: TaskSelectorProps) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  // Show all incomplete tasks (no date filter) so tasks created anytime are visible
  const { tasks, updateTask, isLoading } = useTasks({
    statusFilter: 'all',
    limit: 50,
  });

  const { activeTaskId, setActiveTask } = useTasksStore();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  // Filter to eligible (incomplete) tasks
  const pendingTasks = tasks.filter((task) => {
    if (task.status === 'done') return false;
    if (task.actualPomodoros >= task.estimatePomodoros) return false;
    return true;
  });

  const activeTask = pendingTasks.find((task) => task.id === activeTaskId);

  // Clear stale activeTaskId when the task is no longer eligible (done, completed, or deleted)
  useEffect(() => {
    if (!activeTaskId || isLoading) return;
    if (!pendingTasks.some((t) => t.id === activeTaskId)) {
      setActiveTask(null);
    }
  }, [activeTaskId, pendingTasks, isLoading, setActiveTask]);

  const handleSelectTask = (taskId: string) => {
    // If clicking the current active task -> deselect (un-focus)
    if (activeTaskId === taskId) {
      setActiveTask(null);
      return;
    }

    if (activeTaskId && activeTaskId !== taskId) {
      setPendingTaskId(taskId);
      setConfirmOpen(true);
      return;
    }
    selectTask(taskId);
  };

  const selectTask = (taskId: string) => {
    setActiveTask(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status === 'todo') {
      updateTask({ id: taskId, input: { status: 'doing' } });
    }
    setConfirmOpen(false);
    setPendingTaskId(null);
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
          'bg-card/40 backdrop-blur-sm border-muted/40 hover:border-foreground/40 hover:shadow-lg hover:bg-foreground/5',
          isActive && 'border-foreground bg-foreground/5 shadow-md animate-pulse duration-[3000ms]',
        )}
        onClick={() => handleSelectTask(task.id)}
      >
        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h4 className={cn(
              "font-bold text-sm uppercase tracking-tight truncate",
              isActive && "text-foreground"
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
                    className="h-full bg-foreground transition-all duration-500"
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

        <div className="shrink-0 pt-1" title={isActive ? t('timerComponents.taskSelector.stopFocus') : t('timerComponents.taskSelector.startFocus')}>
          {isActive ? (
            <div className="p-1.5 rounded-full bg-foreground text-background shadow-lg shadow-foreground/30 scale-110 transition-transform">
              <Square className="h-3 w-3 fill-current" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-foreground/20 group-hover:text-foreground transition-colors">
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
        <>
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
                      <div className="p-1.5 rounded-full bg-foreground/10 text-foreground">
                        <Target className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{activeTask.title}</span>
                    </div>
                    <span className="bg-foreground/10 px-1.5 py-0.5 rounded-full text-[10px] border border-foreground/20 text-foreground font-semibold">
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
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-foreground border-foreground/30 bg-foreground/5">
                      {t('timerComponents.taskSelector.pendingTasks') || "Pending Tasks"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground italic">{pendingTasks.length} {t('tasks.count') || "tasks"}</span>
                  </div>

                  {pendingTasks.length === 0 ? (
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
                    pendingTasks.map((task) => <TaskItemInternal key={task.id} task={task} />)
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

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('timerComponents.taskSelector.switchConfirm.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('timerComponents.taskSelector.switchConfirm.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPendingTaskId(null)}>
                  {t('common.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => pendingTaskId && selectTask(pendingTaskId)}>
                  {t('common.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
