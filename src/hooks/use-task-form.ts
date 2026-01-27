import { useState, useEffect } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/stores/task-store'

export interface TaskFormSubmission {
  title: string
  description: string
  estimatePomodoros: number
  priority: TaskPriority
  status: TaskStatus
  tags: string[]
}

interface FormState {
  title: string
  description: string
  estimatePomodoros: number
  priority: TaskPriority
  status: TaskStatus
  tags: string
}

const defaultState: FormState = {
  title: '',
  description: '',
  estimatePomodoros: 1,
  priority: 'medium',
  status: 'todo',
  tags: '',
}

export function useTaskForm(editingTask: Task | null) {
  const [formState, setFormState] = useState<FormState>(defaultState)

  useEffect(() => {
    if (!editingTask) {
      setFormState(defaultState)
      return
    }

    setFormState({
      title: editingTask.title,
      description: editingTask.description ?? '',
      estimatePomodoros: editingTask.estimatePomodoros,
      priority: editingTask.priority,
      status: editingTask.status,
      tags: editingTask.tags.join(', '),
    })
  }, [editingTask])

  const updateField = <T extends keyof FormState>(field: T, value: FormState[T]) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const normalizeDescription = (value: string) => {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : undefined
  }

  const getSubmissionData = (): TaskFormSubmission => ({
    title: formState.title.trim(),
    description: formState.description.trim(),
    estimatePomodoros: Math.max(1, formState.estimatePomodoros),
    priority: formState.priority,
    status: formState.status,
    tags: formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  })

  const resetForm = () => {
    setFormState(defaultState)
  }

  const isValid = formState.title.trim().length > 0

  return {
    formState,
    updateField,
    getSubmissionData,
    resetForm,
    isValid,
  }
}
