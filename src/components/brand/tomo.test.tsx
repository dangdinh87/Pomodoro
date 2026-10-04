import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tomo } from './tomo';
import { TOMO_FACES, TOMO_LIGHT_PALETTE, tomoSvg } from './tomo-art';

describe('Tomo', () => {
  it.each(TOMO_FACES)('renders the %s face', (face) => {
    const { container } = render(<Tomo face={face} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('data-face', face);
    expect(svg?.querySelectorAll('ellipse, path, circle').length).toBeGreaterThan(8);
  });

  it('draws a different face for every expression', () => {
    const markup = TOMO_FACES.map((face) => render(<Tomo face={face} />).container.innerHTML);
    expect(new Set(markup).size).toBe(TOMO_FACES.length);
  });

  it('defaults to happy at 96px', () => {
    const { container } = render(<Tomo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('data-face', 'happy');
    expect(svg).toHaveAttribute('width', '96');
    expect(svg).toHaveAttribute('height', '96');
    expect(svg).toHaveAttribute('viewBox', '0 0 120 120');
  });

  it('is decorative without a title', () => {
    const { container } = render(<Tomo face="happy" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg?.querySelector('title')).toBeNull();
  });

  it('is an image with a name when a title is given', () => {
    const { getByRole, container } = render(<Tomo face="sleepy" title="Tomo is asleep" />);
    expect(getByRole('img', { name: 'Tomo is asleep' })).toBe(container.querySelector('svg'));
    expect(container.querySelector('svg')).not.toHaveAttribute('aria-hidden');
    expect(container.querySelector('title')).toHaveTextContent('Tomo is asleep');
  });

  it('applies size, className and the tight crop', () => {
    const { container } = render(<Tomo face="focus" size={24} className="shrink-0" tight />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveClass('shrink-0');
    expect(svg).toHaveAttribute('viewBox', '8 12 104 104');
  });

  it('colours the body and outline from the design tokens', () => {
    const { container } = render(<Tomo face="happy" />);
    const html = container.innerHTML;
    expect(html).toContain('var(--candy-tomato)');
    expect(html).toContain('var(--outline)');
    expect(html).toContain('var(--on-accent)');
  });

  it('draws a heavier outline at small sizes', () => {
    const small = render(<Tomo size={24} />).container.innerHTML;
    const large = render(<Tomo size={160} />).container.innerHTML;
    expect(small).toContain('stroke-width="5"');
    expect(large).toContain('stroke-width="3.5"');
  });
});

describe('tomoSvg (static files and next/og)', () => {
  it.each(TOMO_FACES)('%s is well-formed XML with literal colours only', (face) => {
    const svg = tomoSvg(face, TOMO_LIGHT_PALETTE, { size: 512, tight: true });
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    expect(doc.documentElement.getAttribute('width')).toBe('512');
    expect(svg).not.toContain('var(');
  });
});
