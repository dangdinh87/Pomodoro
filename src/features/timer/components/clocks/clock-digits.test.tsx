import { render } from '@testing-library/react';
import { ClockDigits, clockDigitScale } from './clock-digits';

const cells = (container: HTMLElement) => [...container.querySelectorAll('[data-clock-cell]')];

describe('ClockDigits', () => {
  it('puts every digit in its own fixed-width cell, with two dots for the colon', () => {
    const { container } = render(<ClockDigits minutes={5} seconds={9} />);
    expect(cells(container).map((c) => c.textContent)).toEqual(['0', '5', '0', '9']);
    for (const cell of cells(container)) expect(cell.className).toMatch(/\bw-\[0\.9ch\]/);
    expect(container.querySelectorAll('[data-clock-colon] i')).toHaveLength(2);
  });

  it('keeps the same cells whatever the value, so the row never changes width', () => {
    const widths = ['w-[0.9ch]'];
    for (const [m, s] of [[25, 0], [11, 11], [0, 1], [59, 59], [8, 47]]) {
      const { container, unmount } = render(<ClockDigits minutes={m} seconds={s} />);
      expect(cells(container)).toHaveLength(4);
      expect(cells(container).every((c) => widths.every((w) => c.className.includes(w)))).toBe(true);
      unmount();
    }
  });

  it('adds a cell for a third minute digit', () => {
    const { container } = render(<ClockDigits minutes={120} seconds={0} />);
    expect(cells(container).map((c) => c.textContent)).toEqual(['1', '2', '0', '0', '0']);
  });

  it('is decorative: the timer role on the clock carries the time', () => {
    const { container } = render(<ClockDigits minutes={1} seconds={2} />);
    expect(container.querySelector('[data-clock-digits]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('never takes pointer events: its tall glyph boxes spill over the mode chips above the clock', () => {
    const { container } = render(<ClockDigits minutes={1} seconds={2} />);
    const row = container.querySelector('[data-clock-digits]')!;
    expect(row).toHaveClass('pointer-events-none', 'select-none');
  });

  it('colours the dots (mode accent by default, a warning colour on request)', () => {
    const { container, rerender } = render(<ClockDigits minutes={1} seconds={2} />);
    const dot = () => container.querySelector<HTMLElement>('[data-clock-colon] i')!;
    expect(dot().style.backgroundColor).toBe('var(--accent-solid)');
    rerender(<ClockDigits minutes={1} seconds={2} dotColor="var(--rose-solid)" />);
    expect(dot().style.backgroundColor).toBe('var(--rose-solid)');
  });
});

describe('clockDigitScale', () => {
  it('is 1 for mm:ss and shrinks the font for longer rows', () => {
    expect(clockDigitScale(0)).toBe(1);
    expect(clockDigitScale(99)).toBe(1);
    expect(clockDigitScale(120)).toBeCloseTo(0.8);
    expect(clockDigitScale(1000)).toBeCloseTo(4 / 6);
  });
});
