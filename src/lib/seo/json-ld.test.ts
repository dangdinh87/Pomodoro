import { SITE_URL } from '@/config/site';
import { SUPPORTED_LANGS } from '@/lib/i18n/negotiate-locale';
import { getT } from '@/lib/server-translations';
import {
  faqPageJsonLd,
  howToJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  webApplicationJsonLd,
  webSiteJsonLd,
} from './json-ld';
import { pageUrl } from './urls';

describe('organizationJsonLd', () => {
  it('names the brand with its icon as the logo, on the canonical origin', () => {
    expect(organizationJsonLd()).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Study Bro',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 },
    });
  });
});

describe('webSiteJsonLd', () => {
  it('describes the whole site once and lists the languages it is published in', () => {
    expect(webSiteJsonLd()).toMatchObject({
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Study Bro',
      url: SITE_URL,
      inLanguage: ['en', 'vi', 'ja'],
      publisher: { '@id': `${SITE_URL}/#organization` },
    });
  });
});

describe('webApplicationJsonLd', () => {
  it.each(SUPPORTED_LANGS)('is the free app of the %s home page, in that language', (locale) => {
    const t = getT(locale);
    const data = webApplicationJsonLd(locale, t);
    expect(data).toMatchObject({
      '@type': 'WebApplication',
      name: 'Study Bro',
      url: pageUrl(locale, '/'),
      inLanguage: locale,
      applicationCategory: 'EducationalApplication',
      description: t('site.meta.home.description'),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isAccessibleForFree: true,
    });
    expect(data.featureList).toHaveLength(7);
    expect(data.featureList[0]).toBe(t('site.features.timer.title'));
  });

  it('gives each language its own @id so the three entities never merge', () => {
    const ids = SUPPORTED_LANGS.map((locale) => webApplicationJsonLd(locale, getT(locale))['@id']);
    expect(new Set(ids).size).toBe(3);
  });
});

describe('faqPageJsonLd', () => {
  it('turns the visible Q&A into Question/Answer pairs of that language', () => {
    const data = faqPageJsonLd('vi', [{ question: 'Hỏi?', answer: 'Đáp.' }]);
    expect(data).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      url: `${SITE_URL}/vi`,
      inLanguage: 'vi',
      mainEntity: [{ '@type': 'Question', name: 'Hỏi?', acceptedAnswer: { '@type': 'Answer', text: 'Đáp.' } }],
    });
  });
});

describe('howToJsonLd', () => {
  it('numbers the steps, strips markdown bold and names the guide URL in that language', () => {
    const data = howToJsonLd('ja', { name: 'N', description: 'D', steps: ['**Pick** a task', 'Start'] });
    expect(data).toMatchObject({
      '@type': 'HowTo',
      name: 'N',
      description: 'D',
      url: `${SITE_URL}/ja/guide`,
      inLanguage: 'ja',
      step: [
        { '@type': 'HowToStep', position: 1, text: 'Pick a task' },
        { '@type': 'HowToStep', position: 2, text: 'Start' },
      ],
    });
  });
});

describe('serializeJsonLd', () => {
  it('round-trips and has no undefined holes', () => {
    for (const lang of SUPPORTED_LANGS) {
      const data = webApplicationJsonLd(lang, getT(lang));
      expect(JSON.parse(serializeJsonLd(data))).toEqual(JSON.parse(JSON.stringify(data)));
    }
  });

  it('escapes < so text can never close the script tag (Next JSON-LD guide)', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });
});
