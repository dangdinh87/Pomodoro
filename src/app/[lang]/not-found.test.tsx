import { render, screen } from '@testing-library/react';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import NotFound from './not-found';

const renderIn = (lang: Lang = 'en') =>
  render(
    <I18nProvider initialLang={lang}>
      <NotFound />
    </I18nProvider>,
  );

describe('404 page', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('shows a sleepy Tomo with an accessible title, one h1 and one way back to the timer', () => {
    renderIn();

    const tomo = screen.getByTitle('Tomo the tomato mascot, fast asleep').closest('svg');
    expect(tomo).toHaveAttribute('role', 'img');
    expect(tomo).toHaveAttribute('data-face', 'sleepy');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Back to timer' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Read the guide' })).toHaveAttribute('href', '/guide');
  });

  it.each([
    ['vi', '/vi', '/vi/guide'],
    ['ja', '/ja', '/ja/guide'],
  ] as const)('is translated and keeps the visitor in %s', (lang, home, guide) => {
    renderIn(lang);

    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toBe('Page not found');
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([home, guide]);
  });

  it('follows the saved theme even though it renders outside the app providers', () => {
    localStorage.setItem('theme', 'dark');
    renderIn();

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('is light when nothing was saved', () => {
    renderIn();

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
});
