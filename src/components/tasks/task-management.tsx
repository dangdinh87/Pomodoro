"use client"

import { useMemo, useRef, useState } from 'react'
import { useSessionRecorder } from '@/lib/timer/use-session-recorder'
import { closePanel } from '@/features/app-shell/panel-store'
import { isPast, isToday } from 'date-fns'
import { BookmarkSimple, CircleNotch, DotsThree, Tag } from '@phosphor-icons/react/dist/ssr'
import { Task, TaskPriority, TaskStatus, useTasksStore } from '@/stores/task-store'
import { useTasks } from '@/hooks/use-tasks'
import { useTags } from '@/hooks/use-tags'
import { useTemplates } from '@/hooks/use-templates'
import { useI18n } from '@/contexts/i18n-context'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterChip } from '@/components/ui/filter-chip'
import { PageHeader } from '@/components/ui/page-header'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TaskFilters, TaskScope } from './components/task-filters'
import { TaskFormModal } from './components/task-form-modal'
import { TaskKanbanBoard } from './components/task-kanban-board'
import { TaskListView } from './components/task-list-view'
import { TaskQuickAdd } from './components/task-quick-add'
import { TagManager } from './components/tag-manager'
import { TemplateManager } from './components/template-manager'

const TASK_QUERY = { limit: 100 }

function isDueToday(task: Task) {
  if (!task.dueDate) return false
  const due = new Date(task.dueDate)
  return isToday(due) || (task.status !== 'done' && isPast(due))
}

export function TaskManagement() {
  const userTags = useTags()
  const { tasks, total, page, setPage, limit, isLoading, createTask, updateTask, hardDeleteTask, reorderTasks, cloneTask, isCreating, isUpdating, isHardDeleting } =
    useTasks(TASK_QUERY)
  const { saveAsTemplate } = useTemplates()
  const { t } = useI18n()
  const { switchActiveTask } = useSessionRecorder()
  const { activeTaskId, viewMode, setViewMode } = useTasksStore()

  const [scope, setScope] = useState<TaskScope>('all')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [togglingTaskIds, setTogglingTaskIds] = useState<Set<string>>(new Set())
  const [manageDialog, setManageDialog] = useState<'tags' | 'templates' | null>(null)
  const quickAddRef = useRef<HTMLInputElement>(null)

  const isBoard = viewMode === 'kanban'
  const editingTask = useMemo(() => tasks.find((task) => task.id === editingId) ?? null, [editingId, tasks])
  const uniqueTags = useMemo(() => Array.from(new Set(tasks.flatMap((task) => task.tags))).sort(), [tasks])

  const counts = useMemo<Record<TaskScope, number>>(
    () => ({
      all: tasks.length,
      today: tasks.filter(isDueToday).length,
      todo: tasks.filter((task) => task.status === 'todo').length,
      doing: tasks.filter((task) => task.status === 'doing').length,
      done: tasks.filter((task) => task.status === 'done').length,
    }),
    [tasks],
  )

  const visibleTasks = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return tasks.filter((task) => {
      if (scope === 'today' ? !isDueToday(task) : scope !== 'all' && task.status !== scope) return false
      if (!needle) return true
      return task.title.toLowerCase().includes(needle) || task.tags.some((tag) => tag.toLowerCase().includes(needle))
    })
  }, [tasks, scope, query])

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'done' && activeTaskId === taskId) switchActiveTask(null)

    setTogglingTaskIds((prev) => new Set(prev).add(taskId))
    try {
      await updateTask({ id: taskId, input: { status: newStatus } })
    } catch {
      // the mutation already rolled back and showed the error toast
    } finally {
      setTogglingTaskIds((prev) => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }

  const handleToggleStatus = (task: Task) => handleUpdateStatus(task.id, task.status === 'done' ? 'todo' : 'done')

  const handleStopFocus = () => switchActiveTask(null)

  const handleFocus = (task: Task) => {
    if (activeTaskId !== task.id) {
      switchActiveTask(task.id)
      if (task.status === 'todo') void updateTask({ id: task.id, input: { status: 'doing' } }).catch(() => undefined)
    }
    closePanel()
  }

  const handleQuickAdd = async (input: { title: string; priority: TaskPriority; estimatePomodoros: number }) => {
    await createTask(input)
  }

  const handleFormSubmit = async (payload: any) => {
    try {
      if (editingId) {
        await updateTask({ id: editingId, input: payload })
        setEditingId(null)
      } else {
        await createTask(payload)
        setIsCreateOpen(false)
      }
    } catch {
      // surfaced by the mutation toast
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    try {
      if (deleteConfirmId === activeTaskId) switchActiveTask(null)
      await hardDeleteTask(deleteConfirmId)
      if (editingId === deleteConfirmId) setEditingId(null)
    } catch {
      // surfaced by the mutation toast
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const rowHandlers = {
    onToggleStatus: handleToggleStatus,
    onFocus: handleFocus,
    onStopFocus: handleStopFocus,
    onEdit: (task: Task) => setEditingId(task.id),
    onDelete: setDeleteConfirmId,
    onClone: (id: string) => void cloneTask(id).catch(() => undefined),
    onSaveAsTemplate: (id: string) => void saveAsTemplate(id).catch(() => undefined),
    togglingTaskIds,
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const isEmpty = !isLoading && tasks.length === 0
  const noMatches = !isLoading && tasks.length > 0 && visibleTasks.length === 0

  return (
    <>
      <PageHeader
        title={t('tasks.title')}
        description={tasks.length > 0 ? t('tasksUi.summary', { todo: counts.todo, doing: counts.doing, done: counts.done }) : undefined}
        actions={
          <>
            <div role="group" aria-label={t('tasksUi.viewLabel')} className="flex items-center gap-2">
              <FilterChip active={!isBoard} onClick={() => setViewMode('table')}>
                {t('tasksUi.viewList')}
              </FilterChip>
              <FilterChip active={isBoard} onClick={() => setViewMode('kanban')}>
                {t('tasksUi.viewBoard')}
              </FilterChip>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-ink-muted" aria-label={t('tasksUi.manage')}>
                  <DotsThree size={18} weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setManageDialog('tags')} className="cursor-pointer gap-2">
                  <Tag size={15} />
                  {t('tasks.manageTags')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setManageDialog('templates')} className="cursor-pointer gap-2">
                  <BookmarkSimple size={15} />
                  {t('tasks.templates.title')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="space-y-5">
        <TaskQuickAdd ref={quickAddRef} onCreate={handleQuickAdd} onOpenDetails={() => setIsCreateOpen(true)} />

        {isEmpty ? (
          <EmptyState
            title={t('tasksUi.emptyTitle')}
            description={t('tasksUi.emptyDescription')}
            action={
              <Button variant="secondary" onClick={() => quickAddRef.current?.focus()}>
                {t('tasksUi.emptyAction')}
              </Button>
            }
          />
        ) : (
          <>
            <TaskFilters scope={scope} counts={counts} query={query} onScopeChange={setScope} onQueryChange={setQuery} />

            {noMatches ? (
              <EmptyState
                title={t('tasksUi.noMatchTitle')}
                description={t('tasksUi.noMatchDescription')}
                className="min-h-[240px]"
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setScope('all')
                      setQuery('')
                    }}
                  >
                    {t('tasksUi.clearFilters')}
                  </Button>
                }
              />
            ) : isBoard ? (
              <TaskKanbanBoard
                tasks={visibleTasks}
                isLoading={isLoading}
                activeTaskId={activeTaskId}
                onReorder={reorderTasks}
                onUpdateStatus={handleUpdateStatus}
                {...rowHandlers}
              />
            ) : (
              <TaskListView
                tasks={visibleTasks}
                isLoading={isLoading}
                activeTaskId={activeTaskId}
                forceShowDone={scope === 'done' || query.trim().length > 0}
                {...rowHandlers}
              />
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1 || isLoading}>
                  {t('common.previous')}
                </Button>
                <span className="text-[0.8125rem] tabular-nums text-ink-muted">{t('tasksUi.page', { page, total: totalPages })}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages || isLoading}>
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <TagManager
        open={manageDialog === 'tags'}
        onOpenChange={(open) => !open && setManageDialog(null)}
        tags={userTags.tags}
        onAddTag={userTags.addTag}
        onRemoveTag={userTags.removeTag}
      />
      <TemplateManager open={manageDialog === 'templates'} onOpenChange={(open) => !open && setManageDialog(null)} />

      <TaskFormModal
        editingTask={editingTask}
        isOpen={!!editingId || isCreateOpen}
        isLoading={isCreating || isUpdating}
        onOpenChange={(open) => {
          if (open) return setIsCreateOpen(true)
          setIsCreateOpen(false)
          setEditingId(null)
        }}
        onSave={handleFormSubmit}
        availableTags={uniqueTags}
        userTags={userTags.tags}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tasks.confirmDelete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('tasks.confirmDelete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete} disabled={isHardDeleting} className="min-w-[100px]">
                {isHardDeleting ? <CircleNotch size={16} className="animate-spin" /> : t('tasks.confirmDelete.action')}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
