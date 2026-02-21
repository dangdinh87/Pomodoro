import { render, screen, fireEvent } from '@testing-library/react'
import { TaskItem } from './task-item'
import { Task } from '@/stores/task-store'

// Mock useI18n
jest.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  status: 'todo',
  priority: 'medium',
  estimatePomodoros: 2,
  actualPomodoros: 0,
  timeSpentMs: 0,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  displayOrder: 0,
  isTemplate: false,
}

describe('TaskItem', () => {
  it('renders task title', () => {
    render(
      <TaskItem
        task={mockTask}
        isActive={false}
        onToggleStatus={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        isToggling={false}
      />
    )
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('shows loading spinner when isToggling is true', () => {
    const { container } = render(
      <TaskItem
        task={mockTask}
        isActive={false}
        onToggleStatus={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        isToggling={true}
      />
    )
    // Loader2 has animate-spin class
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    // Checkbox should be disabled
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('does not show loading spinner when isToggling is false', () => {
    const { container } = render(
      <TaskItem
        task={mockTask}
        isActive={false}
        onToggleStatus={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        isToggling={false}
      />
    )
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeDisabled()
  })

  it('calls onToggleStatus when checkbox is clicked', () => {
    const onToggleStatus = jest.fn()
    render(
      <TaskItem
        task={mockTask}
        isActive={false}
        onToggleStatus={onToggleStatus}
        onEdit={() => {}}
        onDelete={() => {}}
        isToggling={false}
      />
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggleStatus).toHaveBeenCalledWith(mockTask)
  })
})
