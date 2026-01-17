"use client"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

import { useMemo, useState, useCallback } from 'react'
import { Task, useTasksStore } from '@/stores/task-store'
import { TaskFilters } from './components/task-filters'
import { TaskFormModal } from './components/task-form-modal'
import { TaskList } from './components/task-list'
import { TagManager } from './components/tag-manager'
import { useTaskFilters, useFilteredTasks } from '@/hooks/use-task-filters'
import { useI18n } from '@/contexts/i18n-context'
import { useTasks } from '@/hooks/use-tasks'
import { useTags } from '@/hooks/use-tags'
import { Plus, Search, FilterX, AlertCircle } from 'lucide-react'
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
    isCreating,
    isUpdating,
    isHardDeleting,
  } = useTasks()

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const { t } = useI18n()

  const { activeTaskId, setActiveTask } = useTasksStore()
  const { editingId, setEditingId, resetEditingState } = useEditingState()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const taskFilters = useTaskFilters()
  const userTags = useTags()
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

  const handleToggleStatus = useCallback((task: Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    updateTask({ id: task.id, input: { status: newStatus } })
  }, [updateTask])

  const handleToggleActive = useCallback((task: Task) => {
    // Read directly from store to avoid dependency on activeTaskId causing re-renders
    const currentActiveId = useTasksStore.getState().activeTaskId
    const setActiveTask = useTasksStore.getState().setActiveTask

    if (currentActiveId === task.id) {
      setActiveTask(null)
    } else {
      setActiveTask(task.id)
      // If task is pending, move it to in_progress
      if (task.status === 'pending') {
        updateTask({ id: task.id, input: { status: 'in_progress' } })
      }
    }
  }, [updateTask])

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteConfirmId(id)
  }, [])

  const confirmDelete = async () => {
    if (!deleteConfirmId) return

    try {
      // If deleting the active task, reset active state
      if (deleteConfirmId === activeTaskId) {
        setActiveTask(null)
      }

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

  const handleEdit = useCallback((task: Task) => {
    setEditingId(task.id)
  }, [setEditingId])

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

  if (isAuthLoading) {
    return null // Or a loading spinner
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold text-center">{t('auth.signInToManageTasks')}</h2>
        <Button onClick={() => router.push('/login?redirect=/tasks')}>{t('auth.signInButton')}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('tasks.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('tasks.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TagManager
            tags={userTags.tags}
            isLoading={userTags.isLoading}
            onAddTag={userTags.addTag}
            onRemoveTag={userTags.removeTag}
          />
          <Button onClick={() => setIsCreateModalOpen(true)} className="h-10 px-4 gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tasks.addTask')}</span>
          </Button>
          <TaskFormModal
            editingTask={editingTask}
            isOpen={!!editingId || isCreateModalOpen}
            onOpenChange={handleOpenChange}
            onSave={handleFormSubmit}
            availableTags={uniqueTags}
            userTags={userTags.tags}
          />
        </div>
      </div>

      <section className="space-y-4">
        <TaskFilters
          query={taskFilters.query}
          statusFilter={taskFilters.statusFilter}
          priorityFilter={taskFilters.priorityFilter}
          tagFilter={taskFilters.tagFilter}
          dateRange={taskFilters.dateRange}
          availableTags={uniqueTags}
          onQueryChange={taskFilters.setQuery}
          onStatusChange={taskFilters.setStatusFilter}
          onPriorityChange={taskFilters.setPriorityFilter}
          onTagChange={taskFilters.setTagFilter}
          onDateRangeChange={taskFilters.setDateRange}
          onReload={() => { /* React Query handles caching, but we could invalidate here if needed */ }}
          onResetFilters={taskFilters.resetFilters}
        />

        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          activeTaskId={activeTaskId}
          hasTasks={tasks.length > 0}
          onToggleStatus={handleToggleStatus}
          onToggleActive={handleToggleActive}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      </section>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tasks.confirmDelete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tasks.confirmDelete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isHardDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[100px]"
            >
              {isHardDeleting ? (
                <>
                  <Plus className="mr-2 h-4 w-4 animate-spin rotate-45" />
                  {t('tasks.actions.deleting')}
                </>
              ) : (
                t('tasks.confirmDelete.action')
              )}
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
