import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useHistory } from './use-history';
import { useStats } from './use-stats';

const VN = 'Asia/Ho_Chi_Minh';
const localDay = (y: number, m: number, d: number) => new Date(y, m - 1, d);

let client: QueryClient;
let fetchMock: ReturnType<typeof vi.fn>;
let timeZone: string;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

beforeEach(() => {
  timeZone = VN;
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockImplementation(
    () => ({ timeZone }) as Intl.ResolvedDateTimeFormatOptions,
  );
  useAuthStore.setState({ user: { id: 'u1', isAnonymous: false } });
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => ({}) }));
  global.fetch = fetchMock as never;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const requested = () => new URL(String(fetchMock.mock.calls.at(-1)![0]), 'http://localhost');

describe('useStats', () => {
  it('sends the browser time zone, also without a range', async () => {
    const { result } = renderHook(() => useStats(undefined), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requested().pathname).toBe('/api/stats');
    expect(requested().searchParams.get('tz')).toBe(VN);
    expect(requested().searchParams.has('startDate')).toBe(false);
  });

  it('sends the range as study-day keys and includes the zone in the query key', async () => {
    const range = { from: localDay(2026, 10, 4), to: localDay(2026, 10, 5) };
    const { result } = renderHook(() => useStats(range), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const params = requested().searchParams;
    expect([params.get('tz'), params.get('startDate'), params.get('endDate')]).toEqual([VN, '2026-10-04', '2026-10-05']);
    expect(client.getQueryCache().getAll().map((q) => q.queryKey)).toEqual([['stats', VN, '2026-10-04', '2026-10-05']]);
  });

  it('refetches when the viewer changes zone', async () => {
    const range = { from: localDay(2026, 10, 4), to: localDay(2026, 10, 4) };
    const first = renderHook(() => useStats(range), { wrapper });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    first.unmount();
    timeZone = 'America/New_York';
    const second = renderHook(() => useStats(range), { wrapper });
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requested().searchParams.get('tz')).toBe('America/New_York');
  });
});

describe('useHistory', () => {
  it('sends tz and a single day as a one-day range', async () => {
    const { result } = renderHook(() => useHistory({ from: localDay(2026, 10, 4), to: undefined }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const params = requested().searchParams;
    expect([params.get('tz'), params.get('startDate'), params.get('endDate')]).toEqual([VN, '2026-10-04', '2026-10-04']);
    expect(client.getQueryCache().getAll().map((q) => q.queryKey)).toEqual([['history', VN, '2026-10-04', undefined]]);
  });

  it('sends tz even without a range', async () => {
    const { result } = renderHook(() => useHistory(undefined), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requested().searchParams.get('tz')).toBe(VN);
  });
});
