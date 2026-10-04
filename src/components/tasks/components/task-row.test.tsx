import { act, fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/contexts/i18n-context';
import type { Task } from '@/stores/task-store';
import { TaskRow } from './task-row';

const task: Task = {
  id: 't1',
  title: 'Write the report',
  priority: 'high',
  estimatePomodoros: 3,
  actualPomodoros: 1,
  timeSpentMs: 0,
  status: 'todo',
  tags: ['work'],
  createdAt: '2026-10-05T00:00:00.000Z',
  updatedAt: '2026-10-05T00:00:00.000Z',
  displayOrder: 0,
  isTemplate: false,
};

function setup(overrides: Partial<Task> = {}, onToggleStatus = vi.fn()) {
  const ui = (t: Task) => (
    <I18nProvider initialLang="en">
      <TaskRow
        task={t}
        isActive={false}
        onToggleStatus={onToggleStatus}
        onFocus={vi.fn()}
        onStopFocus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    </I18nProvider>
  );
  const view = render(ui({ ...task, ...overrides }));
  return { ...view, onToggleStatus, ui };
}

describe('TaskRow completing', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ticks and strikes the title first, then reports the completion after the bounce', async () => {
    const { onToggleStatus } = setup();
    fireEvent.click(screen.getByRole('checkbox', { name: /Mark complete/ }));

    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('heading', { name: 'Write the report' })).toHaveClass('line-through');
    expect(onToggleStatus).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(onToggleStatus).toHaveBeenCalledTimes(1);
    expect(onToggleStatus).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
  });

  it('un-ticks again when the update fails (status stays todo)', async () => {
    const onToggleStatus = vi.fn().mockResolvedValue(undefined);
    setup({}, onToggleStatus);
    fireEvent.click(screen.getByRole('checkbox'));
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('ignores a second click during the bounce', async () => {
    const { onToggleStatus } = setup();
    const box = screen.getByRole('checkbox');
    fireEvent.click(box);
    fireEvent.click(box);
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(onToggleStatus).toHaveBeenCalledTimes(1);
  });

  it('does not lose the completion when the row unmounts mid-bounce', () => {
    const { onToggleStatus, unmount } = setup();
    fireEvent.click(screen.getByRole('checkbox'));
    unmount();
    expect(onToggleStatus).toHaveBeenCalledTimes(1);
  });

  it('un-completing is immediate', () => {
    const { onToggleStatus } = setup({ status: 'done' });
    fireEvent.click(screen.getByRole('checkbox', { name: /Mark incomplete/ }));
    expect(onToggleStatus).toHaveBeenCalledTimes(1);
  });
});

describe('TaskRow badges', () => {
  it('shows priority (not for low) and tags as badges', () => {
    setup();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  it('hides the priority badge once done', () => {
    setup({ status: 'done' });
    expect(screen.queryByText('High')).not.toBeInTheDocument();
  });
});
