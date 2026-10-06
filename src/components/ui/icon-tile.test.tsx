import { render } from '@testing-library/react';
import { Timer } from '@phosphor-icons/react/dist/ssr';
import { describe, expect, it } from 'vitest';
import { IconTile, type IconTileTone } from './icon-tile';

const CANDY: IconTileTone[] = ['tomato', 'mint', 'butter', 'lilac', 'sky', 'peach'];

describe('IconTile', () => {
  it.each(CANDY)('%s tile is a candy fill with an on-accent icon and an outline', (tone) => {
    const { container } = render(<IconTile icon={Timer} tone={tone} />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile).toHaveClass(`bg-candy-${tone}`, 'text-on-accent', 'border-outline');
    expect(tile.querySelector('svg')).not.toBeNull();
  });

  it('neutral surface tile uses ink for the icon (on-accent is dark brown, invisible on a dark surface)', () => {
    const { container } = render(<IconTile icon={Timer} tone="surface" />);
    expect(container.firstElementChild).toHaveClass('bg-surface-raised', 'text-ink');
    expect(container.firstElementChild).not.toHaveClass('text-on-accent');
  });

  it.each([
    ['sm', 'size-7', '16'],
    ['md', 'size-9', '20'],
    ['lg', 'size-12', '26'],
  ] as const)('%s size', (size, cls, px) => {
    const { container } = render(<IconTile icon={Timer} size={size} />);
    expect(container.firstElementChild).toHaveClass(cls);
    expect(container.querySelector('svg')).toHaveAttribute('width', px);
  });

  it('defaults to a medium surface tile, is decorative and takes className', () => {
    const { container } = render(<IconTile icon={Timer} className="extra" />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile).toHaveAttribute('data-tone', 'surface');
    expect(tile).toHaveAttribute('data-size', 'md');
    expect(tile).toHaveAttribute('aria-hidden', 'true');
    expect(tile).toHaveClass('extra');
  });
});
