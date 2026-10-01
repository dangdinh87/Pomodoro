const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: mockGet }),
}));

import enDict from '@/i18n/locales/en.json';
import viDict from '@/i18n/locales/vi.json';
import jaDict from '@/i18n/locales/ja.json';
import { getServerLang, getT } from './server-translations';

const KEY = 'landing.faq.items.q1.question';
const pick = (d: any) => KEY.split('.').reduce((a: any, p) => a?.[p], d);

describe('server-translations', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('uses the cookie locale', async () => {
    mockGet.mockReturnValue({ value: 'vi' });
    expect(await getServerLang()).toBe('vi');
    expect((await getT())(KEY)).toBe(pick(viDict));
    mockGet.mockReturnValue({ value: 'ja' });
    expect((await getT())(KEY)).toBe(pick(jaDict));
  });

  it('falls back to en for missing/invalid cookie', async () => {
    mockGet.mockReturnValue(undefined);
    expect((await getT())(KEY)).toBe(pick(enDict));
    mockGet.mockReturnValue({ value: 'fr' });
    expect(await getServerLang()).toBe('en');
  });

  it('falls back to en per key, then to the key itself', async () => {
    expect((await getT('vi'))('does.not.exist')).toBe('does.not.exist');
    expect((await getT('ja'))(KEY)).toBe(pick(jaDict));
  });

  it('defaults to en outside a request scope', async () => {
    mockGet.mockImplementation(() => {
      throw new Error('outside request scope');
    });
    expect(await getServerLang()).toBe('en');
  });
});
