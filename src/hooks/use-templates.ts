import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Task, TaskPriority } from '@/stores/task-store'
import { toast } from 'sonner'

export interface TaskTemplate {
  id: string
  title: string
  description: string | null
  priority: TaskPriority
  estimatePomodoros: number
  tags: string[]
}

function mapTemplateFromApi(raw: any): TaskTemplate {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    priority: (raw.priority?.toLowerCase() ?? 'medium') as TaskPriority,
    estimatePomodoros: raw.estimate_pomodoros ?? 1,
    tags: raw.tags ?? [],
  }
}

async function fetchTemplates(): Promise<TaskTemplate[]> {
  const res = await fetch('/api/tasks/templates')
  if (!res.ok) return []
  const data = await res.json()
  return (data.templates ?? []).map(mapTemplateFromApi)
}

async function saveAsTemplate(taskId: string): Promise<void> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_template: true }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.details || data.error || 'Failed to save as template')
  }
}

async function removeTemplate(taskId: string): Promise<void> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_template: false }),
  })
  if (!res.ok) throw new Error('Failed to remove template')
}

export function useTemplates() {
  const queryClient = useQueryClient()

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  })

  const saveAsTemplateMutation = useMutation({
    mutationFn: saveAsTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task saved as template')
    },
    onError: () => {
      toast.error('Failed to save as template')
    },
  })

  const removeTemplateMutation = useMutation({
    mutationFn: removeTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Template removed')
    },
    onError: () => {
      toast.error('Failed to remove template')
    },
  })

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    saveAsTemplate: saveAsTemplateMutation.mutateAsync,
    removeTemplate: removeTemplateMutation.mutateAsync,
    isSaving: saveAsTemplateMutation.isPending,
  }
}
