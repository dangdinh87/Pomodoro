import { useState, useMemo, useEffect, useRef } from 'react';
import { Task, useTasksStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Target, CheckCircle, Check, CaretDown, ArrowRight, Confetti } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
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
import { useI18n } from '@/contexts/i18n-context';
import { useTimerStore } from '@/stores/timer-store';

const PILL =
  'inline-flex h-10 max-w-[min(88vw,320px)] items-center gap-2 rounded-full border border-border bg-surface/60 px-4 backdrop-blur-md transition-colors hover:bg-surface-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand';

interface TaskSelectorProps {
  className?: string;
}

export function TaskSelector({ className }: TaskSelectorProps) {
  const { t } = useI18n();

  // Show all incomplete tasks (no date filter) so tasks created anytime are visible
  const { tasks, updateTask, createTask, isCreating, isLoading } = useTasks({
    statusFilter: 'all',
    limit: 50,
  });

  const { activeTaskId, setActiveTask } = useTasksStore();
  const timerMode = useTimerStore((state) => state.mode);
  const isTimerRunning = useTimerStore((state) => state.isRunning);
  const sessionStarted = useTimerStore((state) => state.timeLeft < state.settings.workDuration * 60);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [taskCompleteOpen, setTaskCompleteOpen] = useState(false);
  const completedTaskRef = useRef<Task | null>(null);

  // Filter to eligible (incomplete) tasks
  const pendingTasks = tasks.filter((task) => {
    if (task.status === 'done') return false;
    if (task.actualPomodoros >= task.estimatePomodoros) return false;
    return true;
  });

  const activeTask = pendingTasks.find((task) => task.id === activeTaskId);

  // When active task completes all pomodoros, show completion dialog instead of silently clearing
  useEffect(() => {
    if (!activeTaskId || isLoading) return;
    if (!pendingTasks.some((t) => t.id === activeTaskId)) {
      // Check if task exists but pomodoros are complete (not deleted/already done)
      const fullTask = tasks.find((t) => t.id === activeTaskId);
      if (fullTask && fullTask.status !== 'done' && fullTask.actualPomodoros >= fullTask.estimatePomodoros) {
        completedTaskRef.current = fullTask;
        setTaskCompleteOpen(true);
      } else {
        setActiveTask(null);
      }
    }
  }, [activeTaskId, pendingTasks, tasks, isLoading, setActiveTask]);

  const handleSelectTask = (taskId: string) => {
    // If clicking the current active task -> deselect (un-focus)
    if (activeTaskId === taskId) {
      setActiveTask(null);
      return;
    }

    if (activeTaskId && activeTaskId !== taskId && timerMode === 'work' && (isTimerRunning || sessionStarted)) {
      setIsOpen(false);
      setPendingTaskId(taskId);
      setConfirmOpen(true);
      return;
    }
    selectTask(taskId);
    setIsOpen(false);
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

  const handleAddTask = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title || isCreating) return;
    const created = await createTask({ title, estimatePomodoros: 1 });
    setDraft('');
    if (!activeTaskId && created?.id) setActiveTask(created.id);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={cn(PILL, className)}>
            <Target size={14} className={cn('shrink-0', activeTask ? 'text-brand' : 'text-ink-faint')} aria-hidden="true" />
            <span className={cn('truncate text-[0.8125rem] font-medium', activeTask ? 'text-ink' : 'text-ink-secondary')}>
              {activeTask ? activeTask.title : t('timerComponents.taskSelector.selectToFocus')}
            </span>
            {activeTask && (
              <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-muted">
                {activeTask.actualPomodoros}/{activeTask.estimatePomodoros}
              </span>
            )}
            <CaretDown size={12} className="shrink-0 text-ink-faint" aria-hidden="true" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          data-theme="dark"
          data-timer
          data-mode={timerMode === 'work' ? 'work' : 'break'}
          align="center"
          sideOffset={8}
          className="w-[min(92vw,380px)] overflow-hidden rounded-lg border-border bg-surface p-0 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <h3 className="text-[0.8125rem] font-semibold text-ink">{t('timerUi.activeTasks')}</h3>
            <span className="text-xs tabular-nums text-ink-muted">{pendingTasks.length}</span>
          </div>

          {pendingTasks.length === 0 ? (
            <p className="border-t border-border px-4 py-6 text-center text-[0.8125rem] text-ink-muted">
              {t('timerUi.noActiveTasks')}
            </p>
          ) : (
            <ul className="max-h-[260px] divide-y divide-border overflow-y-auto border-t border-border custom-scrollbar">
              {pendingTasks.map((task) => {
                const isActive = task.id === activeTaskId;
                const progress = Math.min(100, Math.round((task.actualPomodoros / task.estimatePomodoros) * 100));
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleSelectTask(task.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-start transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-hidden',
                        isActive && 'bg-surface-raised',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{task.title}</span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span className="h-1 w-14 overflow-hidden rounded-full bg-border" aria-hidden="true">
                            <span className="block h-full bg-primary transition-[width] duration-600" style={{ width: `${progress}%` }} />
                          </span>
                          <span className="text-xs tabular-nums text-ink-muted">
                            {task.actualPomodoros}/{task.estimatePomodoros}
                          </span>
                        </span>
                      </span>
                      {isActive && <Check size={16} weight="bold" className="shrink-0 text-brand" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={handleAddTask} className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('timerUi.addTaskPlaceholder')}
              aria-label={t('timerUi.addTask')}
              maxLength={120}
              className="h-9"
            />
            <Button type="submit" variant="secondary" size="sm" disabled={!draft.trim() || isCreating}>
              {t('timerUi.addTask')}
            </Button>
          </form>

          <div className="border-t border-border px-4 py-2.5">
            <Link href="/tasks" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-brand hover:text-brand-hover">
              {t('timerUi.manageTasks')} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </PopoverContent>
      </Popover>

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

      {/* Task pomodoro completion dialog */}
      <AlertDialog open={taskCompleteOpen} onOpenChange={(open) => {
        if (!open) {
          setTaskCompleteOpen(false);
          setActiveTask(null);
          completedTaskRef.current = null;
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Confetti size={20} className="text-gold" />
              {t('timerComponents.taskSelector.taskComplete.title') || 'Task complete!'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {completedTaskRef.current && (
                <>
                  <span className="font-semibold text-ink">{completedTaskRef.current.title}</span>
                  {' '}
                  {t('timerComponents.taskSelector.taskComplete.description') || 'has reached all planned pomodoros. Mark as done?'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setTaskCompleteOpen(false);
              setActiveTask(null);
              completedTaskRef.current = null;
            }}>
              {t('timerComponents.taskSelector.taskComplete.skip') || 'Skip'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (completedTaskRef.current) {
                updateTask({ id: completedTaskRef.current.id, input: { status: 'done' } });
              }
              setTaskCompleteOpen(false);
              setActiveTask(null);
              completedTaskRef.current = null;
            }}>
              <CheckCircle size={16} className="mr-1.5" />
              {t('timerComponents.taskSelector.taskComplete.markDone') || 'Mark as done'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
