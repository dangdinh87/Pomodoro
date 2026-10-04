import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/';
let search = '';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock('next/script', () => ({
  default: ({ id, src, children }: { id?: string; src?: string; children?: ReactNode }) => (
    <script data-testid={id} data-src={src}>
      {children}
    </script>
  ),
}));

import GATracking, { GoogleAnalytics } from './ga';

const gtag = vi.fn();
const pageViews = () => gtag.mock.calls.filter(([cmd, name]) => cmd === 'event' && name === 'page_view');

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  pathname = '/';
  search = '';
  window.gtag = gtag;
  window.dataLayer = [];
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  delete window.gtag;
  delete window.dataLayer;
});

describe('GoogleAnalytics scripts', () => {
  it('renders nothing without an ID', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', '');
    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing for a malformed ID, such as two env lines glued together', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'GTM-NXW9Z4LKGROQ_API_KEY=gsk_secret');
    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe('');
  });

  it('G- ID: loads gtag.js and configures it without the automatic page_view', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-ABC123XYZ9');
    const { getByTestId, queryByTestId, container } = render(<GoogleAnalytics />);

    expect(getByTestId('ga-loader').getAttribute('data-src')).toBe('https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ9');
    const init = getByTestId('ga-init').textContent ?? '';
    expect(init).toContain("gtag('config', 'G-ABC123XYZ9', { send_page_view: false })");
    expect(queryByTestId('gtm-init')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('GTM- ID: the official Tag Manager snippet and its noscript iframe, not gtag', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'GTM-NXW9Z4LK');
    const { getByTestId, queryByTestId, container } = render(<GoogleAnalytics />);

    const snippet = getByTestId('gtm-init').textContent ?? '';
    expect(snippet).toContain("'gtm.start'");
    expect(snippet).toContain('https://www.googletagmanager.com/gtm.js?id=');
    expect(snippet).toContain("'dataLayer','GTM-NXW9Z4LK'");
    expect(queryByTestId('ga-loader')).toBeNull();
    expect(queryByTestId('ga-init')).toBeNull();
    // React does not render the children of <noscript> on the client; the markup is for the server HTML
    expect(container.querySelector('noscript')).not.toBeNull();
  });
});

describe('GATracking', () => {
  it('G- ID: sends one page_view on load and one per route change, none for the same URL', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-ABC123XYZ9');
    const { rerender } = render(<GATracking />);
    expect(pageViews()).toHaveLength(1);
    expect(pageViews()[0][2]).toMatchObject({ page_path: '/', page_location: window.location.href });

    rerender(<GATracking />); // same URL again
    expect(pageViews()).toHaveLength(1);

    pathname = '/guide';
    rerender(<GATracking />);
    expect(pageViews()).toHaveLength(2);
    expect(pageViews()[1][2]).toMatchObject({ page_path: '/guide' });

    search = 'panel=tasks';
    rerender(<GATracking />);
    expect(pageViews()[2][2]).toMatchObject({ page_path: '/guide?panel=tasks' });
  });

  it('G- ID: never uses config for page views (that would double count)', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-ABC123XYZ9');
    render(<GATracking />);
    expect(gtag.mock.calls.some(([cmd]) => cmd === 'config')).toBe(false);
  });

  it('G- ID: waits for gtag.js instead of dropping the first page_view', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-ABC123XYZ9');
    delete window.gtag; // the init script has not run yet
    render(<GATracking />);
    expect(pageViews()).toHaveLength(0);

    window.gtag = gtag;
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(pageViews()).toHaveLength(1);
  });

  it('G- ID: gives up quietly if gtag.js never appears (ad blocker)', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-ABC123XYZ9');
    delete window.gtag;
    render(<GATracking />);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(pageViews()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('GTM- ID: the container reports the first load itself; route changes go to the dataLayer', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'GTM-NXW9Z4LK');
    const { rerender } = render(<GATracking />);
    expect(window.dataLayer).toEqual([]);
    expect(gtag).not.toHaveBeenCalled();

    pathname = '/guide';
    rerender(<GATracking />);
    expect(window.dataLayer).toEqual([
      expect.objectContaining({ event: 'page_view', page_path: '/guide', page_location: window.location.href }),
    ]);
  });

  it('does nothing without a valid ID', () => {
    for (const id of ['', 'GTM-NXW9Z4LKGROQ_API_KEY=x', 'UA-1-1']) {
      vi.stubEnv('NEXT_PUBLIC_GA_ID', id);
      render(<GATracking />);
    }
    expect(gtag).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
  });
});
