import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskManagement } from './task-management';

// Mock AnimatedCircularProgressBar
jest.mock('../ui/animated-circular-progress-bar', () => {
  return function MockAnimatedCircularProgressBar({ children, value, max }: { children: React.ReactNode, value: number, max: number }) {
    return (
      <div data-testid="circular-progress" data-value={value} data-max={max}>
        {children}
      </div>
    );
  };
});

describe('TaskManagement', () => {
  it('renders correctly', () => {
    render(<TaskManagement />);

    // Check for main title
    expect(screen.getByText('Task Management')).toBeInTheDocument();

    // Check for summary cards
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    expect(screen.getByText('Estimated')).toBeInTheDocument();

    // Check for initial projects (using getAllByText because "Learning" appears as a project and as a category)
    expect(screen.getAllByText('Web Development').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Learning').length).toBeGreaterThan(0);
  });

  it('calculates totals correctly', () => {
    render(<TaskManagement />);

    // Initial state:
    // Web Development: 2 tasks, 1 completed. Est: 7, Act: 5
    // Learning: 1 task, 0 completed. Est: 6, Act: 1
    // Total Tasks: 3
    // Total Completed: 1
    // Total Estimated: 13
    // Total Actual: 6

    // "1 of 3 tasks completed"
    expect(screen.getByText('1 of 3 tasks completed')).toBeInTheDocument();
  });

  it('allows adding a task', () => {
    render(<TaskManagement />);

    // Click Add Task button
    const addTaskButtons = screen.getAllByText('Add Task');
    fireEvent.click(addTaskButtons[0]); // The one in the header

    // Fill form
    const titleInput = screen.getByLabelText('Task Title');
    fireEvent.change(titleInput, { target: { value: 'New Test Task' } });

    const pomodorosInput = screen.getByLabelText('Estimated Pomodoros');
    fireEvent.change(pomodorosInput, { target: { value: '5' } });

    // Submit
    const submitButton = screen.getAllByText('Add Task')[1]; // The one in the modal/form
    fireEvent.click(submitButton);

    // Verify task is added
    expect(screen.getByText('New Test Task')).toBeInTheDocument();

    // Verify totals updated
    // "1 of 4 tasks completed"
    expect(screen.getByText('1 of 4 tasks completed')).toBeInTheDocument();
  });
});
