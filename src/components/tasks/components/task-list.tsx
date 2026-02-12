"use client"

import { useMemo } from 'react'
import { Task } from '@/stores/task-store'
import { TaskItem } from './task-item'
import { AnimatedListItem } from '@/components/ui/animated-list'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { LayoutList, FilterX } from 'lucide-react'
import { useI18n } from '@/contexts/i18n-context'
import { AnimatePresence } from 'motion/react'
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTaskDnd } from '@/hooks/use-task-dnd'
import { SortableTaskItem } from './sortable-task-item'
import { SubtaskList, getSubtaskProgress } from './subtask-list'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  activeTaskId: string | null
  hasTasks: boolean
  onToggleStatus: (task: Task) => void
  onToggleActive: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onClone?: (id: string) => void
  onReorder?: (taskOrders: { id: string; displayOrder: number }[]) => Promise<void>
  onSaveAsTemplate?: (id: string) => void
}

// Group tasks into parent tasks and their subtasks
function useGroupedTasks(tasks: Task[]) {
  return useMemo(() => {
    const subtaskMap = new Map<string, Task[]>()
    const parentTasks: Task[] = []

    // First pass: separate parent tasks and subtasks
    tasks.forEach(task => {
      if (task.parentTaskId) {
        const existing = subtaskMap.get(task.parentTaskId) || []
        existing.push(task)
        subtaskMap.set(task.parentTaskId, existing)
      } else {
        parentTasks.push(task)
      }
    })

    // Sort subtasks by displayOrder
    subtaskMap.forEach((subtasks, parentId) => {
      subtasks.sort((a, b) => a.displayOrder - b.displayOrder)
    })

    return { parentTasks, subtaskMap }
  }, [tasks])
}

export function TaskList({
  tasks,
  isLoading,
  activeTaskId,
  hasTasks,
  onToggleStatus,
  onToggleActive,
  onEdit,
  onDelete,
  onClone,
  onReorder,
  onSaveAsTemplate,
}: TaskListProps) {
  const { t } = useI18n()

  const dndProps = useTaskDnd({
    tasks,
    onReorder: onReorder || (async () => {}),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title={t('tasks.noTasks')}
        description={t('tasks.noTasksDescription')}
        className="py-20 px-4 bg-muted/10 border border-dashed border-muted/50 rounded-2xl"
      />
    )
  }

  const taskIds = tasks.map((task) => task.id)
  const activeTask = tasks.find((task) => task.id === dndProps.activeId)

  return (
    <DndContext
      sensors={dndProps.sensors}
      collisionDetection={closestCenter}
      onDragStart={dndProps.handleDragStart}
      onDragEnd={dndProps.handleDragEnd}
      onDragCancel={dndProps.handleDragCancel}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {tasks.map((task) => (
              <AnimatedListItem key={task.id}>
                <SortableTaskItem
                  task={task}
                  isActive={activeTaskId === task.id}
                  isDragging={dndProps.activeId === task.id}
                  onToggleStatus={onToggleStatus}
                  onToggleActive={onToggleActive}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClone={onClone}
                  onSaveAsTemplate={onSaveAsTemplate}
                />
              </AnimatedListItem>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 scale-105">
            <TaskItem
              task={activeTask}
              isActive={activeTaskId === activeTask.id}
              onToggleStatus={onToggleStatus}
              onToggleActive={onToggleActive}
              onEdit={onEdit}
              onDelete={onDelete}
              onClone={onClone}
              onSaveAsTemplate={onSaveAsTemplate}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
