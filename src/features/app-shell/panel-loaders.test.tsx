import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { LAZY_PANELS, lazyPanel, preloadPanelsWhenIdle } from './panel-loaders';

vi.mock('@/contexts/i18n-context', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
// Keep the five real panel chunks out of these tests
vi.mock('@/features/panels/tasks-panel', () => ({ default: () => null }));
vi.mock('@/features/panels/stats-panel', () => ({ default: () => null }));
vi.mock('@/features/panels/arcade-panel', () => ({ default: () => null }));
vi.mock('@/features/panels/settings-panel', () => ({ default: () => null }));
vi.mock('@/features/panels/feedback-panel', () => ({ default: () => null }));

const Hello = () => <p>panel body</p>;

describe('lazyPanel', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it('shows the skeleton, then the panel', async () => {
    let resolve!: (m: { default: ComponentType }) => void;
    const Panel = lazyPanel(() => new Promise((r) => (resolve = r)));
    const { container } = render(<Panel />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    await act(async () => resolve({ default: Hello }));
    expect(screen.getByText('panel body')).toBeInTheDocument();
  });

  it('a chunk that fails to load offers Try again instead of a skeleton forever', async () => {
    const user = userEvent.setup();
    const load = vi
      .fn<() => Promise<{ default: ComponentType }>>()
      .mockRejectedValueOnce(new Error('ChunkLoadError'))
      .mockResolvedValue({ default: Hello });
    const Panel = lazyPanel(load);
    render(<Panel />);

    expect(await screen.findByRole('alert')).toHaveTextContent('shell.panelError.title');
    expect(load).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'errors.boundary.retry' }));

    expect(await screen.findByText('panel body')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps failing visibly (not silently) when the retry fails too', async () => {
    const user = userEvent.setup();
    const load = vi.fn<() => Promise<{ default: ComponentType }>>().mockRejectedValue(new Error('offline'));
    const Panel = lazyPanel(load);
    render(<Panel />);

    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'errors.boundary.retry' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('a panel that throws while rendering gets the same Try again', async () => {
    const user = userEvent.setup();
    let broken = true;
    const Flaky = () => {
      if (broken) throw new Error('render boom');
      return <p>panel body</p>;
    };
    const Panel = lazyPanel(async () => ({ default: Flaky }));
    render(<Panel />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    broken = false;
    await user.click(screen.getByRole('button', { name: 'errors.boundary.retry' }));
    expect(screen.getByText('panel body')).toBeInTheDocument();
  });
});

describe('preloadPanelsWhenIdle', () => {
  const setConnection = (value: unknown) =>
    Object.defineProperty(navigator, 'connection', { configurable: true, value });
  let spies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no requestIdleCallback: the setTimeout fallback is exercised
    spies = Object.values(LAZY_PANELS).map((p) => vi.spyOn(p, 'preload').mockResolvedValue());
  });
  afterEach(() => {
    vi.useRealTimers();
    spies.forEach((s) => s.mockRestore());
    Reflect.deleteProperty(navigator, 'connection');
  });

  it('warms every panel chunk once idle', () => {
    const cancel = preloadPanelsWhenIdle();
    vi.advanceTimersByTime(5000);
    spies.forEach((s) => expect(s).toHaveBeenCalledTimes(1));
    cancel();
  });

  it('skips the idle download on Data Saver', () => {
    setConnection({ saveData: true });
    const cancel = preloadPanelsWhenIdle();
    vi.advanceTimersByTime(10_000);
    spies.forEach((s) => expect(s).not.toHaveBeenCalled());
    cancel();
  });

  it('still preloads when saveData is off or the API is missing', () => {
    setConnection({ saveData: false });
    preloadPanelsWhenIdle();
    vi.advanceTimersByTime(5000);
    spies.forEach((s) => expect(s).toHaveBeenCalledTimes(1));
  });
});
