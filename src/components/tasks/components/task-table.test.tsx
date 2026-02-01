import React from 'react'
import { render } from '@testing-library/react'
import { TaskTable } from './task-table'
import { Task } from '@/stores/task-store'

// Mock dependencies
jest.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

// Mock UI components to avoid rendering complexity
jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
}))

// Mock TaskTableRow to track renders
const MockTaskTableRow = jest.fn(({ task, isToggling }) => (
  <tr data-testid={`row-${task.id}`}>
    <td>{task.title}</td>
    <td>{isToggling ? 'toggling' : 'stable'}</td>
  </tr>
))

jest.mock('./task-table-row', () => ({
  TaskTableRow: (props: any) => MockTaskTableRow(props),
}))

describe('TaskTable Optimization', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      status: 'todo',
      priority: 'medium',
      tags: [],
      estimatePomodoros: 1,
      actualPomodoros: 0,
      timeSpentMs: 0,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      dueDate: null,
      parentTaskId: null,
      displayOrder: 0,
      isTemplate: false,
    },
    {
      id: '2',
      title: 'Task 2',
      status: 'todo',
      priority: 'medium',
      tags: [],
      estimatePomodoros: 1,
      actualPomodoros: 0,
      timeSpentMs: 0,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      dueDate: null,
      parentTaskId: null,
      displayOrder: 0,
      isTemplate: false,
    },
  ]

  it('only re-renders the toggled row when togglingTaskIds changes', () => {
    const onPageChange = jest.fn()
    const onToggleStatus = jest.fn()
    const onEdit = jest.fn()
    const onDelete = jest.fn()

    // Initial render
    const { rerender } = render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        activeTaskId={null}
        total={2}
        page={1}
        onPageChange={onPageChange}
        onToggleStatus={onToggleStatus}
        onEdit={onEdit}
        onDelete={onDelete}
        togglingTaskIds={new Set()}
      />
    )

    // Capture props from first render
    const task2CallsInitial = MockTaskTableRow.mock.calls.filter((call: any) => call[0].task.id === '2')
    const task2PropsInitial = task2CallsInitial[task2CallsInitial.length - 1][0]

    // Clear initial render calls to keep things clean (optional)
    MockTaskTableRow.mockClear()

    // Re-render with Task 1 toggling
    const togglingSet = new Set(['1'])
    rerender(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        activeTaskId={null}
        total={2}
        page={1}
        onPageChange={onPageChange}
        onToggleStatus={onToggleStatus}
        onEdit={onEdit}
        onDelete={onDelete}
        togglingTaskIds={togglingSet}
      />
    )

    // Filter calls by task ID
    const callsForTask1 = MockTaskTableRow.mock.calls.filter((call: any) => call[0].task.id === '1')
    const callsForTask2 = MockTaskTableRow.mock.calls.filter((call: any) => call[0].task.id === '2')

    // Task 1 should receive new props because isToggling changed
    expect(callsForTask1.length).toBe(1)
    expect(callsForTask1[0][0].isToggling).toBe(true)

    // Task 2 should receive props identical to the first render
    // Since our mock is NOT memoized, it DOES get called. We verify props stability here.
    expect(callsForTask2.length).toBe(1)

    const task2PropsSecond = callsForTask2[0][0]

    // Check referential equality for objects/functions where expected, or value equality
    expect(task2PropsSecond.task).toBe(task2PropsInitial.task) // Same reference
    expect(task2PropsSecond.rowNumber).toBe(task2PropsInitial.rowNumber)
    expect(task2PropsSecond.isToggling).toBe(task2PropsInitial.isToggling) // false === false
    expect(task2PropsSecond.isActive).toBe(task2PropsInitial.isActive)

    // Handlers should be stable (mock fns)
    expect(task2PropsSecond.onToggleStatus).toBe(task2PropsInitial.onToggleStatus)
  })
})
