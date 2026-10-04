import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider, type Lang } from '@/contexts/i18n-context';
import { TomoBubble } from './tomo-bubble';

const wrap = (ui: React.ReactElement, lang: Lang = 'en') => <I18nProvider initialLang={lang}>{ui}</I18nProvider>;

beforeEach(() => window.sessionStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('TomoBubble', () => {
  it('shows Tomo with the face and the message', () => {
    const { container } = render(wrap(<TomoBubble face="sleepy">Time for a stretch.</TomoBubble>));
    expect(container.querySelector('svg[data-face="sleepy"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Time for a stretch\./ })).toBeInTheDocument();
  });

  it('hides the bubble on press, keeps Tomo, and calls onDismiss once', async () => {
    const onDismiss = vi.fn();
    const { container } = render(wrap(<TomoBubble onDismiss={onDismiss}>Hello!</TomoBubble>));
    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('svg[data-face]')).not.toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('can be dismissed with the keyboard', async () => {
    render(wrap(<TomoBubble>Hello!</TomoBubble>));
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('remembers the dismissal per id for the browser session', async () => {
    const first = render(wrap(<TomoBubble id="greeting">Hello!</TomoBubble>));
    await userEvent.click(screen.getByRole('button'));
    expect(window.sessionStorage.getItem('tomo-bubble:dismissed:greeting')).toBe('1');
    first.unmount();

    const again = render(wrap(<TomoBubble id="greeting">Hello!</TomoBubble>));
    expect(screen.queryByRole('button')).toBeNull();
    again.unmount();

    render(wrap(<TomoBubble id="streak">Keep it up!</TomoBubble>));
    expect(screen.getByRole('button', { name: /Keep it up!/ })).toBeInTheDocument();
  });

  it('without an id the bubble comes back on the next mount', async () => {
    const first = render(wrap(<TomoBubble>Hello!</TomoBubble>));
    await userEvent.click(screen.getByRole('button'));
    first.unmount();
    render(wrap(<TomoBubble>Hello!</TomoBubble>));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('survives blocked sessionStorage (reads and writes throw)', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(wrap(<TomoBubble id="greeting">Hello!</TomoBubble>));
    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('button')).toBeNull();
  });

  it.each([
    ['en', 'Hide this message'],
    ['vi', 'Ẩn lời nhắn này'],
    ['ja', 'このメッセージを閉じる'],
  ] as const)('says how to dismiss it in %s', (lang, hint) => {
    render(wrap(<TomoBubble>Hello!</TomoBubble>, lang));
    expect(screen.getByRole('button')).toHaveAccessibleName(`Hello! ${hint}`);
  });
});
