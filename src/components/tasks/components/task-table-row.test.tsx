import { render, screen, fireEvent } from '@testing-library/react'
import { TaskTableRow } from './task-table-row'
import { Task } from '@/stores/task-store'

// Mock dependencies
jest.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

// Mock UI components to avoid rendering complexity
jest.mock('@/components/ui/table', () => ({
  TableRow: ({ children, className }: any) => <tr className={className}>{children}</tr>,
  TableCell: ({ children, className }: any) => <td className={className}>{children}</td>,
}))
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}))
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input type="checkbox" checked={checked} onChange={() => onCheckedChange(!checked)} data-testid="checkbox" />
  ),
}))
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}))
jest.mock('@/components/ui/animated-icons', () => ({
  AnimatedEdit: () => <span>EditIcon</span>,
  AnimatedTrash: () => <span>TrashIcon</span>,
}))
jest.mock('lucide-react', () => ({
  Copy: () => <span>CopyIcon</span>,
  Bookmark: () => <span>BookmarkIcon</span>,
  Loader2: () => <span>LoaderIcon</span>,
  MoreHorizontal: () => <span>MoreIcon</span>,
}))
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
}))
jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}))

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  priority: 'medium',
  estimatePomodoros: 2,
  actualPomodoros: 0,
  timeSpentMs: 0,
  status: 'todo',
  tags: ['tag1'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  displayOrder: 1,
  isTemplate: false,
}

describe('TaskTableRow', () => {
  it('renders task details correctly', () => {
    render(
      <table>
        <tbody>
          <TaskTableRow
            task={mockTask}
            indexNumber={1}
            isActive={false}
            isToggling={false}
            onToggleStatus={jest.fn()}
            onEdit={jest.fn()}
            onDelete={jest.fn()}
          />
        </tbody>
      </table>
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('tasks.priorityLevels.medium')).toBeInTheDocument()
    expect(screen.getByText('tag1')).toBeInTheDocument()
  })

  it('calls onToggleStatus when checkbox is clicked', () => {
    const onToggleStatus = jest.fn()
    render(
      <table>
        <tbody>
          <TaskTableRow
            task={mockTask}
            indexNumber={1}
            isActive={false}
            isToggling={false}
            onToggleStatus={onToggleStatus}
            onEdit={jest.fn()}
            onDelete={jest.fn()}
          />
        </tbody>
      </table>
    )

    fireEvent.click(screen.getByTestId('checkbox'))
    expect(onToggleStatus).toHaveBeenCalledWith(mockTask)
  })
})
