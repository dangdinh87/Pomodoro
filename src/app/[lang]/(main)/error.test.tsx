import { render, screen } from '@testing-library/react';
import MainError from './error';

const state = vi.hoisted(() => ({ lang: 'en' }));
vi.mock('@/contexts/i18n-context', () => ({ useI18n: () => ({ t: (key: string) => key, lang: state.lang }) }));

describe('(main) error boundary', () => {
  beforeEach(() => {
    state.lang = 'en';
  });

  it('offers a retry and a way home that is not a redirect hop', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<MainError error={new Error('boom')} reset={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'errors.boundary.retry' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'errors.boundary.goTimer' })).toHaveAttribute('href', '/');
    consoleError.mockRestore();
  });

  it('keeps the visitor in their language on the way home', () => {
    state.lang = 'vi';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<MainError error={new Error('boom')} reset={vi.fn()} />);

    expect(screen.getByRole('link', { name: 'errors.boundary.goTimer' })).toHaveAttribute('href', '/vi');
    consoleError.mockRestore();
  });
});
