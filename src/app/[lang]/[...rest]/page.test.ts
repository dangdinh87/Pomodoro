import { getT } from '@/lib/server-translations';
import { generateMetadata } from './page';

describe('404 for an unknown path', () => {
  it.each(['en', 'vi', 'ja'] as const)('has its tab title in %s', async (lang) => {
    const meta = await generateMetadata({ params: Promise.resolve({ lang }) });
    expect(meta.title).toBe(getT(lang)('notFound.title'));
  });
});
