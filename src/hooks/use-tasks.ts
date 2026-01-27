import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskPriority,
  TaskStatus,
} from '@/stores/task-store';
import { toast } from 'sonner';

// Helper functions to map API data
function mapPriorityToApi(priority: TaskPriority | undefined) {
  if (!priority) return undefined;
  return priority.toUpperCase();
}

function mapPriorityFromApi(priority: string): TaskPriority {
  const lowered = priority.toLowerCase();
  if (lowered === 'low' || lowered === 'medium' || lowered === 'high') {
    return lowered;
  }
  return 'medium';
}

function mapStatusFromApi(status: string): TaskStatus {
  const lowered = status.toLowerCase();
  // Handle new status values
  if (lowered === 'todo' || lowered === 'doing' || lowered === 'done') {
    return lowered;
  }
  // Legacy status mapping for backward compatibility
  if (lowered === 'pending') return 'todo';
  if (lowered === 'in_progress') return 'doing';
  return 'todo';
}

function mapTaskFromApi(raw: any): Task {
  const now = new Date().toISOString();
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    priority: mapPriorityFromApi(raw.priority),
    estimatePomodoros: raw.estimatedPomodoros ?? raw.estimate_pomodoros ?? 1,
    actualPomodoros: raw.actualPomodoros ?? raw.actual_pomodoros ?? 0,
    timeSpentMs: raw.timeSpentMs ?? raw.time_spent ?? 0,
    status: mapStatusFromApi(raw.status ?? 'TODO'),
    tags: raw.tags ?? [],
    createdAt: raw.createdAt ?? raw.created_at ?? now,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? now,
    // New fields
    dueDate: raw.dueDate ?? raw.due_date ?? null,
    parentTaskId: raw.parentTaskId ?? raw.parent_task_id ?? null,
    displayOrder: raw.displayOrder ?? raw.display_order ?? 0,
    isTemplate: raw.isTemplate ?? raw.is_template ?? false,
  };
}

// API functions
async function fetchTasks({
  page = 1,
  limit = 10,
  filters = {},
}: {
  page?: number;
  limit?: number;
  filters?: {
    q?: string;
    status?: string;
    priority?: string;
    tag?: string;
    from?: string;
    to?: string;
    dateField?: string;
  };
} = {}): Promise<{
  tasks: Task[];
  total: number;
}> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.q) queryParams.append('q', filters.q);
  if (filters.status && filters.status !== 'all')
    queryParams.append('status', filters.status);
  if (filters.priority && filters.priority !== 'all')
    queryParams.append('priority', filters.priority);
  if (filters.tag && filters.tag !== 'all')
    queryParams.append('tag', filters.tag);
  if (filters.from) queryParams.append('from', filters.from);
  if (filters.to) queryParams.append('to', filters.to);
  if (filters.dateField) queryParams.append('dateField', filters.dateField);

  const res = await fetch(`/api/tasks?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return {
    tasks: (data.tasks ?? []).map(mapTaskFromApi),
    total: data.total ?? 0,
  };
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  const body = {
    title: input.title,
    description: input.description,
    priority: mapPriorityToApi(input.priority) ?? 'MEDIUM',
    estimate_pomodoros: input.estimatePomodoros ?? 1,
    tags: input.tags ?? [],
    due_date: input.dueDate ?? null,
    parent_task_id: input.parentTaskId ?? null,
    is_template: input.isTemplate ?? false,
  };

  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage =
      errorData.details || errorData.error || 'Failed to create task';
    console.error('Failed to create task:', {
      status: res.status,
      statusText: res.statusText,
      error: errorData,
    });
    throw new Error(errorMessage);
  }
  const data = await res.json();
  return mapTaskFromApi(data.task);
}

async function updateTask({
  id,
  input,
}: {
  id: string;
  input: UpdateTaskInput;
}): Promise<Task> {
  const body: any = {
    title: input.title,
    description: input.description,
    priority: mapPriorityToApi(input.priority),
    estimate_pomodoros: input.estimatePomodoros,
    tags: input.tags,
    status: input.status?.toUpperCase(),
    due_date: input.dueDate,
    parent_task_id: input.parentTaskId,
    display_order: input.displayOrder,
    is_template: input.isTemplate,
  };

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) delete body[key];
  });

  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Failed to update task');
  const data = await res.json();
  return mapTaskFromApi(data.task);
}

async function softDeleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}

async function hardDeleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}?hard=true`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to permanently delete task');
}

// Reorder tasks - update display_order for multiple tasks
async function reorderTasks(
  taskOrders: { id: string; displayOrder: number }[],
): Promise<void> {
  const res = await fetch('/api/tasks/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks: taskOrders }),
  });
  if (!res.ok) throw new Error('Failed to reorder tasks');
}

// Clone a task
async function cloneTask(taskId: string): Promise<Task> {
  const res = await fetch(`/api/tasks/${taskId}/clone`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to clone task');
  const data = await res.json();
  return mapTaskFromApi(data.task);
}

export function useTasks(filters: any = {}) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = filters.limit || 10;

  const tasksQuery = useQuery({
    queryKey: ['tasks', page, limit, filters],
    queryFn: () =>
      fetchTasks({
        page,
        limit,
        filters: {
          q: filters.query,
          status: filters.statusFilter,
          priority: filters.priorityFilter,
          tag: filters.tagFilter,
          from: filters.dateRange?.from?.toISOString(),
          to: filters.dateRange?.to?.toISOString(),
          dateField: filters.dateField || 'created_at',
        },
      }),
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create task');
      console.error(error);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return [];
        return old.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              ...input,
              // Handle partial updates for nested/complex types if needed
              priority: input.priority ?? task.priority,
              status: input.status ?? task.status,
              updatedAt: new Date().toISOString(), // Optimistic update timestamp
            } as Task;
          }
          return task;
        });
      });

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast.error('Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const softDeleteTaskMutation = useMutation({
    mutationFn: softDeleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old ? old.filter((task) => task.id !== id) : [],
      );

      return { previousTasks };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      toast.error('Failed to delete task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task moved to trash');
    },
  });

  const hardDeleteTaskMutation = useMutation({
    mutationFn: hardDeleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old ? old.filter((task) => task.id !== id) : [],
      );

      return { previousTasks };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      toast.error('Failed to permanently delete task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task permanently deleted');
    },
  });

  const reorderTasksMutation = useMutation({
    mutationFn: reorderTasks,
    onMutate: async (taskOrders) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Optimistic update for reordering
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return [];
        const orderMap = new Map(taskOrders.map((t) => [t.id, t.displayOrder]));
        return old.map((task) => ({
          ...task,
          displayOrder: orderMap.get(task.id) ?? task.displayOrder,
        }));
      });

      return { previousTasks };
    },
    onError: (err, taskOrders, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      toast.error('Failed to reorder tasks');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const cloneTaskMutation = useMutation({
    mutationFn: cloneTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task cloned successfully');
    },
    onError: () => {
      toast.error('Failed to clone task');
    },
  });

  return {
    tasks: tasksQuery.data?.tasks ?? [],
    total: tasksQuery.data?.total ?? 0,
    page,
    setPage,
    limit,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    softDeleteTask: softDeleteTaskMutation.mutateAsync,
    hardDeleteTask: hardDeleteTaskMutation.mutateAsync,
    reorderTasks: reorderTasksMutation.mutateAsync,
    cloneTask: cloneTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: softDeleteTaskMutation.isPending,
    isHardDeleting: hardDeleteTaskMutation.isPending,
    isReordering: reorderTasksMutation.isPending,
    isCloning: cloneTaskMutation.isPending,
  };
}
