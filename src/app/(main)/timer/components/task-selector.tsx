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

interface TaskSelectorProps {
  className?: string;
}

export function TaskSelector({ className }: TaskSelectorProps) {
  const { tasks, updateTask } = useTasks();
  const { activeTaskId, setActiveTask } = useTasksStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeTask = tasks.find((task) => task.id === activeTaskId);
  const pendingTasks = tasks.filter((task) => task.status !== 'done');

  const handleSelectTask = (taskId: string) => {
    setActiveTask(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status === 'pending') {
      updateTask({ id: taskId, input: { status: 'in_progress' } });
    }
    setIsOpen(false);
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const isActive = task.id === activeTaskId;
    const progress = Math.min(
      100,
      Math.round((task.actualPomodoros / task.estimatePomodoros) * 100),
    );

    return (
      <div
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isActive && 'border-primary bg-primary/10',
        )}
        onClick={() => handleSelectTask(task.id)}
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{task.title}</h4>
            <Badge
              variant={
                task.priority === 'high'
                  ? 'destructive'
                  : task.priority === 'medium'
                    ? 'default'
                    : 'secondary'
              }
            >
              {task.priority}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Pomodoro:</span>
              <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>
                {task.actualPomodoros}/{task.estimatePomodoros}
              </span>
            </div>
            {task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {isActive && <Play className="h-4 w-4 text-primary" />}
      </div>
    );
  };

  return (
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-xs font-medium text-foreground border border-border/50 shadow-sm hover:bg-background/90 transition-colors dark:bg-background/60 dark:hover:bg-background/80">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="truncate max-w-[200px]">{activeTask.title}</span>
              <span className="bg-primary/10 px-1.5 py-0.5 rounded-full text-[10px] border border-primary/20 text-primary font-semibold">
                {activeTask.actualPomodoros}/{activeTask.estimatePomodoros}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-xs font-medium text-muted-foreground border border-border/50 shadow-sm hover:bg-background/90 transition-colors dark:bg-background/60 dark:hover:bg-background/80">
              <Target className="w-3.5 h-3.5" />
              <span>Select a task to focus</span>
            </div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Task for Focus</DialogTitle>
          <DialogDescription>
            Choose a task to work on during your Pomodoro session
          </DialogDescription>
        </DialogHeader>

        <div className="h-[400px] overflow-y-auto pr-4">
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No pending tasks available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a new task to get started
                </p>
              </div>
            ) : (
              pendingTasks.map((task) => <TaskItem key={task.id} task={task} />)
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="link" asChild>
            <Link href="/tasks">
              Go to task list <ArrowRight className="ms-1 h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
