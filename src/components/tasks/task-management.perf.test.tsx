import { render, act } from '@testing-library/react'
import { TaskManagement } from './task-management'
import React, { useState, useEffect } from 'react'

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}))

jest.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (k: string) => k }),
}))

jest.mock('@/hooks/use-tags', () => ({
  useTags: () => ({ tags: [], isLoading: false, addTag: jest.fn(), removeTag: jest.fn() }),
}))

jest.mock('@/hooks/use-task-filters', () => ({
  useTaskFilters: () => ({
    query: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    tagFilter: 'all',
    dateRange: undefined,
    setQuery: jest.fn(),
    setStatusFilter: jest.fn(),
    setPriorityFilter: jest.fn(),
    setTagFilter: jest.fn(),
    setDateRange: jest.fn(),
    resetFilters: jest.fn(),
  }),
  useFilteredTasks: (tasks: any) => tasks, // Return tasks as is
}))

const mockTasks = [
  { id: '1', title: 'Task 1', status: 'pending', priority: 'medium', tags: [], estimatePomodoros: 1, actualPomodoros: 0, timeSpentMs: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', title: 'Task 2', status: 'pending', priority: 'medium', tags: [], estimatePomodoros: 1, actualPomodoros: 0, timeSpentMs: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', title: 'Task 3', status: 'pending', priority: 'medium', tags: [], estimatePomodoros: 1, actualPomodoros: 0, timeSpentMs: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

const updateTaskMock = jest.fn()
const createTaskMock = jest.fn()
const hardDeleteTaskMock = jest.fn()

jest.mock('@/hooks/use-tasks', () => ({
  useTasks: () => ({
    tasks: mockTasks,
    isLoading: false,
    createTask: createTaskMock,
    updateTask: updateTaskMock,
    hardDeleteTask: hardDeleteTaskMock,
    isCreating: false,
    isUpdating: false,
    isHardDeleting: false,
  }),
}))

// Mock TaskItem to count renders
let renderCount = 0
jest.mock('./components/task-item', () => ({
  TaskItem: require('react').memo((props: any) => {
    renderCount++
    return (
      <div data-testid="task-item">
        {props.task.title}
        <button onClick={() => props.onToggleActive(props.task)}>Toggle Active</button>
      </div>
    )
  }),
}))

// Mock AnimatedList
jest.mock('@/components/ui/animated-list', () => ({
  AnimatedListItem: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/stores/task-store', () => {
    let state = { activeTaskId: null }
    const listeners = new Set<any>()

    const setActiveTask = (id: any) => {
        state = { ...state, activeTaskId: id }
        listeners.forEach(l => l(state))
    }

    const useTasksStore = () => {
      const [localState, setLocalState] = useState(state)
      useEffect(() => {
        const listener = (newState: any) => setLocalState(newState)
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      }, [])
      return {
        activeTaskId: localState.activeTaskId,
        setActiveTask
      }
    }
    useTasksStore.getState = () => state
    return { useTasksStore }
})

describe('TaskManagement Performance', () => {
  beforeEach(() => {
    renderCount = 0
    jest.clearAllMocks()
    // Reset store state if needed, but the mock re-initializes on file load?
    // Actually the mock factory runs once. But `render` runs in fresh component tree.
    // The `state` variable in mock factory persists across tests in same file.
    // So we might need to reset it.
    // But for this simple test, we just toggle.
    const { useTasksStore } = require('@/stores/task-store')
    useTasksStore.getState().activeTaskId = null
  })

  it('verifies render count of TaskItem', () => {
    const { getAllByText } = render(<TaskManagement />)

    expect(renderCount).toBe(3) // Initial render: 3 tasks

    renderCount = 0

    // Toggle active on first task
    act(() => {
        getAllByText('Toggle Active')[0].click()
    })

    // Unoptimized: 3 renders (all tasks re-render because props change)
    // Optimized: ?
    // If we only memoize TaskItem but handlers are unstable: 3 renders.
    // If we stabilize handlers and memoize TaskItem:
    // Task 1 (active changed): Re-render
    // Task 2 (active didn't change): No re-render
    // Task 3 (active didn't change): No re-render
    // So expected optimized count: 1.
    // Actually, if we switch from NO active task to ONE active task:
    // Task 1: isActive false -> true. Re-renders.
    // Task 2: isActive false -> false. No re-render.
    // Task 3: isActive false -> false. No re-render.
    // Count = 1.

    // If we switch from Task 1 active to Task 2 active:
    // Task 1: isActive true -> false. Re-render.
    // Task 2: isActive false -> true. Re-render.
    // Task 3: isActive false -> false. No re-render.
    // Count = 2.

    // Here we start with null, so count should be 1.

    // Expect only the affected task to re-render (1 instead of 3)
    expect(renderCount).toBe(1)
  })
})
