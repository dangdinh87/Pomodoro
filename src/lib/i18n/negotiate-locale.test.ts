import { isLang, negotiateLocale, normalizeLang } from './negotiate-locale';

describe('negotiateLocale', () => {
  it('defaults to en when header missing or empty', () => {
    expect(negotiateLocale(undefined)).toBe('en');
    expect(negotiateLocale(null)).toBe('en');
    expect(negotiateLocale('')).toBe('en');
  });

  it('matches primary subtag', () => {
    expect(negotiateLocale('vi-VN,vi;q=0.9')).toBe('vi');
    expect(negotiateLocale('ja-JP')).toBe('ja');
    expect(negotiateLocale('EN-us')).toBe('en');
  });

  it('honors q-values', () => {
    expect(negotiateLocale('en;q=0.5,ja;q=0.9')).toBe('ja');
    expect(negotiateLocale('fr,vi;q=0.8,en;q=0.7')).toBe('vi');
  });

  it('skips unsupported and q=0 languages', () => {
    expect(negotiateLocale('fr-FR,de')).toBe('en');
    expect(negotiateLocale('vi;q=0,ja;q=0.1')).toBe('ja');
  });

  it('tolerates malformed q', () => {
    expect(negotiateLocale('vi;q=abc,ja')).toBe('ja');
  });
});

describe('normalizeLang / isLang', () => {
  it('validates values', () => {
    expect(isLang('vi')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(normalizeLang('ja')).toBe('ja');
    expect(normalizeLang('xx')).toBe('en');
    expect(normalizeLang(undefined)).toBe('en');
  });
});
