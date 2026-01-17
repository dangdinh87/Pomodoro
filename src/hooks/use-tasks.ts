import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Task, CreateTaskInput, UpdateTaskInput, TaskPriority, TaskStatus } from '@/stores/task-store'
import { toast } from 'sonner'

// Helper functions to map API data
function mapPriorityToApi(priority: TaskPriority | undefined) {
    if (!priority) return undefined
    return priority.toUpperCase()
}

function mapPriorityFromApi(priority: string): TaskPriority {
    const lowered = priority.toLowerCase()
    if (lowered === 'low' || lowered === 'medium' || lowered === 'high') {
        return lowered
    }
    return 'medium'
}

function mapStatusFromApi(status: string): TaskStatus {
    const lowered = status.toLowerCase()
    if (lowered === 'pending' || lowered === 'in_progress' || lowered === 'done') {
        return lowered
    }
    return 'pending'
}

function mapTaskFromApi(raw: any): Task {
    const now = new Date().toISOString()
    return {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        priority: mapPriorityFromApi(raw.priority),
        estimatePomodoros: raw.estimatedPomodoros ?? raw.estimate_pomodoros ?? 1,
        actualPomodoros: raw.actualPomodoros ?? raw.actual_pomodoros ?? 0,
        timeSpentMs: raw.timeSpentMs ?? raw.time_spent ?? 0,
        status: mapStatusFromApi(raw.status ?? 'PENDING'),
        tags: raw.tags ?? [],
        createdAt: raw.createdAt ?? raw.created_at ?? now,
        updatedAt: raw.updatedAt ?? raw.updated_at ?? now,
    }
}

// API functions
async function fetchTasks(): Promise<Task[]> {
    const res = await fetch('/api/tasks')
    if (!res.ok) throw new Error('Failed to fetch tasks')
    const data = await res.json()
    return (data.tasks ?? []).map(mapTaskFromApi)
}

async function createTask(input: CreateTaskInput): Promise<Task> {
    const body = {
        title: input.title,
        description: input.description,
        priority: mapPriorityToApi(input.priority) ?? 'MEDIUM',
        estimate_pomodoros: input.estimatePomodoros ?? 1,
        tags: input.tags ?? [],
    }

    const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData.details || errorData.error || 'Failed to create task'
        console.error('Failed to create task:', {
            status: res.status,
            statusText: res.statusText,
            error: errorData,
        })
        throw new Error(errorMessage)
    }
    const data = await res.json()
    return mapTaskFromApi(data.task)
}

async function updateTask({ id, input }: { id: string; input: UpdateTaskInput }): Promise<Task> {
    const body: any = {
        title: input.title,
        description: input.description,
        priority: mapPriorityToApi(input.priority),
        estimate_pomodoros: input.estimatePomodoros,
        tags: input.tags,
        status: input.status?.toUpperCase(),
    }

    Object.keys(body).forEach((key) => {
        if (body[key] === undefined) delete body[key]
    })

    const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error('Failed to update task')
    const data = await res.json()
    return mapTaskFromApi(data.task)
}

async function softDeleteTask(id: string): Promise<void> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete task')
}

async function hardDeleteTask(id: string): Promise<void> {
    const res = await fetch(`/api/tasks/${id}?hard=true`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to permanently delete task')
}

export function useTasks() {
    const queryClient = useQueryClient()

    const tasksQuery = useQuery({
        queryKey: ['tasks'],
        queryFn: fetchTasks,
    })

    const createTaskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Task created successfully')
        },
        onError: (error) => {
            toast.error('Failed to create task')
            console.error(error)
        },
    })

    const updateTaskMutation = useMutation({
        mutationFn: updateTask,
        onMutate: async ({ id, input }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

            queryClient.setQueryData<Task[]>(['tasks'], (old) => {
                if (!old) return []
                return old.map((task) => {
                    if (task.id === id) {
                        return {
                            ...task,
                            ...input,
                            // Handle partial updates for nested/complex types if needed
                            priority: input.priority ?? task.priority,
                            status: input.status ?? task.status,
                            updatedAt: new Date().toISOString(), // Optimistic update timestamp
                        } as Task
                    }
                    return task
                })
            })

            return { previousTasks }
        },
        onError: (err, newTodo, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks)
            }
            toast.error('Failed to update task')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })

    const softDeleteTaskMutation = useMutation({
        mutationFn: softDeleteTask,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

            queryClient.setQueryData<Task[]>(['tasks'], (old) =>
                old ? old.filter((task) => task.id !== id) : []
            )

            return { previousTasks }
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['tasks'], context?.previousTasks)
            toast.error('Failed to delete task')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Task moved to trash')
        },
    })

    const hardDeleteTaskMutation = useMutation({
        mutationFn: hardDeleteTask,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

            queryClient.setQueryData<Task[]>(['tasks'], (old) =>
                old ? old.filter((task) => task.id !== id) : []
            )

            return { previousTasks }
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['tasks'], context?.previousTasks)
            toast.error('Failed to permanently delete task')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Task permanently deleted')
        },
    })

    return {
        tasks: tasksQuery.data ?? [],
        isLoading: tasksQuery.isLoading,
        isError: tasksQuery.isError,
        error: tasksQuery.error,
        createTask: createTaskMutation.mutateAsync,
        updateTask: updateTaskMutation.mutateAsync,
        softDeleteTask: softDeleteTaskMutation.mutateAsync,
        hardDeleteTask: hardDeleteTaskMutation.mutateAsync,
        isCreating: createTaskMutation.isPending,
        isUpdating: updateTaskMutation.isPending,
        isDeleting: softDeleteTaskMutation.isPending,
        isHardDeleting: hardDeleteTaskMutation.isPending,
    }
}
