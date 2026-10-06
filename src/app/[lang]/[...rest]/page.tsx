import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { getT } from '@/lib/server-translations';

/** The tab title of the 404, in the language of the URL ("This page could not be found | Study Bro"). */
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { title: getT(await routeLang(params))('notFound.title') };
}

/**
 * Any path that is not a page (`/vi/nope`, and `/nope` after the proxy rewrote it to `/en/nope`)
 * lands here so the 404 renders inside its language: `[lang]/not-found.tsx`, translated, with
 * links that stay in that language.
 */
export default function UnknownPage() {
  notFound();
}
