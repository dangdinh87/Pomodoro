import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useTasks } from './use-tasks';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const apiTask = (id: string, status = 'TODO') => ({
  id,
  title: `Task ${id}`,
  status,
  priority: 'MEDIUM',
  display_order: 0,
});

describe('useTasks optimistic updates', () => {
  let client: QueryClient;
  let fetchMock: jest.Mock;
  let patchResult: { ok: boolean; status?: number; json?: () => unknown };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'u1' } });
    client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    patchResult = { ok: true, json: () => ({ task: apiTask('a', 'DONE') }) };
    fetchMock = jest.fn((url: string, init?: { method?: string }) => {
      if (init?.method === 'PATCH' || init?.method === 'DELETE') {
        // Hold the response a tick so the optimistic state is observable
        return new Promise((r) => setTimeout(() => r(patchResult), 300));
      }
      return Promise.resolve({
        ok: true,
        json: () => ({
          tasks: [apiTask('a'), apiTask('b')],
          total: 2,
        }),
      });
    });
    global.fetch = fetchMock as never;
  });

  async function setup() {
    const hook = renderHook(() => useTasks({}), { wrapper });
    await waitFor(() => expect(hook.result.current.tasks).toHaveLength(2));
    return hook;
  }

  it('optimistically patches the paged list cache on update and keeps it on success', async () => {
    const { result } = await setup();
    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current.updateTask({ id: 'a', input: { status: 'done' } });
    });
    await waitFor(() =>
      expect(result.current.tasks.find((t) => t.id === 'a')?.status).toBe('done'),
    );
    await act(async () => {
      await promise;
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('rolls back every cached page when the update fails', async () => {
    patchResult = { ok: false, status: 500, json: () => ({}) };
    const { result } = await setup();
    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current
        .updateTask({ id: 'a', input: { status: 'done' } })
        .catch(() => undefined);
    });
    await waitFor(() =>
      expect(result.current.tasks.find((t) => t.id === 'a')?.status).toBe('done'),
    );
    await act(async () => {
      await promise;
    });
    await waitFor(() =>
      expect(result.current.tasks.find((t) => t.id === 'a')?.status).toBe('todo'),
    );
    expect(toast.error).toHaveBeenCalledWith('Failed to update task');
  });

  it('removes the task optimistically on soft delete and toasts only on success', async () => {
    patchResult = { ok: true, json: () => ({}) };
    const { result } = await setup();
    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current.softDeleteTask('a');
    });
    await waitFor(() => expect(result.current.tasks).toHaveLength(1));
    expect(toast.success).not.toHaveBeenCalled();
    await act(async () => {
      await promise;
    });
    expect(toast.success).toHaveBeenCalledWith('Task moved to trash');
  });

  it('does not show a success toast when delete fails and restores the list', async () => {
    patchResult = { ok: false, status: 500, json: () => ({}) };
    const { result } = await setup();
    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current.hardDeleteTask('a').catch(() => undefined);
    });
    await act(async () => {
      await promise;
    });
    await waitFor(() => expect(result.current.tasks).toHaveLength(2));
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Failed to permanently delete task');
  });

  it('decrements total optimistically on delete', async () => {
    patchResult = { ok: true, json: () => ({}) };
    const { result } = await setup();
    expect(result.current.total).toBe(2);
    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current.softDeleteTask('a');
    });
    await waitFor(() => expect(result.current.total).toBe(1));
    await act(async () => {
      await promise;
    });
  });

  it('does not refetch until the last pending optimistic mutation settles', async () => {
    const { result } = await setup();
    const listCalls = () =>
      fetchMock.mock.calls.filter(([, init]) => !init?.method).length;
    expect(listCalls()).toBe(1);

    let p1!: Promise<unknown>;
    let p2!: Promise<unknown>;
    act(() => {
      p1 = result.current.updateTask({ id: 'a', input: { status: 'done' } });
    });
    await new Promise((r) => setTimeout(r, 150));
    act(() => {
      p2 = result.current.updateTask({ id: 'b', input: { status: 'done' } });
    });
    await act(async () => {
      await p1; // first settles while the second is still pending
    });
    expect(listCalls()).toBe(1);
    expect(result.current.tasks.find((t) => t.id === 'b')?.status).toBe('done');

    await act(async () => {
      await p2;
    });
    await waitFor(() => expect(listCalls()).toBe(2));
  });
});
