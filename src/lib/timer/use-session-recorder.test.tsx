import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import type { MockInstance } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasksStore } from '@/stores/task-store';
import { useTimerStore } from '@/stores/timer-store';
import { recordSession } from './session-recorder';
import { useSessionRecorder } from './use-session-recorder';

vi.mock('./session-recorder', () => ({
  recordSession: vi.fn(),
  flushSessionQueue: vi.fn(),
}));

const payload = { taskId: 't1', durationSec: 60, mode: 'work' as const };

describe('useSessionRecorder', () => {
  let client: QueryClient;
  let invalidate: MockInstance<QueryClient['invalidateQueries']>;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.mocked(recordSession).mockReset();
    client = new QueryClient();
    invalidate = vi.spyOn(client, 'invalidateQueries');
  });

  it('refreshes stats, tasks and history (by key prefix) once the server accepted a session', () => {
    vi.mocked(recordSession).mockImplementation(async (_p, onRecorded) => {
      onRecorded?.();
      return 'recorded';
    });
    const { result } = renderHook(() => useSessionRecorder(), { wrapper });
    act(() => void result.current.record(payload));

    const keys = invalidate.mock.calls.map((call) => (call[0] as { queryKey: unknown[] }).queryKey);
    expect(keys).toEqual(expect.arrayContaining([['stats'], ['tasks'], ['history']]));
  });

  it('does not refresh anything while the session is only queued', () => {
    vi.mocked(recordSession).mockResolvedValue('queued');
    const { result } = renderHook(() => useSessionRecorder(), { wrapper });
    act(() => void result.current.record(payload));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('switchActiveTask records the previous segment through the same recorder', () => {
    vi.mocked(recordSession).mockResolvedValue('queued');
    useTasksStore.setState({ activeTaskId: 'A' } as never);
    useTimerStore.setState({ mode: 'work', timeLeft: 1000, lastSessionTimeLeft: 1500 });
    const { result } = renderHook(() => useSessionRecorder(), { wrapper });

    act(() => result.current.switchActiveTask('B'));

    expect(recordSession).toHaveBeenCalledWith(
      { taskId: 'A', durationSec: 500, mode: 'work', completedFullSession: false },
      expect.any(Function),
    );
    expect(useTasksStore.getState().activeTaskId).toBe('B');
  });
});
