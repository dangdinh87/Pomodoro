import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import { detectErrorLang, globalErrorCopy } from './global-error-copy';

describe('detectErrorLang', () => {
  it('follows the language prefix of the URL', () => {
    expect(detectErrorLang('/vi')).toBe('vi');
    expect(detectErrorLang('/ja/guide')).toBe('ja');
  });

  it('is English for unprefixed URLs, whatever else is known about the visitor', () => {
    expect(detectErrorLang('/')).toBe('en');
    expect(detectErrorLang('/guide')).toBe('en');
    expect(detectErrorLang('/fr/guide')).toBe('en');
  });
});

describe('globalErrorCopy', () => {
  // The page renders outside every provider, so it carries its own copy. Keep it
  // identical to the regular error boundary strings so users see one wording.
  it.each([
    ['en', en],
    ['vi', vi],
    ['ja', ja],
  ] as const)('matches errors.boundary in %s.json', (lang, locale) => {
    const boundary = locale.errors.boundary;
    const copy = globalErrorCopy(lang);
    expect(copy.title).toBe(boundary.title);
    expect(copy.retry).toBe(boundary.retry);
    expect(copy.goHome).toBe(boundary.goHome);
    expect(copy.reference('abc')).toBe(boundary.reference.replace('{digest}', 'abc'));
  });
});
