import { LANG_SUGGESTION_COPY, preferredLang, suggestedLang } from './lang-suggestion';

const base = { current: 'en' as const, cookie: '', languages: [] as string[], dismissed: false };

describe('preferredLang', () => {
  it('lets a language picked on purpose win over the browser list', () => {
    expect(preferredLang('app.lang=ja', ['vi-VN'])).toBe('ja');
  });

  it('falls back to the first supported browser language', () => {
    expect(preferredLang('', ['fr', 'vi-VN', 'en'])).toBe('vi');
    expect(preferredLang('theme=dark', ['ja'])).toBe('ja');
  });

  it('is unknown when nothing matches', () => {
    expect(preferredLang('', ['fr', 'de'])).toBeNull();
    expect(preferredLang('', [])).toBeNull();
  });
});

describe('suggestedLang', () => {
  it('offers the preferred language when the page is in another one', () => {
    expect(suggestedLang({ ...base, languages: ['vi-VN'] })).toBe('vi');
    expect(suggestedLang({ ...base, current: 'vi', languages: ['en-US'] })).toBe('en');
    expect(suggestedLang({ ...base, current: 'ja', cookie: 'app.lang=vi' })).toBe('vi');
  });

  it('stays quiet when the page already matches', () => {
    expect(suggestedLang({ ...base, current: 'vi', languages: ['vi'] })).toBeNull();
    expect(suggestedLang({ ...base, cookie: 'app.lang=en', languages: ['vi'] })).toBeNull();
  });

  it('stays quiet when the preference is unknown', () => {
    expect(suggestedLang({ ...base, languages: ['fr'] })).toBeNull();
  });

  it('stays quiet once dismissed', () => {
    expect(suggestedLang({ ...base, languages: ['vi'], dismissed: true })).toBeNull();
  });
});

describe('LANG_SUGGESTION_COPY', () => {
  it('has a native message, action and dismiss label for every language', () => {
    for (const lang of ['en', 'vi', 'ja'] as const) {
      const copy = LANG_SUGGESTION_COPY[lang];
      expect(copy.message).not.toBe('');
      expect(copy.action).not.toBe('');
      expect(copy.dismiss).not.toBe('');
    }
    expect(LANG_SUGGESTION_COPY.vi.action).toContain('Tiếng Việt');
    expect(LANG_SUGGESTION_COPY.ja.action).toContain('日本語');
  });
});
