import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { ClockStylePicker } from './clock-style-picker';
import { CLOCK_STYLES, type SelectableClockType } from './clock-registry';

// The real clocks are covered by their own tests; the picker only frames them.
vi.mock('./analog-clock', () => ({ AnalogClock: () => <div data-testid="clock" /> }));
vi.mock('./digital-clock', () => ({ DigitalClock: () => <div data-testid="clock" /> }));
vi.mock('./flip-clock', () => ({ FlipClock: () => <div data-testid="clock" /> }));
vi.mock('./three-clock', () => ({ ThreeClock: () => <div data-testid="clock" /> }));

const renderPicker = (value: SelectableClockType, onChange = vi.fn(), lang: Lang = 'en') => {
  render(
    <I18nProvider initialLang={lang}>
      <p id="label">Clock style</p>
      <ClockStylePicker value={value} onChange={onChange} workMinutes={25} warn labelledBy="label" />
    </I18nProvider>,
  );
  return onChange;
};

describe('ClockStylePicker', () => {
  it('is one radio group with a card per clock style', () => {
    renderPicker('digital');

    expect(screen.getByRole('radiogroup', { name: 'Clock style' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(CLOCK_STYLES.length);
  });

  it('marks only the chosen style, with an "In use" label and the sticker frame', () => {
    renderPicker('analog');

    const analog = screen.getByRole('radio', { name: 'Analog' });
    expect(analog).toHaveAttribute('aria-checked', 'true');
    expect(analog).toHaveTextContent('In use');
    expect(analog).toHaveAttribute('tabindex', '0');

    const digital = screen.getByRole('radio', { name: 'Digital' });
    expect(digital).toHaveAttribute('aria-checked', 'false');
    expect(digital).not.toHaveTextContent('In use');
    expect(digital).toHaveAttribute('tabindex', '-1');
    expect(document.querySelectorAll('[data-slot="selected-frame"]')).toHaveLength(1);
  });

  it('flags 3D styles with a badge', () => {
    renderPicker('digital');

    expect(screen.getByRole('radio', { name: 'Tomato' })).toHaveTextContent('3D');
    expect(screen.getByRole('radio', { name: 'Digital' })).not.toHaveTextContent('3D');
  });

  it('picks a style on click and moves with the arrow keys', () => {
    const onChange = renderPicker('digital');

    fireEvent.click(screen.getByRole('radio', { name: 'Flip' }));
    expect(onChange).toHaveBeenLastCalledWith('flip');

    fireEvent.keyDown(screen.getByRole('radio', { name: 'Digital' }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('analog');

    fireEvent.keyDown(screen.getByRole('radio', { name: 'Digital' }), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(CLOCK_STYLES.at(-1)!.id);
  });

  it.each([
    ['vi', 'Đang dùng'],
    ['ja', '使用中'],
  ] as const)('says "In use" in %s', (lang, text) => {
    renderPicker('digital', vi.fn(), lang);

    expect(screen.getAllByText(text)).toHaveLength(1);
  });
});
