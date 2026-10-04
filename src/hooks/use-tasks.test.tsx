import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { ensureSession } from '@/lib/auth-client';
import { I18nProvider } from '@/test-utils/i18n';
import { TooManyRequestsError } from '@/lib/api/too-many-requests-error';
import en from '@/i18n/locales/en.json';
import { useTasks } from './use-tasks';

vi.mock('@/lib/auth-client', () => ({ ensureSession: vi.fn() }));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
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
  let fetchMock: ReturnType<typeof vi.fn>;
  let patchResult: { ok: boolean; status?: number; json?: () => unknown };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider initialLang="en">
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </I18nProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: { id: 'u1', isAnonymous: false } });
    client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    patchResult = { ok: true, json: () => ({ task: apiTask('a', 'DONE') }) };
    fetchMock = vi.fn((url: string, init?: { method?: string }) => {
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
    await waitFor(() => expect(hook.result.current.tasks).toHaveLength(2), { timeout: 5000 });
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
    expect(toast.error).toHaveBeenCalledWith(en.tasksUi.errors.updateFailed);
  });

  it('removes the task optimistically on soft delete without a success toast', async () => {
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
    // The row vanishing is the feedback; a toast for a routine delete is noise
    expect(toast.success).not.toHaveBeenCalled();
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
    expect(toast.error).toHaveBeenCalledWith(en.tasksUi.errors.deleteFailed);
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

  describe('creating a task under rate limits', () => {
    const create = async () => {
      const { result } = await setup();
      await act(async () => {
        await result.current.createTask({ title: 'new' }).catch(() => undefined);
      });
    };

    it('shows the specific toast when the tasks API answers 429', async () => {
      const list = fetchMock.getMockImplementation() as (url: string, init?: { method?: string }) => unknown;
      fetchMock.mockImplementation((url: string, init?: { method?: string }) =>
        init?.method === 'POST'
          ? Promise.resolve({ ok: false, status: 429, json: () => ({}) })
          : list(url, init),
      );
      await create();
      expect(toast.error).toHaveBeenCalledWith(en.errors.tooManyRequests);
      expect(toast.error).not.toHaveBeenCalledWith(en.tasksUi.errors.createFailed);
    });

    it('tells the user about the task limit when the API answers 409', async () => {
      const list = fetchMock.getMockImplementation() as (url: string, init?: { method?: string }) => unknown;
      fetchMock.mockImplementation((url: string, init?: { method?: string }) =>
        init?.method === 'POST'
          ? Promise.resolve({ ok: false, status: 409, json: () => Promise.resolve({ code: 'TASK_LIMIT_REACHED', max: 2000 }) })
          : list(url, init),
      );
      await create();
      expect(toast.error).toHaveBeenCalledWith(en.tasksUi.errors.limitReached.replace('{max}', '2000'));
      expect(toast.error).not.toHaveBeenCalledWith(en.tasksUi.errors.createFailed);
    });

    it('does the same when duplicating a task hits the limit', async () => {
      const list = fetchMock.getMockImplementation() as (url: string, init?: { method?: string }) => unknown;
      fetchMock.mockImplementation((url: string, init?: { method?: string }) =>
        init?.method === 'POST'
          ? Promise.resolve({ ok: false, status: 409, json: () => Promise.resolve({ code: 'TASK_LIMIT_REACHED', max: 2000 }) })
          : list(url, init),
      );
      const { result } = await setup();
      await act(async () => {
        await result.current.cloneTask('a').catch(() => undefined);
      });
      expect(toast.error).toHaveBeenCalledWith(en.tasksUi.errors.limitReached.replace('{max}', '2000'));
    });

    it('shows the specific toast when the guest sign-in is rate limited', async () => {
      vi.mocked(ensureSession).mockRejectedValueOnce(new TooManyRequestsError());
      await create();
      expect(toast.error).toHaveBeenCalledWith(en.errors.tooManyRequests);
    });

    it('keeps the generic toast for other failures', async () => {
      const list = fetchMock.getMockImplementation() as (url: string, init?: { method?: string }) => unknown;
      fetchMock.mockImplementation((url: string, init?: { method?: string }) =>
        init?.method === 'POST'
          ? Promise.resolve({ ok: false, status: 500, statusText: '', json: () => ({}) })
          : list(url, init),
      );
      await create();
      expect(toast.error).toHaveBeenCalledWith(en.tasksUi.errors.createFailed);
    });

    it('stays quiet when the task is created, the new row is the feedback', async () => {
      const list = fetchMock.getMockImplementation() as (url: string, init?: { method?: string }) => unknown;
      fetchMock.mockImplementation((url: string, init?: { method?: string }) =>
        init?.method === 'POST'
          ? Promise.resolve({ ok: true, status: 201, json: () => ({ task: apiTask('c') }) })
          : list(url, init),
      );
      await create();
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  it('toasts translated errors for reorder and clone failures and nothing on clone success', async () => {
    const list = fetchMock.getMockImplementation() as (url: string, init?: { method?: string }) => unknown;
    let ok = false;
    fetchMock.mockImplementation((url: string, init?: { method?: string }) =>
      init?.method === 'POST'
        ? Promise.resolve({ ok, status: ok ? 201 : 500, json: () => ({ task: apiTask('c') }) })
        : list(url, init),
    );
    const { result } = await setup();

    await act(async () => {
      await result.current.cloneTask('a').catch(() => undefined);
      await result.current.reorderTasks([{ id: 'a', displayOrder: 1 }]).catch(() => undefined);
    });
    expect(toast.error).toHaveBeenCalledWith(en.tasksUi.errors.cloneFailed);
    expect(toast.error).toHaveBeenCalledWith(en.tasksUi.errors.reorderFailed);

    ok = true;
    await act(async () => {
      await result.current.cloneTask('a');
    });
    expect(toast.success).not.toHaveBeenCalled();
  });
});
