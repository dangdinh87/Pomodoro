import { render, screen } from '@testing-library/react';
import MainError from './error';

vi.mock('@/contexts/i18n-context', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

describe('(main) error boundary', () => {
  it('offers a retry and a way home that is not a redirect hop', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<MainError error={new Error('boom')} reset={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'errors.boundary.retry' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'errors.boundary.goTimer' })).toHaveAttribute('href', '/');
    consoleError.mockRestore();
  });
});
