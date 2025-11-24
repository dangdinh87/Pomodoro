import { useState } from 'react'
import { Task, TaskStatus, useTasksStore } from '@/stores/task-store'
import { useTasks } from '@/hooks/use-tasks'
import { TaskFormSubmission } from './use-task-form'

export function useTaskActions() {
  const { createTask, updateTask, softDeleteTask, hardDeleteTask } = useTasks()
  const { setActiveTask, activeTaskId } = useTasksStore()
  const [isSaving, setIsSaving] = useState(false)

  const normalizeDescription = (value: string) => {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : undefined
  }

  const handleFormSubmit = async (editingId: string | null, payload: TaskFormSubmission) => {
    setIsSaving(true)
    try {
      if (editingId) {
        await updateTask({
          id: editingId,
          input: {
            title: payload.title,
            description: normalizeDescription(payload.description),
            priority: payload.priority,
            estimatePomodoros: payload.estimatePomodoros,
            tags: payload.tags,
          }
        })
      } else {
        await createTask({
          title: payload.title,
          description: normalizeDescription(payload.description),
          priority: payload.priority,
          estimatePomodoros: payload.estimatePomodoros,
          tags: payload.tags,
        })
      }
      return true
    } catch (error) {
      console.error('Task form submission error:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'pending' : 'done'
    try {
      await updateTask({ id: task.id, input: { status: nextStatus } })
    } catch (error) {
      console.error('Toggle status error:', error)
    }
  }

  const handleToggleActive = (task: Task) => {
    setActiveTask(task.id === activeTaskId ? null : task.id)
  }

  const handleSoftDelete = async (id: string) => {
    try {
      await softDeleteTask(id)
      return true
    } catch (error) {
      console.error('Soft delete error:', error)
      return false
    }
  }

  const handleHardDelete = async (id: string) => {
    try {
      await hardDeleteTask(id)
      return true
    } catch (error) {
      console.error('Hard delete error:', error)
      return false
    }
  }

  return {
    isSaving,
    handleFormSubmit,
    handleToggleStatus,
    handleToggleActive,
    handleSoftDelete,
    handleHardDelete,
    activeTaskId,
  }
}
