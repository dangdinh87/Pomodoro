const mockGet = jest.fn();
jest.mock('next/headers', () => ({
  cookies: () => ({ get: mockGet }),
}));

import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import { getServerLang, getServerTranslation, t } from './server-translations';

const KEY = 'landing.faq.items.q1.question';
const pick = (d: any) => KEY.split('.').reduce((a: any, p) => a?.[p], d);

describe('server-translations', () => {
  beforeEach(() => mockGet.mockReset());

  it('uses the cookie locale', () => {
    mockGet.mockReturnValue({ value: 'vi' });
    expect(getServerLang()).toBe('vi');
    expect(t(KEY)).toBe(pick(vi));
    mockGet.mockReturnValue({ value: 'ja' });
    expect(t(KEY)).toBe(pick(ja));
  });

  it('falls back to en for missing/invalid cookie', () => {
    mockGet.mockReturnValue(undefined);
    expect(t(KEY)).toBe(pick(en));
    mockGet.mockReturnValue({ value: 'fr' });
    expect(getServerLang()).toBe('en');
  });

  it('falls back to en per key, then to the key itself', () => {
    expect(getServerTranslation('does.not.exist', 'vi')).toBe('does.not.exist');
    expect(getServerTranslation(KEY, 'ja')).toBe(pick(ja));
  });

  it('defaults to en outside a request scope', () => {
    mockGet.mockImplementation(() => {
      throw new Error('outside request scope');
    });
    expect(getServerLang()).toBe('en');
  });
});
