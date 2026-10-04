import type { Metadata } from 'next';
import { LegalPage, type LegalSectionSpec } from '@/components/landing/legal-page';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { getT } from '@/lib/server-translations';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await routeLang(params);
  const t = getT(locale);
  return buildPageMetadata({
    locale,
    path: '/terms',
    title: t('site.meta.terms.title'),
    description: t('site.meta.terms.description'),
  });
}

const SPECS: LegalSectionSpec[] = [
  { id: 'service', intro: true },
  { id: 'use', intro: true, list: 4 },
  { id: 'content', intro: true },
  { id: 'thirdParty', intro: true },
  { id: 'availability', intro: true },
  { id: 'liability', intro: true, list: 2 },
  { id: 'ending', intro: true },
  { id: 'changes', intro: true },
];

export default async function TermsPage({ params }: LangParams) {
  return <LegalPage t={getT(await routeLang(params))} ns="terms" specs={SPECS} />;
}
