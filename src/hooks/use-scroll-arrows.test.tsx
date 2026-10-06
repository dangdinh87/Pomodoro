import { act, render } from '@testing-library/react';
import { useScrollArrows } from './use-scroll-arrows';

// jsdom doesn't implement ResizeObserver.
class ResizeObserverStub {
  observe() {}
  disconnect() {}
}

function stubGeometry(el: HTMLElement, { scrollLeft, scrollWidth, clientWidth }: { scrollLeft: number; scrollWidth: number; clientWidth: number }) {
  Object.defineProperty(el, 'scrollLeft', { value: scrollLeft, configurable: true });
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true });
}

/** Renders the hook on a real DOM node (ref assignment happens during React's commit, before effects
 * run — a bare renderHook() with a hand-set `.current` would miss the mount-time listener attachment). */
function renderScrollArrows(geometry: { scrollLeft: number; scrollWidth: number; clientWidth: number }, step?: number) {
  let api!: ReturnType<typeof useScrollArrows<HTMLDivElement>>;
  function Harness() {
    api = useScrollArrows<HTMLDivElement>(step);
    return <div ref={api.scrollRef} />;
  }
  render(<Harness />);
  stubGeometry(api.scrollRef.current!, geometry);
  act(() => {
    api.scrollRef.current!.dispatchEvent(new Event('scroll'));
  });
  return () => api;
}

describe('useScrollArrows', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports no overflow when content fits (nothing to scroll either way)', () => {
    const getApi = renderScrollArrows({ scrollLeft: 0, scrollWidth: 300, clientWidth: 300 });
    expect(getApi().canScrollLeft).toBe(false);
    expect(getApi().canScrollRight).toBe(false);
  });

  it('reports canScrollRight when content overflows and the row is at the start', () => {
    const getApi = renderScrollArrows({ scrollLeft: 0, scrollWidth: 800, clientWidth: 300 });
    expect(getApi().canScrollLeft).toBe(false);
    expect(getApi().canScrollRight).toBe(true);
  });

  it('reports canScrollLeft once scrolled away from the start', () => {
    const getApi = renderScrollArrows({ scrollLeft: 150, scrollWidth: 800, clientWidth: 300 });
    expect(getApi().canScrollLeft).toBe(true);
    expect(getApi().canScrollRight).toBe(true);
  });

  it('scrollLeft/scrollRight call scrollBy with the configured step', () => {
    const getApi = renderScrollArrows({ scrollLeft: 0, scrollWidth: 800, clientWidth: 300 }, 150);
    const el = getApi().scrollRef.current!;
    el.scrollBy = vi.fn();
    getApi().scrollRight();
    expect(el.scrollBy).toHaveBeenCalledWith({ left: 150, behavior: 'smooth' });
    getApi().scrollLeft();
    expect(el.scrollBy).toHaveBeenCalledWith({ left: -150, behavior: 'smooth' });
  });
});
