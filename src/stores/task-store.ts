import { create } from 'zustand';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  estimatePomodoros: number;
  actualPomodoros: number;
  timeSpentMs: number;
  status: TaskStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // New fields
  dueDate?: string | null;
  parentTaskId?: string | null;
  displayOrder: number;
  isTemplate: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  estimatePomodoros?: number;
  tags?: string[];
  dueDate?: string | null;
  parentTaskId?: string | null;
  isTemplate?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  estimatePomodoros?: number;
  tags?: string[];
  status?: TaskStatus;
  dueDate?: string | null;
  parentTaskId?: string | null;
  displayOrder?: number;
  isTemplate?: boolean;
}

export type TaskViewMode = 'list' | 'kanban' | 'table';

interface TasksState {
  activeTaskId: string | null;
  viewMode: TaskViewMode;
  setActiveTask: (id: string | null) => void;
  setViewMode: (mode: TaskViewMode) => void;
}

import { persist } from 'zustand/middleware';

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      activeTaskId: null,
      viewMode: 'table',
      setActiveTask: (id) => set({ activeTaskId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({
        activeTaskId: state.activeTaskId,
        viewMode: state.viewMode,
      }),
    },
  ),
);
