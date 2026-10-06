import { fireEvent, render, screen } from '@testing-library/react';
import { reportClientError } from '@/lib/observability/report-client-error';
import { RouteError } from './route-error';

vi.mock('@/lib/observability/report-client-error', () => ({ reportClientError: vi.fn() }));

const state = vi.hoisted(() => ({ lang: 'en' }));
vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({
    lang: state.lang,
    t: (key: string, vars?: Record<string, string>) => (vars ? `${key} ${Object.values(vars).join(',')}` : key),
  }),
}));

describe('RouteError', () => {
  beforeEach(() => {
    state.lang = 'en';
    vi.mocked(reportClientError).mockClear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('shows a worried Tomo in an alert card with one h1', () => {
    const { container } = render(<RouteError error={new Error('boom')} reset={vi.fn()} homeHref="/" homeLabelKey="errors.boundary.goHome" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(container.querySelector('[data-face="worried"]')).not.toBeNull();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('retry is the primary action and calls reset; going home is a plain link', () => {
    const reset = vi.fn();
    render(<RouteError error={new Error('boom')} reset={reset} homeHref="/" homeLabelKey="errors.boundary.goTimer" />);

    fireEvent.click(screen.getByRole('button', { name: 'errors.boundary.retry' }));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'errors.boundary.retry' })).toHaveClass('btn--primary');
    expect(screen.getByRole('link', { name: 'errors.boundary.goTimer' })).toHaveAttribute('href', '/');
  });

  it('keeps the home link inside the visitor language', () => {
    state.lang = 'ja';
    render(<RouteError error={new Error('boom')} reset={vi.fn()} homeHref="/" homeLabelKey="errors.boundary.goTimer" />);

    expect(screen.getByRole('link', { name: 'errors.boundary.goTimer' })).toHaveAttribute('href', '/ja');
  });

  it('reports the error once to the server for error tracking', () => {
    const error = Object.assign(new Error('boom'), { digest: 'abc123' });
    const { rerender } = render(<RouteError error={error} reset={vi.fn()} homeHref="/" homeLabelKey="errors.boundary.goHome" />);
    rerender(<RouteError error={error} reset={vi.fn()} homeHref="/" homeLabelKey="errors.boundary.goHome" />);

    expect(reportClientError).toHaveBeenCalledTimes(1);
    expect(reportClientError).toHaveBeenCalledWith(error, 'route-error');
  });

  it('prints the digest as a reference only when there is one', () => {
    const { rerender } = render(<RouteError error={new Error('boom')} reset={vi.fn()} homeHref="/" homeLabelKey="errors.boundary.goHome" />);
    expect(screen.queryByText(/errors\.boundary\.reference/)).toBeNull();

    rerender(<RouteError error={Object.assign(new Error('boom'), { digest: 'abc123' })} reset={vi.fn()} homeHref="/" homeLabelKey="errors.boundary.goHome" />);
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });
});
