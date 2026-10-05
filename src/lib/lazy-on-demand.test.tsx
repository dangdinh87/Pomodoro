import { act, render, screen } from '@testing-library/react';
import { lazyOnDemand, preloadAllOnDemand } from './lazy-on-demand';

function Sheet({ open, label }: { open: boolean; label: string }) {
  return <p data-open={open}>{label}</p>;
}

function deferred() {
  let resolve!: (component: typeof Sheet) => void;
  const promise = new Promise<typeof Sheet>((r) => (resolve = r));
  return { promise, resolve };
}

describe('lazyOnDemand', () => {
  it('fetches nothing and renders nothing until it is first needed', () => {
    const load = vi.fn(() => new Promise<typeof Sheet>(() => {}));
    const LazySheet = lazyOnDemand(load);
    const { container } = render(<LazySheet needed={false} open={false} label="sound" />);
    expect(load).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  it('loads when needed, then stays mounted (closing keeps the component, like a static import)', async () => {
    const chunk = deferred();
    const LazySheet = lazyOnDemand(() => chunk.promise);
    const { rerender } = render(<LazySheet needed open label="sound" />);
    expect(screen.queryByText('sound')).toBeNull();

    await act(async () => chunk.resolve(Sheet));
    expect(screen.getByText('sound')).toHaveAttribute('data-open', 'true');

    rerender(<LazySheet needed={false} open={false} label="sound" />);
    expect(screen.getByText('sound')).toHaveAttribute('data-open', 'false');
  });

  it('a preloaded chunk renders on the first frame it is needed', async () => {
    const LazySheet = lazyOnDemand(async () => Sheet);
    await act(() => LazySheet.preload());
    render(<LazySheet needed open label="scene" />);
    expect(screen.getByText('scene')).toBeInTheDocument();
  });

  it('a chunk that failed to load is fetched again on the next open', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const load = vi.fn<() => Promise<typeof Sheet>>().mockRejectedValueOnce(new Error('ChunkLoadError')).mockResolvedValue(Sheet);
    const LazySheet = lazyOnDemand(load);
    const { rerender } = render(<LazySheet needed open label="timer" />);
    await act(async () => {});
    expect(screen.queryByText('timer')).toBeNull();

    rerender(<LazySheet needed={false} open={false} label="timer" />);
    rerender(<LazySheet needed open label="timer" />);
    expect(await screen.findByText('timer')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    error.mockRestore();
  });

  it('preloadAllOnDemand warms every on-demand component once', async () => {
    const a = vi.fn(async () => Sheet);
    const b = vi.fn(async () => Sheet);
    lazyOnDemand(a);
    lazyOnDemand(b);
    preloadAllOnDemand();
    preloadAllOnDemand();
    await act(async () => {});
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
