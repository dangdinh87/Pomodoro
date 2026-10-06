import enDict from '@/i18n/locales/en.json';
import viDict from '@/i18n/locales/vi.json';
import jaDict from '@/i18n/locales/ja.json';
import { loadMessages } from './messages';

describe('loadMessages', () => {
  it('returns the dictionary of the language asked for, and only that one', async () => {
    expect(await loadMessages('en')).toEqual(enDict);
    expect(await loadMessages('vi')).toEqual(viDict);
    expect(await loadMessages('ja')).toEqual(jaDict);
  });
});
