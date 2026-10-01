import type { Metadata } from 'next';
import { LegalPage, type LegalSectionSpec } from '@/components/landing/legal-page';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { getT } from '@/lib/server-translations';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return buildPageMetadata({
    path: '/privacy',
    title: t('site.meta.privacy.title'),
    description: t('site.meta.privacy.description'),
  });
}

const SPECS: LegalSectionSpec[] = [
  { id: 'scope', intro: true },
  { id: 'collect', intro: true, list: 6, outro: true },
  { id: 'device', intro: true, list: 3 },
  { id: 'partners', intro: true, list: 5, outro: true },
  { id: 'use', intro: true, list: 3 },
  { id: 'choices', intro: true, list: 3, outro: true },
  { id: 'children', intro: true },
  { id: 'changes', intro: true },
];

export default async function PrivacyPage() {
  return <LegalPage t={await getT()} ns="privacy" specs={SPECS} />;
}
