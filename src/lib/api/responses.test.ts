/** @vitest-environment node */
import { reportError } from '@/lib/observability/error-reporter';
import { serverError } from './responses';

vi.mock('@/lib/observability/error-reporter', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/observability/error-reporter')>()),
  reportError: vi.fn().mockResolvedValue(undefined),
}));

describe('serverError', () => {
  it('answers a generic 500 and never leaks the internal error', async () => {
    const res = serverError('Failed to create task', new Error('relation "tasks" does not exist'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to create task' });
  });

  it('reports the failure for error tracking, labelled with the handler message', () => {
    vi.mocked(reportError).mockClear();
    const error = Object.assign(new Error('connection reset'), { digest: 'dd' });
    serverError('Failed to fetch tasks', error);

    expect(reportError).toHaveBeenCalledTimes(1);
    expect(vi.mocked(reportError).mock.calls[0][0]).toMatchObject({
      source: 'server',
      message: 'Failed to fetch tasks: connection reset',
      digest: 'dd',
    });
  });
});
