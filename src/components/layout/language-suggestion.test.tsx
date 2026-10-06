import { renderToString } from 'react-dom/server';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { LanguageSuggestion } from './language-suggestion';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

function setBrowserLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true });
  Object.defineProperty(window.navigator, 'language', { value: languages[0], configurable: true });
}

const renderOn = (page: Lang) =>
  render(
    <I18nProvider initialLang={page}>
      <LanguageSuggestion />
    </I18nProvider>,
  );

describe('LanguageSuggestion', () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
    document.cookie = 'app.lang=; max-age=0; path=/';
    window.history.pushState({}, '', '/');
    setBrowserLanguages(['en-US', 'en']);
  });

  it('offers Vietnamese, in Vietnamese, to a Vietnamese browser on the English page', () => {
    setBrowserLanguages(['vi-VN', 'vi', 'en']);
    renderOn('en');
    const region = screen.getByRole('region', { name: 'Trang này cũng có bản Tiếng Việt.' });
    expect(region).toHaveAttribute('lang', 'vi');
    expect(screen.getByRole('button', { name: 'Xem bằng Tiếng Việt' })).toBeInTheDocument();
  });

  it('offers English on a Japanese page to an English browser', () => {
    renderOn('ja');
    expect(screen.getByRole('button', { name: 'Switch to English' })).toBeInTheDocument();
  });

  it('shows nothing when the page already is the preferred language', () => {
    setBrowserLanguages(['vi-VN']);
    renderOn('vi');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('shows nothing when no browser language is supported and nothing was picked', () => {
    setBrowserLanguages(['fr-FR']);
    renderOn('en');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('prefers the language picked on purpose (cookie) over the browser list', () => {
    setBrowserLanguages(['vi-VN']);
    document.cookie = 'app.lang=ja; path=/';
    renderOn('en');
    expect(screen.getByRole('button', { name: '日本語で見る' })).toBeInTheDocument();
  });

  it('is not part of the server HTML: crawlers and first paint never see it', () => {
    setBrowserLanguages(['vi-VN']);
    const html = renderToString(
      <I18nProvider initialLang="en">
        <LanguageSuggestion />
      </I18nProvider>,
    );
    expect(html).not.toContain('Tiếng Việt');
    expect(html).toBe('');
  });

  it('switches to the offered language on the same page, remembers the choice in the cookie and hides', async () => {
    setBrowserLanguages(['vi-VN']);
    window.history.pushState({}, '', '/guide?panel=tasks');
    renderOn('en');
    await userEvent.click(screen.getByRole('button', { name: 'Xem bằng Tiếng Việt' }));

    expect(push).toHaveBeenCalledWith('/vi/guide?panel=tasks');
    expect(document.cookie).toContain('app.lang=vi');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    // not a "no thanks": later visits may still suggest the chosen language on another URL
    expect(localStorage.getItem('app.langSuggestion.dismissed')).toBeNull();
  });

  it('is dismissible, and stays dismissed on the next visit', async () => {
    setBrowserLanguages(['ja']);
    const first = renderOn('en');
    await userEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(localStorage.getItem('app.langSuggestion.dismissed')).toBe('1');
    first.unmount();

    renderOn('en');
    await act(async () => {});
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('still works when storage is blocked', async () => {
    setBrowserLanguages(['vi']);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    renderOn('en');
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });

  describe('layout: an in-flow bar that never covers the page', () => {
    const root = document.documentElement;
    const barHeight = (px: number) => vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(px);

    it('is not fixed or absolute (a floating card always covered something: mascot, H1, article text)', () => {
      setBrowserLanguages(['vi-VN']);
      renderOn('en');
      const bar = screen.getByRole('region');
      expect(bar.className).not.toMatch(/\b(fixed|absolute|sticky)\b/);
      // a narrow screen wraps the buttons under the text instead of squeezing the text
      expect(bar.querySelector('.flex-wrap')).not.toBeNull();
    });

    it('publishes its height as --lang-banner-h while shown, and withdraws it when dismissed', async () => {
      barHeight(72);
      setBrowserLanguages(['vi-VN']);
      renderOn('en');
      expect(root.style.getPropertyValue('--lang-banner-h')).toBe('72px');

      await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
      expect(root.style.getPropertyValue('--lang-banner-h')).toBe('');
    });

    it('withdraws the height when the component goes away', () => {
      barHeight(56);
      setBrowserLanguages(['vi-VN']);
      const { unmount } = renderOn('en');
      expect(root.style.getPropertyValue('--lang-banner-h')).toBe('56px');
      unmount();
      expect(root.style.getPropertyValue('--lang-banner-h')).toBe('');
    });
  });
});
