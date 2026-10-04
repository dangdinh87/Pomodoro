import { notFound } from 'next/navigation';
import { isLang, type Lang } from './negotiate-locale';

/** The `params` prop of a page or layout under `app/[lang]`. */
export type LangParams = { params: Promise<{ lang: string }> };

/** The validated `[lang]` param. `generateStaticParams` + `dynamicParams = false` already 404 other values; this narrows the type. */
export async function routeLang(params: LangParams['params']): Promise<Lang> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return lang;
}
