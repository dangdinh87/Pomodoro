import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/auth/providers', () => ({ getGoogleCredentials: () => null }));
vi.mock('@/features/app-shell/app-home-client-only', async () => {
  const { AppHomeSkeleton } = await import('@/features/app-shell/app-home-skeleton');
  return { AppHomeClientOnly: () => <AppHomeSkeleton /> };
});
// Server sections have their own tests; here only that the page hands them the route's language
vi.mock('@/components/landing/FeaturesSSR', () => ({ FeaturesSSR: ({ lang }: { lang: string }) => <p>features-{lang}</p> }));
vi.mock('@/components/landing/HowItWorks', () => ({ HowItWorks: ({ lang }: { lang: string }) => <p>how-{lang}</p> }));
vi.mock('@/components/landing/FAQ', () => ({ FAQ: ({ lang }: { lang: string }) => <p>faq-{lang}</p> }));
vi.mock('@/components/landing/Footer', () => ({ Footer: ({ lang }: { lang: string }) => <p>footer-{lang}</p> }));

import { SITE_URL } from '@/config/site';
import { getT } from '@/lib/server-translations';
import { jsonLdOf, typesOf } from '@/test-utils/json-ld';
import HomePage, { generateMetadata } from './page';

const params = (lang: string) => ({ params: Promise.resolve({ lang }) });
const render = async (lang: string) => renderToStaticMarkup(await HomePage(params(lang)));

describe('home page server HTML', () => {
  it.each([
    ['en', 'Free Pomodoro timer online'],
    ['vi', 'Đồng hồ Pomodoro online miễn phí'],
    ['ja', '無料ポモドーロタイマー'],
  ])('has exactly one H1 in %s, and the 25:00 card for LCP', async (lang, heading) => {
    const html = await render(lang);
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain('25:00');
  });

  it('renders the H1 before the app, visually hidden so it never shifts the layout', async () => {
    const html = await render('en');
    expect(html.indexOf('<h1')).toBeLessThan(html.indexOf('app-home-skeleton'));
    expect(html).toMatch(/<h1 class="sr-only">/);
  });

  it('puts the SEO content in the HTML for everyone, in the route language', async () => {
    const html = await render('vi');
    expect(html).toContain('features-vi');
    expect(html).toContain('how-vi');
    expect(html).toContain('faq-vi');
    expect(html).toContain('footer-vi');
    expect(html).toContain('"@type":"FAQPage"');
  });

  it.each(['en', 'vi', 'ja'] as const)('describes the app once, as a free WebApplication in %s, plus the FAQ in %s', async (lang) => {
    const html = await render(lang);
    expect(typesOf(html)).toEqual(['WebApplication', 'FAQPage']);
    const [app, faq] = jsonLdOf(html) as [Record<string, unknown>, { inLanguage: string; mainEntity: { name: string }[] }];
    const url = lang === 'en' ? SITE_URL : `${SITE_URL}/${lang}`;
    expect(app).toMatchObject({
      url,
      inLanguage: lang,
      applicationCategory: 'EducationalApplication',
      offers: { price: '0' },
    });
    expect(faq.inLanguage).toBe(lang);
    expect(faq.mainEntity).toHaveLength(8);
    expect(faq.mainEntity[0].name).toBe(getT(lang)('site.faq.q1.q'));
  });

  it('does not depend on the visitor: no session, cookie or header is read', async () => {
    // Nothing from next/headers or the auth session is mocked: a call would throw outside a request
    await expect(HomePage(params('en'))).resolves.toBeTruthy();
  });
});

describe('home page metadata', () => {
  it.each([
    ['en', SITE_URL],
    ['vi', `${SITE_URL}/vi`],
    ['ja', `${SITE_URL}/ja`],
  ])('is canonical to its own URL in %s', async (lang, canonical) => {
    const meta = await generateMetadata(params(lang));
    expect(meta.alternates?.canonical).toBe(canonical);
    expect(meta.openGraph?.url).toBe(canonical);
  });

  it.each([
    ['en', 'Pomodoro Timer Online – Free, No Signup | Study Bro'],
    ['vi', 'Đồng hồ Pomodoro online miễn phí – Hẹn giờ học tập | Study Bro'],
    ['ja', 'ポモドーロタイマー（無料・登録不要）| Study Bro'],
  ])('has the %s title, absolute so the brand is not added twice', async (lang, title) => {
    const meta = await generateMetadata(params(lang));
    expect(meta.title).toEqual({ absolute: title });
    expect(meta.description).toBe(getT(lang as 'en')('site.meta.home.description'));
  });

  it('lists every language and x-default on the home, and drops the keywords tag', async () => {
    const meta = await generateMetadata(params('vi'));
    expect(meta.alternates?.languages).toEqual({
      en: SITE_URL,
      vi: `${SITE_URL}/vi`,
      ja: `${SITE_URL}/ja`,
      'x-default': SITE_URL,
    });
    expect(meta).not.toHaveProperty('keywords');
  });
});
