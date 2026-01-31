/** @jest-environment jsdom */
import React from 'react'
import { render } from '@testing-library/react'
import { TaskTable } from './task-table'
import { TaskTableRow } from './task-table-row'
import { Task } from '@/stores/task-store'

// Mock dependencies
jest.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

jest.mock('./task-table-row', () => {
  const React = require('react')
  const mockFn = jest.fn(({ task }) => <tr data-testid="task-row"><td>{task.title}</td></tr>)
  const MockComp = React.memo(mockFn)
  // Attach mock to component
  // @ts-ignore
  MockComp.mockImpl = mockFn
  return {
    TaskTableRow: MockComp,
  }
})

// Mock UI components
jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>,
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div />,
}))

const mockTask = (id: string, title: string): Task => ({
  id,
  title,
  status: 'todo',
  priority: 'medium',
  tags: [],
  estimatePomodoros: 1,
  actualPomodoros: 0,
  timeSpentMs: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  dueDate: null,
  parentTaskId: null,
  displayOrder: 0,
  isTemplate: false,
})

describe('TaskTable Optimization', () => {
  beforeEach(() => {
     const mockFn = (TaskTableRow as any).mockImpl
     if (mockFn) mockFn.mockClear()
  })

  it('does not re-render unaffected rows when one row is toggled', () => {
    const tasks = [
      mockTask('1', 'Task 1'),
      mockTask('2', 'Task 2'),
      mockTask('3', 'Task 3'),
    ]

    const props = {
      tasks,
      isLoading: false,
      activeTaskId: null,
      total: 3,
      page: 1,
      onPageChange: jest.fn(),
      onToggleStatus: jest.fn(),
      onEdit: jest.fn(),
      onDelete: jest.fn(),
      togglingTaskIds: new Set<string>(), // Initially empty
    }

    const { rerender } = render(<TaskTable {...props} />)

    const mockFn = (TaskTableRow as any).mockImpl

    // Initial render
    expect(mockFn).toHaveBeenCalledTimes(3)

    mockFn.mockClear()

    // Re-render with one task toggling
    const newToggling = new Set<string>()
    newToggling.add('2')

    rerender(<TaskTable {...props} togglingTaskIds={newToggling} />)

    // Expect 1 call (Task 2)
    expect(mockFn).toHaveBeenCalledTimes(1)

    // Check WHICH task
    const callArgs = mockFn.mock.calls[0][0]
    expect(callArgs.task.id).toBe('2')
    expect(callArgs.isToggling).toBe(true)
  })

  it('does not re-render rows if parent re-renders with no changes', () => {
    const tasks = [
        mockTask('1', 'Task 1'),
        mockTask('2', 'Task 2'),
    ]

    const props = {
        tasks,
        isLoading: false,
        activeTaskId: null,
        total: 2,
        page: 1,
        onPageChange: jest.fn(),
        onToggleStatus: jest.fn(),
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        togglingTaskIds: new Set<string>(),
    }

    const { rerender } = render(<TaskTable {...props} />)

    const mockFn = (TaskTableRow as any).mockImpl

    expect(mockFn).toHaveBeenCalledTimes(2)
    mockFn.mockClear()

    // Rerender with SAME props
    rerender(<TaskTable {...props} />)

    // Should be 0 calls
    expect(mockFn).toHaveBeenCalledTimes(0)
  })
})
