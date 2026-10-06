import { readFileSync } from 'node:fs';
import path from 'node:path';
import { act, render, renderHook, screen } from '@testing-library/react';
import { useI18n, I18nProvider, type Messages } from './i18n-context';
import { I18nProvider as TestProvider } from '@/test-utils/i18n';
import en from '@/i18n/locales/en.json';
import viMessages from '@/i18n/locales/vi.json';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const MESSAGES: Messages = { greeting: 'Hello {name}', nested: { deep: 'Deep value' }, count: '{n} items' };

const wrapper = (locale: 'en' | 'vi' | 'ja', messages: Messages = MESSAGES) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <I18nProvider locale={locale} messages={messages}>
        {children}
      </I18nProvider>
    );
  };

function setUrl(url: string) {
  window.history.pushState({}, '', url);
}

describe('I18nProvider', () => {
  beforeEach(() => {
    push.mockClear();
    document.cookie = 'app.lang=; max-age=0; path=/';
    setUrl('/');
  });

  it('takes the language from the locale prop', () => {
    const { result } = renderHook(() => useI18n(), { wrapper: wrapper('vi') });
    expect(result.current.lang).toBe('vi');
  });

  it('translates from the messages it was given, with variables', () => {
    const { result } = renderHook(() => useI18n(), { wrapper: wrapper('en') });
    expect(result.current.t('nested.deep')).toBe('Deep value');
    expect(result.current.t('greeting', { name: 'Bro' })).toBe('Hello Bro');
    expect(result.current.t('count', { n: 3 })).toBe('3 items');
    expect(result.current.t('greeting', {})).toBe('Hello {name}');
  });

  it('renders the key for anything its single dictionary lacks: no hidden fallback to another language', () => {
    const { result } = renderHook(() => useI18n(), { wrapper: wrapper('vi', { onlyVi: 'Chỉ có tiếng Việt' }) });
    expect(result.current.t('onlyVi')).toBe('Chỉ có tiếng Việt');
    expect(result.current.t('timer.title')).toBe('timer.title');
    expect(result.current.t('nested')).toBe('nested');
    expect(result.current.t('toString')).toBe('toString');
  });

  it('uses the real dictionary of the language it is given (test helper)', () => {
    function Probe() {
      const { t } = useI18n();
      return <p>{t('common.cancel')}</p>;
    }
    const { rerender } = render(
      <TestProvider initialLang="en">
        <Probe />
      </TestProvider>,
    );
    expect(screen.getByText(en.common.cancel)).toBeInTheDocument();
    rerender(
      <TestProvider initialLang="vi">
        <Probe />
      </TestProvider>,
    );
    expect(screen.getByText(viMessages.common.cancel)).toBeInTheDocument();
  });

  describe('setLang', () => {
    it('opens the same page under the other prefix, keeping the query (?panel=)', () => {
      setUrl('/guide?panel=tasks');
      const { result } = renderHook(() => useI18n(), { wrapper: wrapper('en') });
      act(() => result.current.setLang('vi'));
      expect(push).toHaveBeenCalledWith('/vi/guide?panel=tasks');
    });

    it('goes from a prefixed page to another language, and back to unprefixed English', () => {
      setUrl('/vi?panel=timer');
      const { result } = renderHook(() => useI18n(), { wrapper: wrapper('vi') });
      act(() => result.current.setLang('ja'));
      expect(push).toHaveBeenLastCalledWith('/ja?panel=timer');
      act(() => result.current.setLang('en'));
      expect(push).toHaveBeenLastCalledWith('/?panel=timer');
    });

    it('keeps the hash', () => {
      setUrl('/ja/guide#shortcuts');
      const { result } = renderHook(() => useI18n(), { wrapper: wrapper('ja') });
      act(() => result.current.setLang('en'));
      expect(push).toHaveBeenCalledWith('/guide#shortcuts');
    });

    it('writes the language cookie, because the visitor chose it on purpose', () => {
      const { result } = renderHook(() => useI18n(), { wrapper: wrapper('en') });
      act(() => result.current.setLang('ja'));
      expect(document.cookie).toContain('app.lang=ja');
    });

    it('does not navigate when the language does not change', () => {
      const { result } = renderHook(() => useI18n(), { wrapper: wrapper('en') });
      act(() => result.current.setLang('en'));
      expect(push).not.toHaveBeenCalled();
    });
  });

  it('never writes the cookie by itself', () => {
    renderHook(() => useI18n(), { wrapper: wrapper('vi') });
    expect(document.cookie).not.toContain('app.lang');
  });

  it('does not import the locale files: the client bundle holds no dictionary', () => {
    const source = readFileSync(path.resolve(process.cwd(), 'src/contexts/i18n-context.tsx'), 'utf8');
    expect(source).not.toMatch(/i18n\/locales/);
    expect(source).not.toMatch(/lib\/i18n\/messages/);
  });
});
