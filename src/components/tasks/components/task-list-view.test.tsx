import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/contexts/i18n-context';
import type { Task, TaskStatus } from '@/stores/task-store';
import { TaskListView } from './task-list-view';

const CHEER = 'Nice work! Every task you finish counts.';

function makeTask(id: string, status: TaskStatus, displayOrder = 0): Task {
  return {
    id,
    title: `Task ${id}`,
    priority: 'low',
    estimatePomodoros: 1,
    actualPomodoros: 0,
    timeSpentMs: 0,
    status,
    tags: [],
    createdAt: '2026-10-05T00:00:00.000Z',
    updatedAt: '2026-10-05T00:00:00.000Z',
    displayOrder,
    isTemplate: false,
  };
}

const handlers = {
  onToggleStatus: vi.fn(),
  onFocus: vi.fn(),
  onStopFocus: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

function renderList(tasks: Task[], forceShowDone = false) {
  return render(
    <I18nProvider initialLang="en">
      <TaskListView tasks={tasks} isLoading={false} activeTaskId={null} forceShowDone={forceShowDone} {...handlers} />
    </I18nProvider>,
  );
}

describe('TaskListView completed group', () => {
  it('shows Tomo cheering after the completed tasks once the group is open', () => {
    renderList([makeTask('a', 'todo'), makeTask('b', 'done')]);
    expect(screen.queryByText(CHEER)).not.toBeInTheDocument(); // collapsed by default

    fireEvent.click(screen.getByRole('button', { name: 'Show 1 completed task' }));
    expect(screen.getByText('Task b')).toBeInTheDocument();
    expect(screen.getByText(CHEER)).toBeInTheDocument();
  });

  it('shows the cheer at once when the filter forces completed tasks visible', () => {
    renderList([makeTask('b', 'done'), makeTask('c', 'done', 1)], true);
    expect(screen.getAllByText(CHEER)).toHaveLength(1); // once per group, not per task
  });

  it('has no cheer when nothing is completed', () => {
    renderList([makeTask('a', 'todo'), makeTask('b', 'doing')], true);
    expect(screen.queryByText(CHEER)).not.toBeInTheDocument();
  });
});
