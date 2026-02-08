"use client"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

import { useMemo, useState, useCallback } from 'react'
import { Task, useTasksStore, TaskStatus } from '@/stores/task-store'
import { TaskFilters } from './components/task-filters'
import { TaskFormModal } from './components/task-form-modal'
import { TaskList } from './components/task-list'
import { TaskKanbanBoard } from './components/task-kanban-board'
import { TaskTable } from './components/task-table'
import { TaskViewSwitcher } from './components/task-view-switcher'
import { TagManager } from './components/tag-manager'
import { useTaskFilters } from '@/hooks/use-task-filters'
import { useI18n } from '@/contexts/i18n-context'
import { useTasks } from '@/hooks/use-tasks'
import { useTags } from '@/hooks/use-tags'
import { useTemplates } from '@/hooks/use-templates'
import { Plus, Search, FilterX, AlertCircle, CheckCircle2, Clock, ListTodo, Bookmark, LayoutList, Loader2, Settings, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TemplateManager } from './components/template-manager'
import { useTimerStore } from '@/stores/timer-store'
import { useQueryClient } from '@tanstack/react-query'
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
  const taskFilters = useTaskFilters()
  const userTags = useTags()
  const {
    tasks,
    total,
    page,
    setPage,
    isLoading,
    createTask,
    updateTask,
    hardDeleteTask,
    reorderTasks,
    cloneTask,
    isCreating,
    isUpdating,
    isHardDeleting,
    isCloning,
  } = useTasks(taskFilters)

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const { t } = useI18n()

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

  const { activeTaskId, setActiveTask, viewMode } = useTasksStore()
  const { editingId, setEditingId, resetEditingState } = useEditingState()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { saveAsTemplate } = useTemplates()

  // Delete confirmation state

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [togglingTaskIds, setTogglingTaskIds] = useState<Set<string>>(new Set())

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
  const queryClient = useQueryClient()

  const handleToggleStatus = useCallback(async (task: Task) => {
    const isNowDone = task.status !== 'done'
    const newStatus: TaskStatus = isNowDone ? 'done' : 'todo'

    // Use getState() to avoid dependency on activeTaskId
    const currentActiveId = useTasksStore.getState().activeTaskId

    // Auto-unfocus logic
    if (isNowDone && currentActiveId === task.id) {
      // Record partial session before unfocusing for accuracy
      const { mode, timeLeft, lastSessionTimeLeft, setLastSessionTimeLeft } = useTimerStore.getState()
      if (mode === 'work') {
        const durationSec = Math.max(0, lastSessionTimeLeft - timeLeft)
        if (durationSec > 0) {
          try {
            await fetch('/api/tasks/session-complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                taskId: task.id,
                durationSec,
                mode: 'work',
              }),
            })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
          } catch (e) { console.error(e) }
        }
        // Reset baseline for the next task
        setLastSessionTimeLeft(timeLeft)
      }
      setActiveTask(null)
    }

    setTogglingTaskIds(prev => new Set(prev).add(task.id))
    try {
      await updateTask({ id: task.id, input: { status: newStatus } })
    } finally {
      setTogglingTaskIds(prev => {
        const next = new Set(prev)
        next.delete(task.id)
        return next
      })
    }
  }, [updateTask, queryClient, setActiveTask])

  const handleUpdateStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    const isNowDone = newStatus === 'done'
    const currentActiveId = useTasksStore.getState().activeTaskId

    if (isNowDone && currentActiveId === taskId) {
      const { mode, timeLeft, lastSessionTimeLeft, setLastSessionTimeLeft } = useTimerStore.getState()
      if (mode === 'work') {
        const durationSec = Math.max(0, lastSessionTimeLeft - timeLeft)
        if (durationSec > 0) {
          try {
            await fetch('/api/tasks/session-complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                taskId,
                durationSec,
                mode: 'work',
              }),
            })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
          } catch (e) { console.error(e) }
        }
        setLastSessionTimeLeft(timeLeft)
      }
      setActiveTask(null)
    }

    setTogglingTaskIds(prev => new Set(prev).add(taskId))
    try {
      await updateTask({ id: taskId, input: { status: newStatus } })
    } finally {
      setTogglingTaskIds(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }, [updateTask, queryClient, setActiveTask])

  // handleToggleActive is not passed to TaskTable, but used in Kanban
  // It also depends on activeTaskId, so we should use getState if we want it to be stable
  const handleToggleActive = useCallback((task: Task) => {
    const { timeLeft, setLastSessionTimeLeft } = useTimerStore.getState()
    const currentActiveId = useTasksStore.getState().activeTaskId

    if (currentActiveId === task.id) {
      // Recording when manual unfocus too for accuracy
      const { mode, lastSessionTimeLeft } = useTimerStore.getState()
      if (mode === 'work') {
        const durationSec = Math.max(0, lastSessionTimeLeft - timeLeft)
        if (durationSec > 0) {
          fetch('/api/tasks/session-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskId: task.id,
              durationSec,
              mode: 'work',
            }),
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
          }).catch(console.error)
        }
      }
      setActiveTask(null)
    } else {
      // Record time for the PREVIOUS active task if any
      if (currentActiveId) {
        const { mode, lastSessionTimeLeft } = useTimerStore.getState()
        if (mode === 'work') {
          const durationSec = Math.max(0, lastSessionTimeLeft - timeLeft)
          if (durationSec > 0) {
            fetch('/api/tasks/session-complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                taskId: currentActiveId,
                durationSec,
                mode: 'work',
              }),
            }).then(() => {
              queryClient.invalidateQueries({ queryKey: ['stats'] })
              queryClient.invalidateQueries({ queryKey: ['tasks'] })
            }).catch(console.error)
          }
        }
      }

      // Start new baseline for this task
      setLastSessionTimeLeft(timeLeft)
      setActiveTask(task.id)

      // If task is todo, move it to doing
      if (task.status === 'todo') {
        updateTask({ id: task.id, input: { status: 'doing' } })
      }
    }
  }, [updateTask, queryClient, setActiveTask])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setIsCreateModalOpen(false)
      resetEditingState()
    } else {
      setIsCreateModalOpen(true)
    }
  }, [resetEditingState])

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

  const handleClone = useCallback(async (taskId: string) => {
    try {
      await cloneTask(taskId)
    } catch (error) {
      // Error handled by hook
    }
  }, [cloneTask])

  const handleSaveAsTemplate = useCallback(async (taskId: string) => {
    try {
      await saveAsTemplate(taskId)
    } catch (error) {
      // Error handled by hook
    }
  }, [saveAsTemplate])

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>()
    tasks.forEach(task => task.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags).sort()
  }, [tasks])

  // Task statistics - use filteredTasks to match displayed content
  const taskStats = useMemo(() => {
    const todo = tasks.filter(t => t.status === 'todo').length
    const doing = tasks.filter(t => t.status === 'doing').length
    const done = tasks.filter(t => t.status === 'done').length
    return { todo, doing, done, total: tasks.length }
  }, [tasks])

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('tasks.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('tasks.subtitle')}
          </p>
        </div>

        {/* Status badges (left) + Actions (right) on same row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background shadow-sm transition-all duration-300">
              <div className="p-0.5 rounded-full bg-muted">
                <LayoutList className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="font-bold text-foreground">{taskStats.todo}</span>
              <span className="text-muted-foreground">{t('tasks.statuses.todo')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 shadow-sm transition-all duration-300">
              <div className="p-0.5 rounded-full bg-blue-500/20">
                <Clock className="h-3 w-3 text-blue-500" />
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400">{taskStats.doing}</span>
              <span className="text-blue-500 dark:text-blue-400">{t('tasks.statuses.doing')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 shadow-sm transition-all duration-300">
              <div className="p-0.5 rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{taskStats.done}</span>
              <span className="text-emerald-500 dark:text-emerald-400">{t('tasks.statuses.done')}</span>
            </div>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50 ml-1" />}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-md"
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold hidden sm:inline">{t('tasks.addTask')}</span>
              {isCreating && <Loader2 className="h-3 w-3 animate-spin" />}
            </Button>
            <TaskViewSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <TagManager
                  tags={userTags.tags}
                  onAddTag={userTags.addTag}
                  onRemoveTag={userTags.removeTag}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Tag className="h-4 w-4 mr-2" />
                      {t('tasks.manageTags')}
                    </DropdownMenuItem>
                  }
                />
                <TemplateManager
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      {t('tasks.templates.title')}
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
            <TaskFormModal
              editingTask={editingTask}
              isOpen={!!editingId || isCreateModalOpen}
              isLoading={isCreating || isUpdating}
              onOpenChange={handleOpenChange}
              onSave={handleFormSubmit}
              availableTags={uniqueTags}
              userTags={userTags.tags}
            />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <TaskFilters
          query={taskFilters.query}
          statusFilter={taskFilters.statusFilter}
          priorityFilter={taskFilters.priorityFilter}
          dateRange={taskFilters.dateRange}
          availableTags={uniqueTags}
          onQueryChange={taskFilters.setQuery}
          onStatusChange={taskFilters.setStatusFilter}
          onPriorityChange={taskFilters.setPriorityFilter}
          onDateRangeChange={taskFilters.setDateRange}
          onReload={() => { /* React Query handles caching, but we could invalidate here if needed */ }}
          onResetFilters={taskFilters.resetFilters}
        />

        {viewMode === 'kanban' ? (
          <TaskKanbanBoard
            tasks={tasks}
            isLoading={isLoading}
            activeTaskId={activeTaskId}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onClone={handleClone}
            onReorder={reorderTasks}
            onUpdateStatus={handleUpdateStatus}
            onSaveAsTemplate={handleSaveAsTemplate}
            togglingTaskIds={togglingTaskIds}
          />
        ) : (
          <TaskTable
            tasks={tasks}
            isLoading={isLoading}
            activeTaskId={activeTaskId}
            total={total}
            page={page}
            onPageChange={setPage}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onClone={handleClone}
            onSaveAsTemplate={handleSaveAsTemplate}
            togglingTaskIds={togglingTaskIds}
          />
        )}
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
