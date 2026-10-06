import { firstSupportedLang, isLang, readLangCookie } from './negotiate-locale';

describe('firstSupportedLang', () => {
  it('is null when nothing is supported or the list is empty', () => {
    expect(firstSupportedLang([])).toBeNull();
    expect(firstSupportedLang(['fr-FR', 'de'])).toBeNull();
  });

  it('matches on the primary subtag, case-insensitively', () => {
    expect(firstSupportedLang(['vi-VN'])).toBe('vi');
    expect(firstSupportedLang(['JA-jp'])).toBe('ja');
    expect(firstSupportedLang(['en-US'])).toBe('en');
  });

  it('keeps the order of the list: the first supported one wins', () => {
    expect(firstSupportedLang(['fr', 'vi', 'en'])).toBe('vi');
    expect(firstSupportedLang(['en-GB', 'vi'])).toBe('en');
  });
});

describe('readLangCookie', () => {
  it('reads the saved language among other cookies', () => {
    expect(readLangCookie('a=1; app.lang=ja; b=2')).toBe('ja');
    expect(readLangCookie('app.lang=vi')).toBe('vi');
  });

  it('is null when missing or unsupported', () => {
    expect(readLangCookie('')).toBeNull();
    expect(readLangCookie('theme=dark')).toBeNull();
    expect(readLangCookie('app.lang=fr')).toBeNull();
    expect(readLangCookie('xapp.lang=vi')).toBeNull();
  });
});

describe('isLang', () => {
  it('accepts only supported codes', () => {
    expect(isLang('vi')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });
});
