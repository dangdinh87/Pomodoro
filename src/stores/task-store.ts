import { create } from 'zustand'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'

export interface Task {
  id: string
  title: string
  description?: string | null
  priority: TaskPriority
  estimatePomodoros: number
  actualPomodoros: number
  timeSpentMs: number
  status: TaskStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  estimatePomodoros?: number
  tags?: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  priority?: TaskPriority
  estimatePomodoros?: number
  tags?: string[]
  status?: TaskStatus
}

interface TasksState {
  activeTaskId: string | null
  setActiveTask: (id: string | null) => void
}

import { persist } from 'zustand/middleware'

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      activeTaskId: null,
      setActiveTask: (id) => set({ activeTaskId: id }),
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ activeTaskId: state.activeTaskId }),
    }
  )
)



