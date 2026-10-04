import { installMemoryStorage } from '@/test-utils/memory-storage';
import { useAuthStore } from '@/stores/auth-store';

vi.mock('@/lib/auth-client', () => ({ ensureSession: vi.fn() }));

const HOUR = 60 * 60 * 1000;
const payload = { taskId: 't1', durationSec: 1500, mode: 'work' as const };

/** Fresh module per test: the drop notice keeps a page-lifetime cooldown. */
async function load() {
  vi.resetModules();
  return import('./session-recorder');
}

describe('session outbox drop notice', () => {
  let mem: Map<string, string>;
  const item = (i: number, ageMs = 0) => ({
    id: `seed-${i}`,
    payload,
    userId: 'u1',
    queuedAt: Date.now() - ageMs,
    attempts: 0,
  });
  const seed = (items: unknown[]) => mem.set('session-record-queue', JSON.stringify(items));
  const queue = () => JSON.parse(mem.get('session-record-queue') ?? '[]');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_800_000_000_000);
    mem = installMemoryStorage().mem;
    global.fetch = vi.fn() as never;
    // Auth still loading: recording only queues, so these tests exercise the queue alone
    useAuthStore.setState({ user: null, isLoading: true });
  });
  afterEach(() => vi.useRealTimers());

  it('tells the user when a session is dropped for being older than 24 hours', async () => {
    const { recordSession, onSessionsDropped } = await load();
    const listener = vi.fn();
    onSessionsDropped(listener);
    seed([item(1, 25 * HOUR), item(2, 26 * HOUR), item(3, HOUR)]);

    await recordSession(payload);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(2);
    expect(queue().filter((q: { id: string }) => q.id.startsWith('seed')).map((q: { id: string }) => q.id)).toEqual(['seed-3']);
  });

  it('tells the user when the queue overflows and the oldest are pushed out', async () => {
    const { recordSession, onSessionsDropped } = await load();
    const listener = vi.fn();
    onSessionsDropped(listener);
    seed(Array.from({ length: 20 }, (_, i) => item(i, i * 1000)));

    await recordSession(payload); // the 21st

    expect(listener).toHaveBeenCalledWith(1);
    expect(queue()).toHaveLength(20);
  });

  it('stays quiet when nothing is lost', async () => {
    const { recordSession, onSessionsDropped } = await load();
    const listener = vi.fn();
    onSessionsDropped(listener);
    seed([item(1, HOUR)]);

    await recordSession(payload);

    expect(listener).not.toHaveBeenCalled();
  });

  it('does not repeat itself while the queue keeps overflowing', async () => {
    const { recordSession, onSessionsDropped } = await load();
    const listener = vi.fn();
    onSessionsDropped(listener);
    seed(Array.from({ length: 20 }, (_, i) => item(i)));

    await recordSession(payload);
    await recordSession(payload);
    await recordSession(payload);
    expect(listener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(11 * 60 * 1000); // later, it may speak again
    await recordSession(payload);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('delivers a drop that happened before anyone was listening', async () => {
    const { recordSession, onSessionsDropped } = await load();
    seed([item(1, 30 * HOUR)]);
    await recordSession(payload);

    const listener = vi.fn();
    onSessionsDropped(listener);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it('stops notifying after unsubscribe', async () => {
    const { recordSession, onSessionsDropped } = await load();
    const listener = vi.fn();
    onSessionsDropped(listener)();
    seed([item(1, 30 * HOUR)]);

    await recordSession(payload);
    expect(listener).not.toHaveBeenCalled();
  });
});
