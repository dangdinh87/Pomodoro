"use client"

import { useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DroppableContainer,
  getFirstCollision,
} from '@dnd-kit/core'
import { Task, TaskStatus } from '@/stores/task-store'
import { TaskKanbanColumn } from './task-kanban-column'
import { TaskItem } from './task-item'
import { useTaskDnd } from '@/hooks/use-task-dnd'
import { Skeleton } from '@/components/ui/skeleton'

interface TaskKanbanBoardProps {
  tasks: Task[]
  isLoading: boolean
  activeTaskId: string | null
  onToggleStatus: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onClone?: (id: string) => void
  onReorder?: (taskOrders: { id: string; displayOrder: number }[]) => Promise<void>
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus) => Promise<void>
  onSaveAsTemplate?: (id: string) => void
  togglingTaskIds?: Set<string>
}

// Custom collision detection that handles both sortable items and droppable columns
const kanbanCollisionDetection: CollisionDetection = (args) => {
  // First check for pointer within droppable areas (columns)
  const pointerCollisions = pointerWithin(args)

  // If pointer is within a column, check if it's over a sortable item
  if (pointerCollisions.length > 0) {
    // Filter to get only column droppables (todo, doing, done)
    const columnIds = ['todo', 'doing', 'done']
    const columnCollision = pointerCollisions.find(c => columnIds.includes(c.id as string))

    // Get sortable item collisions
    const rectCollisions = rectIntersection(args)
    const sortableCollision = rectCollisions.find(c => !columnIds.includes(c.id as string))

    // If over a sortable item, return that for reordering
    if (sortableCollision) {
      return [sortableCollision]
    }

    // Otherwise return the column for cross-column move
    if (columnCollision) {
      return [columnCollision]
    }
  }

  // Fallback to rect intersection
  return rectIntersection(args)
}

export function TaskKanbanBoard({
  tasks,
  isLoading,
  activeTaskId,
  onToggleStatus,
  onEdit,
  onDelete,
  onClone,
  onReorder,
  onUpdateStatus,
  onSaveAsTemplate,
  togglingTaskIds,
}: TaskKanbanBoardProps) {
  const dndProps = useTaskDnd({
    tasks,
    onReorder: onReorder || (async () => { }),
    onUpdateStatus,
  })

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      doing: [],
      done: [],
    }

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })

    // Sort by displayOrder within each column
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => a.displayOrder - b.displayOrder)
    })

    return grouped
  }, [tasks])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const activeTask = tasks.find((task) => task.id === dndProps.activeId)

  return (
    <DndContext
      sensors={dndProps.sensors}
      collisionDetection={kanbanCollisionDetection}
      onDragStart={dndProps.handleDragStart}
      onDragEnd={dndProps.handleDragEnd}
      onDragCancel={dndProps.handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TaskKanbanColumn
          status="todo"
          tasks={tasksByStatus.todo}
          activeTaskId={activeTaskId}
          draggingTaskId={dndProps.activeId}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onClone={onClone}
          onSaveAsTemplate={onSaveAsTemplate}
          togglingTaskIds={togglingTaskIds}
        />
        <TaskKanbanColumn
          status="doing"
          tasks={tasksByStatus.doing}
          activeTaskId={activeTaskId}
          draggingTaskId={dndProps.activeId}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onClone={onClone}
          onSaveAsTemplate={onSaveAsTemplate}
          togglingTaskIds={togglingTaskIds}
        />
        <TaskKanbanColumn
          status="done"
          tasks={tasksByStatus.done}
          activeTaskId={activeTaskId}
          draggingTaskId={dndProps.activeId}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onClone={onClone}
          onSaveAsTemplate={onSaveAsTemplate}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 scale-105 rotate-2">
            <TaskItem
              task={activeTask}
              isActive={activeTaskId === activeTask.id}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
              onClone={onClone}
              onSaveAsTemplate={onSaveAsTemplate}
              togglingTaskIds={togglingTaskIds}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
