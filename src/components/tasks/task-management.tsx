"use client"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

import { useMemo, useState } from 'react'
import { Task, useTasksStore } from '@/stores/task-store'
import { TaskFilters } from './components/task-filters'
import { TaskFormModal } from './components/task-form-modal'
import { TaskList } from './components/task-list'
import { useTaskFilters, useFilteredTasks } from '@/hooks/use-task-filters'
import { useTasks } from '@/hooks/use-tasks'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function TaskManagement() {
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    hardDeleteTask,
  } = useTasks()

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  if (isAuthLoading) {
    return null // Or a loading spinner
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold text-center">Vui lòng đăng nhập để xem danh sách công việc</h2>
        <Button onClick={() => router.push('/login?redirect=/tasks')}>Đăng nhập</Button>
      </div>
    )
  }

  const { activeTaskId, setActiveTask } = useTasksStore()
  const { editingId, setEditingId, resetEditingState } = useEditingState()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const taskFilters = useTaskFilters()
  const filteredTasks = useFilteredTasks(tasks, taskFilters)

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const editingTask = useMemo(
    () => (editingId ? tasks.find((task) => task.id === editingId) ?? null : null),
    [editingId, tasks],
  )

  const handleFormSubmit = async (payload: any) => {
    try {
      if (editingId) {
        await updateTask({ id: editingId, input: payload })
        resetEditingState()
      } else {
        await createTask(payload)
        setIsCreateModalOpen(false)
      }
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    updateTask({ id: task.id, input: { status: newStatus } })
  }

  const handleToggleActive = (task: Task) => {
    if (activeTaskId === task.id) {
      setActiveTask(null)
    } else {
      setActiveTask(task.id)
      // If task is pending, move it to in_progress
      if (task.status === 'pending') {
        updateTask({ id: task.id, input: { status: 'in_progress' } })
      }
    }
  }

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return

    try {
      await hardDeleteTask(deleteConfirmId)

      if (editingId === deleteConfirmId) {
        resetEditingState()
      }
    } catch (error) {
      // Error handled by hook
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingId(task.id)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetEditingState()
      setIsCreateModalOpen(false)
    } else {
      setIsCreateModalOpen(true)
    }
  }

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>()
    tasks.forEach(task => task.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags).sort()
  }, [tasks])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks and track progress with Pomodoro technique
          </p>
        </div>
        <TaskFormModal
          editingTask={editingTask}
          isOpen={!!editingId || isCreateModalOpen}
          onOpenChange={handleOpenChange}
          onSave={handleFormSubmit}
          availableTags={uniqueTags}
        />
      </div>

      <section className="rounded-xl border bg-card/70 backdrop-blur p-4 md:p-6 space-y-4">
        <TaskFilters
          query={taskFilters.query}
          statusFilter={taskFilters.statusFilter}
          priorityFilter={taskFilters.priorityFilter}
          dateRange={taskFilters.dateRange}
          onQueryChange={taskFilters.setQuery}
          onStatusChange={taskFilters.setStatusFilter}
          onPriorityChange={taskFilters.setPriorityFilter}
          onDateRangeChange={taskFilters.setDateRange}
          onReload={() => { /* React Query handles caching, but we could invalidate here if needed */ }}
          onResetFilters={taskFilters.resetFilters}
        />

        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          activeTaskId={activeTaskId}
          onToggleStatus={handleToggleStatus}
          onToggleActive={handleToggleActive}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      </section>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function useEditingState() {
  const [editingId, setEditingId] = useState<string | null>(null)

  const resetEditingState = () => {
    setEditingId(null)
  }

  return {
    editingId,
    setEditingId,
    resetEditingState,
  }
}
