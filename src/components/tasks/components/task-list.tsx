import { Task } from '@/stores/task-store'
import { TaskItem } from './task-item'
import { ClipboardList, Loader2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { AnimatedListItem } from '@/components/ui/animated-list'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  activeTaskId: string | null
  onToggleStatus: (task: Task) => void
  onToggleActive: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskList({
  tasks,
  isLoading,
  activeTaskId,
  onToggleStatus,
  onToggleActive,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading tasks...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center border-2 border-dashed rounded-xl bg-muted/10">
        <div className="p-4 rounded-full bg-muted/30">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">No tasks found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            You don't have any tasks yet. Create one to get started with your focus session.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <AnimatedListItem key={task.id}>
            <TaskItem
              task={task}
              isActive={activeTaskId === task.id}
              onToggleStatus={onToggleStatus}
              onToggleActive={onToggleActive}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  )
}
