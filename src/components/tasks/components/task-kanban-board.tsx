"use client"

import { useMemo } from 'react'
import { DndContext, DragOverlay, pointerWithin, rectIntersection, CollisionDetection } from '@dnd-kit/core'
import { Task, TaskStatus } from '@/stores/task-store'
import { TaskKanbanColumn } from './task-kanban-column'
import { TaskRow, TaskRowHandlers } from './task-row'
import { useTaskDnd } from '@/hooks/use-task-dnd'
import { Skeleton } from '@/components/ui/skeleton'

interface TaskKanbanBoardProps extends TaskRowHandlers {
  tasks: Task[]
  isLoading: boolean
  activeTaskId: string | null
  onReorder: (taskOrders: { id: string; displayOrder: number }[]) => Promise<void>
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>
}

const STATUSES: TaskStatus[] = ['todo', 'doing', 'done']

// Sortable cards win over the lane itself so within-lane reorder and cross-lane drops both resolve.
const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)

  if (pointerCollisions.length > 0) {
    const columnCollision = pointerCollisions.find((c) => STATUSES.includes(c.id as TaskStatus))
    const sortableCollision = rectIntersection(args).find((c) => !STATUSES.includes(c.id as TaskStatus))

    if (sortableCollision) return [sortableCollision]
    if (columnCollision) return [columnCollision]
  }

  return rectIntersection(args)
}

export function TaskKanbanBoard({
  tasks,
  isLoading,
  activeTaskId,
  onReorder,
  onUpdateStatus,
  ...handlers
}: TaskKanbanBoardProps) {
  const dnd = useTaskDnd({ tasks, onReorder, onUpdateStatus })

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] }
    tasks.forEach((task) => grouped[task.status]?.push(task))
    STATUSES.forEach((status) => grouped[status].sort((a, b) => a.displayOrder - b.displayOrder))
    return grouped
  }, [tasks])

  if (isLoading && tasks.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUSES.map((status) => (
          <Skeleton key={status} className="h-[240px] w-full rounded-[20px]" />
        ))}
      </div>
    )
  }

  const draggedTask = tasks.find((task) => task.id === dnd.activeId)

  return (
    <DndContext
      sensors={dnd.sensors}
      collisionDetection={kanbanCollisionDetection}
      onDragStart={dnd.handleDragStart}
      onDragEnd={dnd.handleDragEnd}
      onDragCancel={dnd.handleDragCancel}
    >
      {/* p-1/-m-1 + pr-2/pb-2: the lanes' hard shadows (4px) must not be clipped by the scroll box */}
      <div className="-m-1 flex scroll-pl-1 snap-x snap-mandatory items-stretch gap-3.5 overflow-x-auto p-1 pb-2 pr-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-1 md:pr-1">
        {STATUSES.map((status) => (
          <TaskKanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            activeTaskId={activeTaskId}
            draggingTaskId={dnd.activeId}
            {...handlers}
          />
        ))}
      </div>

      <DragOverlay>
        {draggedTask ? (
          <TaskRow task={draggedTask} isActive={activeTaskId === draggedTask.id} variant="card" {...handlers} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
