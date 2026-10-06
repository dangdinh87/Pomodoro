import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { DefaultSceneCard, GalleryCard } from './scene-card';

const renderIn = (ui: React.ReactElement, lang: Lang = 'en') => render(<I18nProvider initialLang={lang}>{ui}</I18nProvider>);

describe('scene cards', () => {
  it('marks the card in use with a label and a frame, not by colour alone', () => {
    const { container } = renderIn(<DefaultSceneCard label="Cream paper" followsLabel="Follows timer" selected onSelect={() => {}} />);

    const card = screen.getByRole('button', { name: 'Cream paper' });
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(card).toHaveTextContent('In use');
    expect(container.querySelector('[data-slot="selected-frame"]')).not.toBeNull();
  });

  it('shows no label or frame on a card that is not in use', () => {
    const { container } = renderIn(<DefaultSceneCard label="Cream paper" followsLabel="Follows timer" selected={false} onSelect={() => {}} />);

    const card = screen.getByRole('button', { name: 'Cream paper' });
    expect(card).toHaveAttribute('aria-pressed', 'false');
    expect(card).not.toHaveTextContent('In use');
    expect(container.querySelector('[data-slot="selected-frame"]')).toBeNull();
  });

  it.each([
    ['vi', 'Đang dùng'],
    ['ja', '使用中'],
  ] as const)('says "In use" in %s', (lang, text) => {
    renderIn(<GalleryCard label="x" selected onSelect={() => {}}>{null}</GalleryCard>, lang);
    expect(screen.getByRole('button', { name: 'x' })).toHaveTextContent(text);
  });

  it('calls onSelect when the card is pressed', () => {
    const onSelect = vi.fn();
    renderIn(<DefaultSceneCard label="Cream paper" followsLabel="Follows timer" selected={false} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cream paper' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('radio mode (clock picker) is a radio with roving tabindex, not a pressed toggle', () => {
    const buttonRef = vi.fn();
    renderIn(
      <div role="radiogroup" aria-label="clock styles">
        <GalleryCard label="Analog" selected onSelect={() => {}} radio={{ tabIndex: 0, onKeyDown: () => {}, buttonRef }}>
          {null}
        </GalleryCard>
        <GalleryCard label="Flip" selected={false} onSelect={() => {}} radio={{ tabIndex: -1, onKeyDown: () => {}, buttonRef }}>
          {null}
        </GalleryCard>
      </div>,
    );

    const analog = screen.getByRole('radio', { name: 'Analog' });
    const flip = screen.getByRole('radio', { name: 'Flip' });
    expect(analog).toHaveAttribute('aria-checked', 'true');
    expect(analog).not.toHaveAttribute('aria-pressed');
    expect(analog).toHaveAttribute('tabindex', '0');
    expect(flip).toHaveAttribute('aria-checked', 'false');
    expect(flip).toHaveAttribute('tabindex', '-1');
    expect(buttonRef).toHaveBeenCalled();
  });
});
