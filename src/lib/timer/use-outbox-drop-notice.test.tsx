import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const toast = vi.hoisted(() => ({ info: vi.fn() }));
let listener: ((count: number) => void) | null = null;
const unsubscribe = vi.fn();

vi.mock('sonner', () => ({ toast }));
vi.mock('@/contexts/i18n-context', () => ({ useI18n: () => ({ t: (key: string) => `t:${key}` }) }));
vi.mock('./session-recorder', () => ({
  onSessionsDropped: (fn: (count: number) => void) => {
    listener = fn;
    return unsubscribe;
  },
}));

import { useOutboxDropNotice } from './use-outbox-drop-notice';

beforeEach(() => {
  vi.clearAllMocks();
  listener = null;
});

describe('useOutboxDropNotice', () => {
  it('shows one translated toast when sessions are dropped', () => {
    renderHook(() => useOutboxDropNotice());
    listener?.(3);

    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(toast.info).toHaveBeenCalledWith('t:timer.outbox.dropped', { id: 'outbox-dropped' });
  });

  it('stops listening on unmount', () => {
    const { unmount } = renderHook(() => useOutboxDropNotice());
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
