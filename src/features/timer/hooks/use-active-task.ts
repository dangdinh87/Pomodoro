import { useTasks } from '@/hooks/use-tasks';
import { useTasksStore } from '@/stores/task-store';

/** The task the timer is currently attached to (null when none, or while the list is still loading). */
export function useActiveTask() {
    const activeTaskId = useTasksStore((state) => state.activeTaskId);
    const { tasks } = useTasks({ statusFilter: 'all', limit: 50 });
    return tasks.find((task) => task.id === activeTaskId) ?? null;
}
