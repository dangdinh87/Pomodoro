import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider, type Lang } from '@/contexts/i18n-context';
import { SessionTomatoes } from './session-tomatoes';

const renderIn = (ui: React.ReactElement, lang: Lang = 'en') => render(<I18nProvider initialLang={lang}>{ui}</I18nProvider>);
const filled = (c: HTMLElement) => c.querySelectorAll('svg[data-filled="true"]').length;
const empty = (c: HTMLElement) => c.querySelectorAll('svg[data-filled="false"]').length;

describe('SessionTomatoes', () => {
  it('draws four tomatoes by default, filled for the completed sessions', () => {
    const { container } = renderIn(<SessionTomatoes completed={2} />);
    expect(filled(container)).toBe(2);
    expect(empty(container)).toBe(2);
  });

  it.each([
    [0, 0, 4],
    [1, 1, 3],
    [4, 4, 0],
  ])('completed=%i gives %i filled and %i empty', (completed, f, e) => {
    const { container } = renderIn(<SessionTomatoes completed={completed} />);
    expect(filled(container)).toBe(f);
    expect(empty(container)).toBe(e);
  });

  it('follows a custom total and never over- or under-fills', () => {
    const { container, rerender } = renderIn(<SessionTomatoes completed={9} total={6} />);
    expect(filled(container)).toBe(6);
    rerender(
      <I18nProvider initialLang="en">
        <SessionTomatoes completed={-3} total={3} />
      </I18nProvider>,
    );
    expect(filled(container)).toBe(0);
    expect(empty(container)).toBe(3);
  });

  it.each([
    ['en', 'Session 3 of 4'],
    ['vi', 'Phiên 3/4'],
    ['ja', 'セッション 3/4'],
  ] as const)('names the session the cycle is on in %s', (lang, label) => {
    renderIn(<SessionTomatoes completed={2} />, lang);
    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('stops at the last session once the cycle is full', () => {
    renderIn(<SessionTomatoes completed={4} />);
    expect(screen.getByRole('img', { name: 'Session 4 of 4' })).toBeInTheDocument();
  });
});
