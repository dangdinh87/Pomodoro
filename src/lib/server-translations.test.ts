import enDict from '@/i18n/locales/en.json';
import viDict from '@/i18n/locales/vi.json';
import jaDict from '@/i18n/locales/ja.json';
import { getT } from './server-translations';

const KEY = 'landing.faq.items.q1.question';
const pick = (d: unknown) => KEY.split('.').reduce<unknown>((a, p) => (a as Record<string, unknown> | undefined)?.[p], d);

describe('server-translations', () => {
  it('translates into exactly the language it is given', () => {
    expect(getT('en')(KEY)).toBe(pick(enDict));
    expect(getT('vi')(KEY)).toBe(pick(viDict));
    expect(getT('ja')(KEY)).toBe(pick(jaDict));
    expect(pick(viDict)).not.toBe(pick(enDict));
  });

  it('does not depend on the request: no cookie, no header', () => {
    // Called outside any request scope (this test), and with no mock of next/headers
    expect(getT('vi')(KEY)).toBe(pick(viDict));
  });

  it('falls back to the key itself when it exists nowhere', () => {
    expect(getT('vi')('does.not.exist')).toBe('does.not.exist');
  });

  it('returns the key for a path that points at a section, not a string', () => {
    expect(getT('en')('landing.faq')).toBe('landing.faq');
  });
});
