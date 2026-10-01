"use client"

import { Task } from '@/stores/task-store'
import { TaskItem } from './task-item'
import { AnimatedListItem } from '@/components/ui/animated-list'
import { AnimatePresence } from 'motion/react'
import { CaretDown, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SubtaskListProps {
  parentTask: Task
  subtasks: Task[]
  activeTaskId: string | null
  onToggleStatus: (task: Task) => void
  onToggleActive: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onClone?: (id: string) => void
}

// Calculate subtask progress for a parent task
export function getSubtaskProgress(subtasks: Task[]) {
  if (subtasks.length === 0) return null
  const completed = subtasks.filter(t => t.status === 'done').length
  return { completed, total: subtasks.length }
}

export function SubtaskList({
  parentTask,
  subtasks,
  activeTaskId,
  onToggleStatus,
  onToggleActive,
  onEdit,
  onDelete,
  onClone,
}: SubtaskListProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const progress = getSubtaskProgress(subtasks)

  if (subtasks.length === 0) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors mb-2 ml-4"
      >
        {isExpanded ? (
          <CaretDown size={14} />
        ) : (
          <CaretRight size={14} />
        )}
        <span className="font-medium">
          Subtasks ({progress?.completed}/{progress?.total})
        </span>
      </button>

      <AnimatePresence mode="popLayout" initial={false}>
        {isExpanded && (
          <div className="ml-6 pl-4 border-l-2 border-border space-y-2">
            {subtasks.map((subtask) => (
              <AnimatedListItem key={subtask.id}>
                <div className={cn("transform scale-[0.95] origin-left")}>
                  <TaskItem
                    task={subtask}
                    isActive={activeTaskId === subtask.id}
                    onToggleStatus={onToggleStatus}
                    onToggleActive={onToggleActive}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClone={onClone}
                  />
                </div>
              </AnimatedListItem>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
