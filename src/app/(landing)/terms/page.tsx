import type { Metadata } from 'next';
import { LegalPage, type LegalSectionSpec } from '@/components/landing/legal-page';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { getT } from '@/lib/server-translations';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return buildPageMetadata({
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

export default async function TermsPage() {
  return <LegalPage t={await getT()} ns="terms" specs={SPECS} />;
}
