import { render, screen } from '@testing-library/react';
import { reportClientError } from '@/lib/observability/report-client-error';
import GlobalError from './global-error';

vi.mock('@/lib/observability/report-client-error', () => ({ reportClientError: vi.fn() }));

describe('GlobalError', () => {
  beforeEach(() => {
    vi.mocked(reportClientError).mockClear();
    // <html> inside the test container is a DOM nesting warning React prints; not what is under test.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('shows the self-contained error card and reports the crash to the server', () => {
    const error = Object.assign(new Error('layout exploded'), { digest: 'dg1' });
    const reset = vi.fn();
    render(<GlobalError error={error} reset={reset} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(reportClientError).toHaveBeenCalledWith(error, 'global-error');
  });
});
