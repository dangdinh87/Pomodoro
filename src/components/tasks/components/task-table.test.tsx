import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TaskTable } from './task-table'
import { Task } from '@/stores/task-store'

// Mock I18nContext
jest.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

// Mock UI components that might cause issues in JSDOM
jest.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ checked, onCheckedChange, disabled }: any) => (
        <input
            type="checkbox"
            checked={checked}
            onChange={() => onCheckedChange(!checked)}
            disabled={disabled}
            data-testid="checkbox"
        />
    )
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
}))

const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    priority: 'high',
    estimatePomodoros: 2,
    actualPomodoros: 1,
    timeSpentMs: 0,
    status: 'todo',
    tags: ['tag1'],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    displayOrder: 0,
    isTemplate: false,
}

describe('TaskTable', () => {
    it('renders tasks correctly', () => {
        render(
            <TaskTable
                tasks={[mockTask]}
                isLoading={false}
                activeTaskId={null}
                total={1}
                page={1}
                onPageChange={jest.fn()}
                onToggleStatus={jest.fn()}
                onEdit={jest.fn()}
                onDelete={jest.fn()}
            />
        )
        expect(screen.getByText('Test Task')).toBeInTheDocument()
    })

    it('calls onToggleStatus when checkbox is clicked', () => {
        const onToggleStatus = jest.fn()
        render(
            <TaskTable
                tasks={[mockTask]}
                isLoading={false}
                activeTaskId={null}
                total={1}
                page={1}
                onPageChange={jest.fn()}
                onToggleStatus={onToggleStatus}
                onEdit={jest.fn()}
                onDelete={jest.fn()}
            />
        )

        fireEvent.click(screen.getByTestId('checkbox'))
        expect(onToggleStatus).toHaveBeenCalledWith(mockTask)
    })
})
