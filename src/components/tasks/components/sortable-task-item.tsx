"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/stores/task-store'
import { TaskItem } from './task-item'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableTaskItemProps {
  task: Task
  isActive: boolean
  isDragging?: boolean
  onToggleStatus: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onClone?: (id: string) => void
  onSaveAsTemplate?: (id: string) => void
  onToggleActive?: (task: Task) => void
  isToggling?: boolean
}

export function SortableTaskItem({
  task,
  isActive,
  isDragging,
  onToggleStatus,
  onEdit,
  onDelete,
  onClone,
  onSaveAsTemplate,
  onToggleActive,
  isToggling,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        (isDragging || isSortableDragging) && 'opacity-50 z-50'
      )}
    >
      <div className="relative group/drag">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-10',
            'opacity-0 group-hover/drag:opacity-100 transition-opacity',
            'p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing',
            'touch-none' // Prevent touch scrolling on drag handle
          )}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <TaskItem
          task={task}
          isActive={isActive}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onClone={onClone}
          onSaveAsTemplate={onSaveAsTemplate}
          onToggleActive={onToggleActive}
          isToggling={isToggling}
        />
      </div>
    </div>
  )
}
