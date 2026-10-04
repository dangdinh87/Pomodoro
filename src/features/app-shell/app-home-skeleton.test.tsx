import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppHomeSkeleton } from './app-home-skeleton';

describe('AppHomeSkeleton', () => {
  it('paints a static 25:00 timer card, hidden from assistive tech', () => {
    render(<AppHomeSkeleton />);
    const skeleton = screen.getByTestId('app-home-skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveTextContent('25:00');
  });

  it('renders on the server without any client hooks (it is part of the HTML)', () => {
    const html = renderToStaticMarkup(<AppHomeSkeleton />);
    expect(html).toContain('25:00');
    // same frame as the app section: full-height, centred, same padding => no layout shift on mount
    expect(html).toContain('min-h-dvh');
    expect(html).toContain('pb-24 pt-16');
  });
});
