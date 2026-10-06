import { render, screen } from '@testing-library/react';
import { AppHomeClientOnly } from './app-home-client-only';

// The heavy app never finishes loading in this test, so what is on screen is the placeholder
// a visitor (and the server HTML) gets first.
vi.mock('./app-runtime', () => new Promise(() => {}));

describe('AppHomeClientOnly', () => {
  it('shows the 25:00 skeleton while the app downloads', async () => {
    render(<AppHomeClientOnly googleEnabled={false} />);
    expect(await screen.findByTestId('app-home-skeleton')).toHaveTextContent('25:00');
  });

  it('no longer forces a dark theme on the placeholder', async () => {
    render(<AppHomeClientOnly googleEnabled={false} />);
    expect((await screen.findByTestId('app-home-skeleton')).closest('[data-theme]')).toBeNull();
  });
});
