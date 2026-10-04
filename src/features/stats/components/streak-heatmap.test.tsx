import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/test-utils/i18n';
import { HEATMAP_LEVEL_MIX, StreakHeatmap, levelFor } from './streak-heatmap';

describe('levelFor buckets', () => {
  it.each([
    [0, 0],
    [-5, 0],
    [1, 1],
    [24, 1],
    [25, 2],
    [59, 2],
    [60, 3],
    [119, 3],
    [120, 4],
    [600, 4],
  ])('%i focus minutes is level %i', (minutes, level) => {
    expect(levelFor(minutes)).toBe(level);
  });

  it('has one colour mix per level, from none to full accent', () => {
    expect(HEATMAP_LEVEL_MIX).toHaveLength(5);
    expect(HEATMAP_LEVEL_MIX[0]).toBe(0);
    expect(HEATMAP_LEVEL_MIX[4]).toBe(100);
    expect([...HEATMAP_LEVEL_MIX]).toEqual([...HEATMAP_LEVEL_MIX].sort((a, b) => a - b));
  });
});

describe('StreakHeatmap cells', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-05T10:00:00Z')); // a Monday, after 04:00 in any time zone
  });
  afterEach(() => vi.useRealTimers());

  it('colours each day by its level and keeps an accessible name per cell', () => {
    render(
      <I18nProvider initialLang="en">
        <StreakHeatmap
          data={[
            { date: '2026-10-05', duration: 30 * 60 }, // 30 min -> level 2
            { date: '2026-10-04', duration: 10 * 60 }, // 10 min -> level 1
            { date: '2026-10-03', duration: 150 * 60 }, // 150 min -> level 4
          ]}
        />
      </I18nProvider>,
    );

    const cell = (label: RegExp) => screen.getByRole('listitem', { name: label });
    expect(cell(/Mon, Oct 5: 30 min of focus/)).toHaveAttribute('data-level', '2');
    expect(cell(/Sun, Oct 4: 10 min of focus/)).toHaveAttribute('data-level', '1');
    expect(cell(/Sat, Oct 3: 150 min of focus/)).toHaveAttribute('data-level', '4');
    expect(cell(/Fri, Oct 2: no focus/)).toHaveAttribute('data-level', '0');

    // scale: no fill for level 0, a growing share of the accent colour above it
    expect(cell(/Fri, Oct 2/).style.background).toContain('var(--surface-raised)');
    expect(cell(/Sat, Oct 3/).style.background).toContain('100%');
    expect(cell(/Mon, Oct 5/).style.background).toContain('55%');
  });

  it('does not render cells for days that have not happened yet', () => {
    render(
      <I18nProvider initialLang="en">
        <StreakHeatmap data={[]} />
      </I18nProvider>,
    );
    expect(screen.queryByRole('listitem', { name: /Tue, Oct 6/ })).not.toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Mon, Oct 5/ })).toBeInTheDocument();
  });
});
