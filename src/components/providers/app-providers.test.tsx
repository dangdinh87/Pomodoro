import { render, screen } from '@testing-library/react';
import { AppProviders } from './app-providers';

// The pieces have their own tests; here only how the wrapper places them
vi.mock('@/components/providers/auth-session-sync', () => ({ AuthSessionSync: () => null }));
vi.mock('@/components/providers/audio-cleanup-provider', () => ({ AudioCleanupProvider: () => null }));
vi.mock('@/components/background/background-renderer', () => ({ BackgroundRenderer: () => <div data-testid="scene" /> }));
vi.mock('@/components/ui/toaster', () => ({ Toaster: () => <section data-testid="toaster" /> }));
vi.mock('nextjs-toploader', () => ({ default: () => null }));

describe('AppProviders', () => {
  it('renders the app inside its providers, and the toaster at the end of <body> (after the page in tab order)', () => {
    const { container } = render(
      <AppProviders>
        <p>app</p>
      </AppProviders>,
    );
    expect(screen.getByText('app')).toBeInTheDocument();
    expect(container).toContainElement(screen.getByTestId('scene'));
    const toaster = screen.getByTestId('toaster');
    expect(container).not.toContainElement(toaster);
    expect(document.body.lastElementChild).toBe(toaster);
  });
});
