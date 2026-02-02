import { render, screen } from '@testing-library/react'
import { TaskTable } from './task-table'
import { Task } from '@/stores/task-store'

// Mock dependencies
jest.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key })
}))

// Mock TaskTableRow to avoid deep rendering and verify props
jest.mock('./task-table-row', () => ({
  TaskTableRow: jest.fn(({ task, isToggling, isActive }) => (
    <tr data-testid="mock-row" data-active={isActive ? 'true' : 'false'}>
      <td>{task.title}</td>
      <td>{isToggling ? 'toggling' : 'static'}</td>
    </tr>
  ))
}))

describe('TaskTable', () => {
  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'todo', priority: 'medium', tags: [], estimatePomodoros: 1, actualPomodoros: 0, timeSpentMs: 0, createdAt: '', updatedAt: '', displayOrder: 0, isTemplate: false },
    { id: '2', title: 'Task 2', status: 'todo', priority: 'medium', tags: [], estimatePomodoros: 1, actualPomodoros: 0, timeSpentMs: 0, createdAt: '', updatedAt: '', displayOrder: 0, isTemplate: false },
  ]

  it('passes isToggling and isActive correctly', () => {
    const togglingIds = new Set(['1'])
    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        activeTaskId={'2'} // Task 2 is active
        total={2}
        page={1}
        onPageChange={() => {}}
        onToggleStatus={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        togglingTaskIds={togglingIds}
      />
    )

    const rows = screen.getAllByTestId('mock-row')

    // Row 1: Toggling, Not Active
    expect(rows[0]).toHaveTextContent('Task 1')
    expect(rows[0]).toHaveTextContent('toggling')
    expect(rows[0]).toHaveAttribute('data-active', 'false')

    // Row 2: Static, Active
    expect(rows[1]).toHaveTextContent('Task 2')
    expect(rows[1]).toHaveTextContent('static')
    expect(rows[1]).toHaveAttribute('data-active', 'true')
  })
})
