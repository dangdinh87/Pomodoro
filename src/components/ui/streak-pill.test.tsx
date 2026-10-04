import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { StreakPill } from './streak-pill';

const renderIn = (lang: Lang, count: number) =>
  render(
    <I18nProvider initialLang={lang}>
      <StreakPill count={count} />
    </I18nProvider>,
  );

describe('StreakPill', () => {
  it.each([
    ['en', '5-day streak'],
    ['vi', 'Chuỗi 5 ngày'],
    ['ja', '5日連続'],
  ] as const)('names itself in %s', (lang, label) => {
    renderIn(lang, 5);
    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('shows the count next to a flame, on candy butter with on-accent text', () => {
    const { container } = renderIn('en', 12);
    const pill = screen.getByRole('img');
    expect(pill).toHaveTextContent('12');
    expect(pill).toHaveClass('bg-candy-butter', 'text-on-accent', 'border-outline');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
