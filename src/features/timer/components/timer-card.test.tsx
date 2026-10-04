import { act, render, screen } from '@testing-library/react';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { useTimerStore } from '@/stores/timer-store';
import { useSystemStore } from '@/stores/system-store';
import { useCelebrationStore } from '@/features/mascot/celebration-store';
import { SessionCycle } from './session-cycle';
import { TimerMascot } from './timer-mascot';
import { TimerProgress } from './timer-progress';

let activeTask: { title: string } | null = null;
let stats = { streak: 0, focusSeconds: 0 };
vi.mock('../hooks/use-active-task', () => ({ useActiveTask: () => activeTask }));
vi.mock('@/hooks/use-stats', () => ({
  useStats: () => ({
    data: { summary: { streak: { current: stats.streak, longest: stats.streak }, totalFocusTime: stats.focusSeconds, completedSessions: 0 } },
  }),
}));

const renderIn = (ui: React.ReactElement, lang: Lang = 'en') => render(<I18nProvider initialLang={lang}>{ui}</I18nProvider>);
const face = (container: HTMLElement) => container.querySelector('svg[data-face]')?.getAttribute('data-face');

describe('TimerMascot', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 5, 10, 0));
    sessionStorage.clear();
    activeTask = null;
    stats = { streak: 0, focusSeconds: 0 };
    useCelebrationStore.setState({ pending: null });
    useSystemStore.setState({ isFocusMode: false });
    useTimerStore.setState({ mode: 'work', isRunning: false });
  });
  afterEach(() => vi.useRealTimers());

  it('idle: a happy Tomo with a greeting in a bubble, in the language of the app', () => {
    const { container } = renderIn(<TimerMascot />);
    expect(face(container)).toBe('happy');
    expect(screen.getByRole('button', { name: /Hide this message/ })).toHaveTextContent(
      /Good morning|Morning!|A fresh day/,
    );
  });

  it.each([
    ['vi', /Chào buổi sáng|Sáng rồi|Ngày mới|Chào bạn/],
    ['ja', /おはようございます|朝ですね|新しい一日/],
  ] as const)('greets in %s', (lang, pattern) => {
    renderIn(<TimerMascot />, lang);
    expect(screen.getByRole('button')).toHaveTextContent(pattern);
  });

  it('a running focus: small focus Tomo next to the task name, no bubble', () => {
    activeTask = { title: 'Revise calculus' };
    useTimerStore.setState({ isRunning: true });
    const { container } = renderIn(<TimerMascot />);
    expect(face(container)).toBe('focus');
    expect(screen.getByText('Revise calculus')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('a running focus without a task shows the mode name instead', () => {
    useTimerStore.setState({ isRunning: true });
    renderIn(<TimerMascot />);
    expect(screen.getByText('Focus')).toBeInTheDocument();
  });

  it('starting the timer swaps the bubble for the focus row without remounting the slot', () => {
    const { container } = renderIn(<TimerMascot />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    act(() => useTimerStore.setState({ isRunning: true }));
    expect(screen.queryByRole('button')).toBeNull();
    expect(face(container)).toBe('focus');
  });

  it('a break: sleepy Tomo with a break tip, even while the break runs', () => {
    useTimerStore.setState({ mode: 'shortBreak', isRunning: true });
    const { container } = renderIn(<TimerMascot />);
    expect(face(container)).toBe('sleepy');
    expect(screen.getByRole('button')).toHaveTextContent(/stretch|water|window|breaths/);
  });

  it('a streak at risk in the evening: worried', () => {
    vi.setSystemTime(new Date(2026, 9, 5, 19, 0));
    stats = { streak: 5, focusSeconds: 0 };
    const { container } = renderIn(<TimerMascot />);
    expect(face(container)).toBe('worried');
  });

  it('pressing the bubble hides it for the session but Tomo stays', () => {
    const { container, unmount } = renderIn(<TimerMascot />);
    act(() => screen.getByRole('button').click());
    expect(screen.queryByRole('button')).toBeNull();
    expect(face(container)).toBe('happy');
    unmount();
    renderIn(<TimerMascot />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is hidden in fullscreen focus mode', () => {
    useSystemStore.setState({ isFocusMode: true });
    const { container } = renderIn(<TimerMascot />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('SessionCycle', () => {
  const state = (patch: object) =>
    useTimerStore.setState({ mode: 'work', sessionCount: 0, ...patch } as never);

  it('focus: filled tomatoes for finished sessions and "Session 3 of 4"', () => {
    state({ sessionCount: 2 });
    const { container } = renderIn(<SessionCycle />);
    expect(container.querySelectorAll('svg[data-filled="true"]')).toHaveLength(2);
    expect(container.querySelectorAll('svg[data-filled="false"]')).toHaveLength(2);
    expect(screen.getByText('Session 3 of 4')).toBeInTheDocument();
  });

  it('break: counts the sessions done, in Vietnamese and Japanese too', () => {
    state({ mode: 'shortBreak', sessionCount: 1 });
    const { unmount } = renderIn(<SessionCycle />);
    expect(screen.getByText('1 of 4 sessions done')).toBeInTheDocument();
    unmount();
    renderIn(<SessionCycle />, 'vi');
    expect(screen.getByText('Đã xong 1/4 phiên')).toBeInTheDocument();
  });

  it('the tomatoes are hidden from assistive tech: the label says it once', () => {
    state({ sessionCount: 1 });
    renderIn(<SessionCycle />);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('a full cycle on the long break shows all four done', () => {
    state({ mode: 'longBreak', sessionCount: 4 });
    const { container } = renderIn(<SessionCycle />);
    expect(container.querySelectorAll('svg[data-filled="true"]')).toHaveLength(4);
  });

  it('renders a spacer on a break before any session', () => {
    state({ mode: 'shortBreak', sessionCount: 0 });
    const { container } = renderIn(<SessionCycle />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('TimerProgress', () => {
  const fill = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-timer-progress] > div')!;

  it('is 18px tall, decorative and fills to the percentage', () => {
    const { container } = render(<TimerProgress percent={40} reduceMotion={false} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild!.className).toContain('h-[18px]');
    expect(fill(container).style.width).toBe('40%');
  });

  it('clamps out-of-range values and hides the empty fill (no stray outline sliver)', () => {
    const { container, rerender } = render(<TimerProgress percent={-5} reduceMotion={false} />);
    expect(fill(container).style.width).toBe('0%');
    expect(fill(container).className).toContain('invisible');
    rerender(<TimerProgress percent={250} reduceMotion={false} />);
    expect(fill(container).style.width).toBe('100%');
  });

  it('does not animate the width under reduced motion', () => {
    const { container, rerender } = render(<TimerProgress percent={10} reduceMotion={false} />);
    expect(fill(container).className).toContain('transition-[width]');
    rerender(<TimerProgress percent={10} reduceMotion />);
    expect(fill(container).className).not.toContain('transition-[width]');
  });
});
