export interface Task {
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

export interface Project {
  id: string
  name: string
  color: string
  tasks: Task[]
}
