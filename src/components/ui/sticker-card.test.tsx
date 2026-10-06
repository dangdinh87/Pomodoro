import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StickerCard } from './sticker-card';

describe('StickerCard', () => {
  it('is an untilted medium sticker by default', () => {
    render(<StickerCard data-testid="c">Hi</StickerCard>);
    const card = screen.getByTestId('c');
    expect(card).toHaveClass('sticker', 'p-5');
    expect(card).not.toHaveClass('tilt-l');
    expect(card).not.toHaveClass('tilt-r');
    expect(card).toHaveAttribute('data-tilt', 'none');
  });

  it.each([
    ['left', 'tilt-l'],
    ['right', 'tilt-r'],
  ] as const)('tilts %s', (tilt, cls) => {
    render(
      <StickerCard data-testid="c" tilt={tilt}>
        Hi
      </StickerCard>,
    );
    expect(screen.getByTestId('c')).toHaveClass(cls);
  });

  it.each([
    ['sm', 'sticker-sm'],
    ['md', 'sticker'],
    ['lg', 'sticker-lg'],
  ] as const)('%s size picks .%s', (size, cls) => {
    render(
      <StickerCard data-testid="c" size={size}>
        Hi
      </StickerCard>,
    );
    expect(screen.getByTestId('c')).toHaveClass(cls);
  });

  it('forwards ref, className and html attributes', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <StickerCard ref={ref} className="extra" id="x">
        Hi
      </StickerCard>,
    );
    expect(ref.current).toHaveClass('extra');
    expect(ref.current).toHaveAttribute('id', 'x');
  });
});
