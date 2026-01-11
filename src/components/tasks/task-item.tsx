import { memo } from 'react'
import { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  Clock,
  Calendar,
  Tag,
  Play,
  Pause
} from 'lucide-react'

interface TaskItemProps {
  task: Task
  projectId: string
  onToggle: (projectId: string, taskId: string) => void
  onDelete: (projectId: string, taskId: string) => void
  onUpdatePomodoros: (projectId: string, taskId: string, delta: number) => void
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
}

export const TaskItem = memo(function TaskItem({
  task,
  projectId,
  onToggle,
  onDelete,
  onUpdatePomodoros
}: TaskItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-border">
      <div className="flex items-center space-x-3 flex-1">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(projectId, task.id)}
        />
        <div className="flex-1">
          <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''} dark:text-card-foreground`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 dark:text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs dark:border-border">
              <Tag className="h-3 w-3 mr-1" />
              {task.category}
            </Badge>
            <Badge className={`text-xs ${priorityColors[task.priority]}`}>
              {task.priority}
            </Badge>
            <Badge variant="outline" className="text-xs dark:border-border">
              <Clock className="h-3 w-3 mr-1" />
              {task.actualPomodoros}/{task.estimatedPomodoros}
            </Badge>
            <Badge variant="outline" className="text-xs dark:border-border">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(task.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdatePomodoros(projectId, task.id, -1)}
          >
            <Pause className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-8 text-center">
            {task.actualPomodoros}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdatePomodoros(projectId, task.id, 1)}
          >
            <Play className="h-3 w-3" />
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(projectId, task.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
})
