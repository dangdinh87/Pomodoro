import { PAGE_UPDATED } from '@/lib/seo/pages';
import { DocLayout, P, UL, type DocSection } from './doc-layout';

export interface LegalSectionSpec {
  id: string;
  /** Optional lead paragraph (`<ns>.<id>.intro`). */
  intro?: boolean;
  /** Bullet count (`<ns>.<id>.list.N`). */
  list?: number;
  /** Optional closing paragraph (`<ns>.<id>.outro`). */
  outro?: boolean;
}

/**
 * Shared shell for privacy and terms: every section reads its copy from
 * `<ns>.<id>.title|intro|list.N|outro`, so both documents stay structurally identical.
 */
export function LegalPage({
  t,
  ns,
  specs,
}: {
  t: (key: string) => string;
  ns: 'privacy' | 'terms';
  specs: LegalSectionSpec[];
}) {
  const sections: DocSection[] = specs.map((s) => ({
    id: s.id,
    title: t(`${ns}.${s.id}.title`),
    body: (
      <>
        {s.intro ? <P>{t(`${ns}.${s.id}.intro`)}</P> : null}
        {s.list ? <UL items={Array.from({ length: s.list }, (_, i) => t(`${ns}.${s.id}.list.${i + 1}`))} /> : null}
        {s.outro ? <P>{t(`${ns}.${s.id}.outro`)}</P> : null}
      </>
    ),
  }));

  return (
    <DocLayout
      title={t(`${ns}.title`)}
      lead={t(`${ns}.lead`)}
      meta={t('legal.updated')}
      metaDateTime={PAGE_UPDATED.legal}
      tocLabel={t('guide2.toc')}
      sections={sections}
    />
  );
}
