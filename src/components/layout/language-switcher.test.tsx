import { render, screen } from '@testing-library/react';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { LanguageSwitcher } from './language-switcher';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('LanguageSwitcher', () => {
  it.each([
    ['en', 'Language', 'English'],
    ['vi', 'Ngôn ngữ', 'Tiếng Việt'],
    ['ja', '言語', '日本語'],
  ] as const)('is named for what it does, and shows the whole language name, in %s', (lang: Lang, name, shown) => {
    render(
      <I18nProvider initialLang={lang}>
        <LanguageSwitcher />
      </I18nProvider>,
    );
    const select = screen.getByRole('combobox', { name });
    expect(select).toHaveTextContent(shown);
  });

  it('grows with its text instead of cutting it (a fixed 140px showed "Tiếng…")', () => {
    render(
      <I18nProvider initialLang="vi">
        <LanguageSwitcher />
      </I18nProvider>,
    );
    const select = screen.getByRole('combobox');
    expect(select.className).toContain('min-w-44');
    expect(select.className).not.toContain('w-[140px]');
  });
});
