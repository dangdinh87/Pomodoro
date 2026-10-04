import { notFound } from 'next/navigation';
import { routeLang } from './route-lang';

describe('routeLang', () => {
  it('resolves a supported language from the route params', async () => {
    expect(await routeLang(Promise.resolve({ lang: 'vi' }))).toBe('vi');
    expect(await routeLang(Promise.resolve({ lang: 'en' }))).toBe('en');
  });

  it('404s for anything else', async () => {
    await routeLang(Promise.resolve({ lang: 'fr' }));
    expect(notFound).toHaveBeenCalled();
  });
});
