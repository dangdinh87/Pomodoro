import { memo } from 'react'
import { Project } from '@/types/task'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar'
import { TaskItem } from './task-item'

interface ProjectCardProps {
  project: Project
  onToggleTask: (projectId: string, taskId: string) => void
  onDeleteTask: (projectId: string, taskId: string) => void
  onUpdateTaskPomodoros: (projectId: string, taskId: string, delta: number) => void
}

export const ProjectCard = memo(function ProjectCard({
  project,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskPomodoros
}: ProjectCardProps) {
  const completedTasksCount = project.tasks.filter(task => task.completed).length
  const totalTasksCount = project.tasks.length
  const percentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0

  return (
    <Card className="bg-background/30 backdrop-blur-md border-white/10 dark:bg-card/90 dark:border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between dark:text-card-foreground">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            {project.name}
            <Badge variant="outline" className="dark:border-border">
              {completedTasksCount}/{totalTasksCount}
            </Badge>
          </div>
          <AnimatedCircularProgressBar
            max={totalTasksCount || 1}
            value={completedTasksCount}
            gaugePrimaryColor={project.color}
            gaugeSecondaryColor="#e5e7eb"
            className="w-16 h-16"
          >
            <span className="text-xs font-medium">
              {percentage}%
            </span>
          </AnimatedCircularProgressBar>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4 dark:text-muted-foreground">
            No tasks in this project yet.
          </p>
        ) : (
          project.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectId={project.id}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onUpdatePomodoros={onUpdateTaskPomodoros}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
})
