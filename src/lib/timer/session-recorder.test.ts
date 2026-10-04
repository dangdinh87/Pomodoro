import { installMemoryStorage } from '@/test-utils/memory-storage';
import { useAuthStore } from '@/stores/auth-store';
import { ensureSession } from '@/lib/auth-client';
import {
  recordSession,
  flushSessionQueue,
  normalizeDuration,
  shouldFlushOnAuthChange,
} from './session-recorder';

vi.mock('@/lib/auth-client', () => ({ ensureSession: vi.fn() }));
const ensureSessionMock = vi.mocked(ensureSession);

const payload = { taskId: 't1', durationSec: 1500, mode: 'work' as const };
const res = (status: number) => ({ ok: status >= 200 && status < 300, status });

describe('session-recorder', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let mem: Map<string, string>;

  beforeEach(() => {
    mem = installMemoryStorage().mem;
    fetchMock = vi.fn();
    global.fetch = fetchMock as never;
    ensureSessionMock.mockReset();
    useAuthStore.setState({ user: { id: 'u1', isAnonymous: false }, isLoading: false });
  });

  const queue = () => JSON.parse(mem.get('session-record-queue') ?? '[]');
  const seedItem = (over: Record<string, unknown> = {}) => {
    const item = {
      id: `seed-${Math.random()}`,
      payload,
      userId: 'u1',
      queuedAt: Date.now(),
      attempts: 0,
      ...over,
    };
    mem.set('session-record-queue', JSON.stringify([...queue(), item]));
    return item;
  };

  it('normalizes durations to integer 1..14400', () => {
    expect(normalizeDuration(10.6)).toBe(11);
    expect(normalizeDuration(-5)).toBe(0);
    expect(normalizeDuration(NaN)).toBe(0);
    expect(normalizeDuration(99999)).toBe(14400);
  });

  it('enqueues first, posts with keepalive, removes on ack, then calls onRecorded', async () => {
    let queuedDuringSend = 0;
    fetchMock.mockImplementation(async () => {
      queuedDuringSend = queue().length;
      return res(200);
    });
    const onRecorded = vi.fn();
    await expect(recordSession(payload, onRecorded)).resolves.toBe('recorded');
    expect(queuedDuringSend).toBe(1); // outbox: persisted before the request
    expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      taskId: 't1',
      durationSec: 1500,
      mode: 'work',
    });
    expect(queue()).toHaveLength(0);
    expect(onRecorded).toHaveBeenCalledTimes(1);
  });

  describe('guest without a session', () => {
    beforeEach(() => {
      useAuthStore.setState({ user: null, isLoading: false });
    });

    it('signs in anonymously once, then posts and reports recorded', async () => {
      ensureSessionMock.mockResolvedValue({ id: 'guest-1', isAnonymous: true });
      fetchMock.mockResolvedValue(res(200));
      const onRecorded = vi.fn();

      await expect(recordSession(payload, onRecorded)).resolves.toBe('recorded');

      expect(ensureSessionMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(queue()).toHaveLength(0);
      expect(onRecorded).toHaveBeenCalledTimes(1);
    });

    it('shares one sign-in between sessions recorded at the same time', async () => {
      let resolveSignIn: (u: { id: string; isAnonymous: boolean }) => void = () => {};
      ensureSessionMock.mockReturnValue(
        new Promise((r) => {
          resolveSignIn = r;
        }),
      );
      fetchMock.mockResolvedValue(res(200));

      const first = recordSession(payload);
      const second = recordSession({ ...payload, durationSec: 60 });
      resolveSignIn({ id: 'guest-1', isAnonymous: true });

      await expect(Promise.all([first, second])).resolves.toEqual(['recorded', 'recorded']);
      expect(ensureSessionMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('keeps the session queued (never drops it) when anonymous sign-in fails', async () => {
      ensureSessionMock.mockRejectedValue(new Error('429'));

      await expect(recordSession(payload)).resolves.toBe('queued');

      expect(fetchMock).not.toHaveBeenCalled();
      expect(queue()).toHaveLength(1);
      expect(queue()[0].userId).toBeNull();
      expect(queue()[0].sendingAt).toBeUndefined();
    });

    it('a later flush signs in again and delivers the queued session', async () => {
      ensureSessionMock.mockRejectedValueOnce(new Error('429'));
      await recordSession(payload);

      ensureSessionMock.mockResolvedValue({ id: 'guest-1', isAnonymous: true });
      useAuthStore.setState({ user: { id: 'guest-1', isAnonymous: true }, isLoading: false });
      fetchMock.mockResolvedValue(res(200));
      await flushSessionQueue();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(queue()).toHaveLength(0);
    });

    it('flush creates the guest session itself when nothing is signed in yet', async () => {
      seedItem({ id: 'orphan', userId: null });
      ensureSessionMock.mockResolvedValue({ id: 'guest-1', isAnonymous: true });
      fetchMock.mockResolvedValue(res(200));

      await flushSessionQueue();

      expect(ensureSessionMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(queue()).toHaveLength(0);
    });

    it('flush never creates a guest just because stale items of other users exist', async () => {
      seedItem({ id: 'theirs', userId: 'other' });
      await flushSessionQueue();
      expect(ensureSessionMock).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(queue()).toHaveLength(1);
    });

    it('flush keeps null-owner items when the sign-in still fails', async () => {
      seedItem({ id: 'orphan', userId: null });
      ensureSessionMock.mockRejectedValue(new Error('429'));
      await flushSessionQueue();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(queue()).toHaveLength(1);
    });
  });

  it('queues (not skips) while auth is loading, then flushes once the user is known', async () => {
    useAuthStore.setState({ user: null, isLoading: true });
    await expect(recordSession(payload)).resolves.toBe('queued');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(queue()[0].userId).toBeNull();

    useAuthStore.setState({ user: { id: 'u2', isAnonymous: false }, isLoading: false });
    fetchMock.mockResolvedValue(res(200));
    await flushSessionQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(queue()).toHaveLength(0);
  });

  it('sends completedFullSession only when the segment ran to its natural end', async () => {
    fetchMock.mockResolvedValue(res(200));
    const sent = () => fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).completedFullSession);
    await recordSession({ ...payload, completedFullSession: true });
    await recordSession({ ...payload, completedFullSession: false });
    await recordSession(payload); // omitted = partial
    expect(sent()).toEqual([true, false, false]);
  });

  it('never sends durations below 1 second', async () => {
    await expect(
      recordSession({ ...payload, durationSec: 0.4 }),
    ).resolves.toBe('skipped');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([400, 429])('does not retry %i', async (status) => {
    fetchMock.mockResolvedValue(res(status));
    const onRecorded = vi.fn();
    await expect(recordSession(payload, onRecorded)).resolves.toBe('dropped');
    expect(queue()).toHaveLength(0);
    expect(onRecorded).not.toHaveBeenCalled();
  });

  it('keeps 401 for retry while a user is logged in', async () => {
    fetchMock.mockResolvedValue(res(401));
    await expect(recordSession(payload)).resolves.toBe('queued');
    expect(queue()).toHaveLength(1);
    expect(queue()[0].attempts).toBe(1);
  });

  it('keeps items on 5xx and network errors', async () => {
    fetchMock.mockResolvedValueOnce(res(503));
    await expect(recordSession(payload)).resolves.toBe('queued');
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(recordSession(payload)).resolves.toBe('queued');
    expect(queue()).toHaveLength(2);
    // offline does not burn attempts
    expect(queue()[1].attempts).toBe(0);
  });

  it('caps the queue length', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    for (let i = 0; i < 25; i++) await recordSession(payload);
    expect(queue()).toHaveLength(20);
  });

  it('flush sends queued items in order and invalidates once', async () => {
    seedItem({ id: 'a', payload: { ...payload, durationSec: 100 } });
    seedItem({ id: 'b', payload: { ...payload, durationSec: 200 } });
    fetchMock.mockResolvedValue(res(200));
    const onRecorded = vi.fn();
    await flushSessionQueue(onRecorded);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).durationSec).toBe(100);
    expect(queue()).toHaveLength(0);
    expect(onRecorded).toHaveBeenCalledTimes(1);
  });

  it('flush does not lose an item appended while it is sending', async () => {
    seedItem({ id: 'a' });
    fetchMock.mockImplementation(async () => {
      // another tab / a live record appends mid-flush
      mem.set(
        'session-record-queue',
        JSON.stringify([
          ...queue(),
          { id: 'late', payload, userId: 'u1', queuedAt: Date.now(), attempts: 0, sendingAt: Date.now() },
        ]),
      );
      return res(200);
    });
    await flushSessionQueue();
    expect(queue().map((i: { id: string }) => i.id)).toEqual(['late']);
  });

  it('flush stops on network errors without burning attempts', async () => {
    seedItem({ id: 'a' });
    seedItem({ id: 'b' });
    fetchMock.mockRejectedValue(new Error('offline'));
    await flushSessionQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(queue().map((i: { attempts: number }) => i.attempts)).toEqual([0, 0]);
  });

  it('a failing 5xx item does not block the others and is dropped after 5 attempts', async () => {
    seedItem({ id: 'bad', attempts: 4 });
    seedItem({ id: 'good' });
    fetchMock.mockImplementation(async (_u: string, init: { body: string }) =>
      res(JSON.parse(init.body).taskId === 'bad' ? 500 : 200),
    );
    // distinguish by taskId
    const q = queue();
    q[0].payload = { ...payload, taskId: 'bad' };
    mem.set('session-record-queue', JSON.stringify(q));

    await flushSessionQueue();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(queue()).toHaveLength(0); // bad hit 5 attempts, good was sent
  });

  it('flush only sends the current user\'s items and keeps the others', async () => {
    seedItem({ id: 'mine' });
    seedItem({ id: 'theirs', userId: 'other' });
    fetchMock.mockResolvedValue(res(200));
    await flushSessionQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(queue().map((i: { id: string }) => i.id)).toEqual(['theirs']);
  });

  it('flush skips items already in flight and discards entries older than 24h', async () => {
    seedItem({ id: 'inflight', sendingAt: Date.now() });
    seedItem({ id: 'old', queuedAt: Date.now() - 25 * 3600_000 });
    await flushSessionQueue();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(queue().map((i: { id: string }) => i.id)).toEqual(['inflight']);
  });

  it("hands a guest's queued sessions to the real account the guest signs in to", async () => {
    seedItem({ id: 'g', userId: 'guest-1', guest: true });
    useAuthStore.setState({ user: { id: 'real-1', isAnonymous: false }, isLoading: false });
    fetchMock.mockResolvedValue(res(200));
    await flushSessionQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(queue()).toHaveLength(0);
  });

  it("does not hand a guest's sessions to a different guest", async () => {
    seedItem({ id: 'g', userId: 'guest-1', guest: true });
    useAuthStore.setState({ user: { id: 'guest-2', isAnonymous: true }, isLoading: false });
    await flushSessionQueue();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(queue()).toHaveLength(1);
  });

  describe('shouldFlushOnAuthChange', () => {
    const user = { id: 'u1', isAnonymous: false };
    it('flushes when a user appears or changes', () => {
      expect(shouldFlushOnAuthChange({ user, isLoading: false }, { user: null, isLoading: false })).toBe(true);
      expect(shouldFlushOnAuthChange({ user: { ...user, id: 'u2' }, isLoading: false }, { user, isLoading: false })).toBe(true);
    });
    it('flushes when auth finishes loading without a user (guest whose sign-in must be retried)', () => {
      expect(shouldFlushOnAuthChange({ user: null, isLoading: false }, { user: null, isLoading: true })).toBe(true);
    });
    it('ignores unrelated updates', () => {
      expect(shouldFlushOnAuthChange({ user, isLoading: false }, { user, isLoading: false })).toBe(false);
      expect(shouldFlushOnAuthChange({ user: null, isLoading: true }, { user: null, isLoading: true })).toBe(false);
    });
  });
});
