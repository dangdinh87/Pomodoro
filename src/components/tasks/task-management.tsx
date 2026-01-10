"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar'
import {
  Plus,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  Circle,
  Calendar,
  Tag,
  Play,
  Pause
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  estimatedPomodoros: number
  actualPomodoros: number
  createdAt: string
  completedAt?: string
}

interface Project {
  id: string
  name: string
  color: string
  tasks: Task[]
}

const categories = [
  'Programming',
  'Design',
  'Writing',
  'Learning',
  'Business',
  'Personal',
  'Health',
  'Other'
]

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
}

export function TaskManagement() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Web Development',
      color: '#3b82f6',
      tasks: [
        {
          id: '1',
          title: 'Build Pomodoro Timer',
          description: 'Create a fully functional Pomodoro timer with settings',
          completed: false,
          priority: 'high',
          category: 'Programming',
          estimatedPomodoros: 4,
          actualPomodoros: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Design UI Components',
          description: 'Create reusable UI components for the app',
          completed: true,
          priority: 'medium',
          category: 'Design',
          estimatedPomodoros: 3,
          actualPomodoros: 3,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        }
      ]
    },
    {
      id: '2',
      name: 'Learning',
      color: '#10b981',
      tasks: [
        {
          id: '3',
          title: 'Study TypeScript Advanced',
          description: 'Learn advanced TypeScript patterns and concepts',
          completed: false,
          priority: 'medium',
          category: 'Learning',
          estimatedPomodoros: 6,
          actualPomodoros: 1,
          createdAt: new Date().toISOString()
        }
      ]
    }
  ])

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newTaskCategory, setNewTaskCategory] = useState('Programming')
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1)
  const [selectedProject, setSelectedProject] = useState('1')
  const [showAddTask, setShowAddTask] = useState(false)

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        completed: false,
        priority: newTaskPriority,
        category: newTaskCategory,
        estimatedPomodoros: newTaskPomodoros,
        actualPomodoros: 0,
        createdAt: new Date().toISOString()
      }

      setProjects(prev => prev.map(project => 
        project.id === selectedProject 
          ? { ...project, tasks: [...project.tasks, newTask] }
          : project
      ))

      // Reset form
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskPriority('medium')
      setNewTaskCategory('Programming')
      setNewTaskPomodoros(1)
      setShowAddTask(false)
    }
  }

  const toggleTaskComplete = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task =>
              task.id === taskId
                ? {
                    ...task,
                    completed: !task.completed,
                    completedAt: !task.completed ? new Date().toISOString() : undefined
                  }
                : task
            )
          }
        : project
    ))
  }

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, tasks: project.tasks.filter(task => task.id !== taskId) }
        : project
    ))
  }

  const updateTaskPomodoros = (projectId: string, taskId: string, increment: number) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task =>
              task.id === taskId
                ? { ...task, actualPomodoros: Math.max(0, task.actualPomodoros + increment) }
                : task
            )
          }
        : project
    ))
  }

  // Optimize performance by memoizing these calculations
  // This prevents recalculating totals on every render (e.g. when typing in input fields)
  // Only recalculate when projects array changes
  const totalTasks = useMemo(() => {
    return projects.reduce((acc, project) => acc + project.tasks.length, 0)
  }, [projects])

  const completedTasks = useMemo(() => {
    return projects.reduce((acc, project) => 
      acc + project.tasks.filter(task => task.completed).length, 0
    )
  }, [projects])

  const totalEstimatedPomodoros = useMemo(() => {
    return projects.reduce((acc, project) => 
      acc + project.tasks.reduce((taskAcc, task) => taskAcc + task.estimatedPomodoros, 0), 0
    )
  }, [projects])

  const totalActualPomodoros = useMemo(() => {
    return projects.reduce((acc, project) => 
      acc + project.tasks.reduce((taskAcc, task) => taskAcc + task.actualPomodoros, 0), 0
    )
  }, [projects])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold dark:text-foreground">Task Management</h2>
        <Button onClick={() => setShowAddTask(!showAddTask)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="bg-background/30 backdrop-blur-md border-white/10 dark:bg-card/90 dark:border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold dark:text-card-foreground">Overall Progress</h3>
              <p className="text-sm text-muted-foreground mt-1 dark:text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AnimatedCircularProgressBar
                max={totalTasks || 1}
                value={completedTasks}
                gaugePrimaryColor="#10b981"
                gaugeSecondaryColor="#e5e7eb"
                className="w-20 h-20"
              >
                <span className="text-sm font-medium">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </AnimatedCircularProgressBar>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-background/30 backdrop-blur-md border-white/10 dark:bg-card/90 dark:border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold dark:text-card-foreground">{totalTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/30 backdrop-blur-md border-white/10 dark:bg-card/90 dark:border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold dark:text-card-foreground">{completedTasks}</p>
              </div>
              <Circle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/30 backdrop-blur-md border-white/10 dark:bg-card/90 dark:border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Estimated</p>
                <p className="text-2xl font-bold dark:text-card-foreground">{totalEstimatedPomodoros}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/30 backdrop-blur-md border-white/10 dark:bg-card/90 dark:border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold dark:text-card-foreground">{totalActualPomodoros}</p>
              </div>
              <Play className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <Card className="bg-background/30 backdrop-blur-md border-white/10 dark:bg-card/90 dark:border-border">
          <CardHeader>
            <CardTitle className="dark:text-card-foreground">Add New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  placeholder="Enter task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-project">Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="dark:bg-surface dark:border-border">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-card dark:border-border">
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description (optional)</Label>
              <Input
                id="task-description"
                placeholder="Enter task description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-category">Category</Label>
                <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                  <SelectTrigger className="dark:bg-surface dark:border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-card dark:border-border">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={newTaskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}>
                  <SelectTrigger className="dark:bg-surface dark:border-border">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-card dark:border-border">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-pomodoros">Estimated Pomodoros</Label>
                <Input
                  id="task-pomodoros"
                  type="number"
                  min="1"
                  max="20"
                  value={newTaskPomodoros}
                  onChange={(e) => setNewTaskPomodoros(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
              <Button onClick={addTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks by Project */}
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.id} className="bg-background/30 backdrop-blur-md border-white/10 dark:bg-card/90 dark:border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between dark:text-card-foreground">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                  <Badge variant="outline" className="dark:border-border">
                    {project.tasks.filter(task => task.completed).length}/{project.tasks.length}
                  </Badge>
                </div>
                <AnimatedCircularProgressBar
                  max={project.tasks.length || 1}
                  value={project.tasks.filter(task => task.completed).length}
                  gaugePrimaryColor={project.color}
                  gaugeSecondaryColor="#e5e7eb"
                  className="w-16 h-16"
                >
                  <span className="text-xs font-medium">
                    {project.tasks.length > 0 ? Math.round((project.tasks.filter(task => task.completed).length / project.tasks.length) * 100) : 0}%
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
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-border">
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(project.id, task.id)}
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
                          onClick={() => updateTaskPomodoros(project.id, task.id, -1)}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {task.actualPomodoros}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskPomodoros(project.id, task.id, 1)}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTask(project.id, task.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}