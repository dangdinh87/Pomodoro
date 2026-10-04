import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { DocLayout, OL, P, UL, type DocSection } from '@/components/landing/doc-layout';
import { PanelLink } from '@/components/landing/panel-link';
import type { PanelId } from '@/features/app-shell/panel-store';
import { localePath } from '@/lib/i18n/locale-path';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { getT } from '@/lib/server-translations';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await routeLang(params);
  const t = getT(lang);
  return buildPageMetadata({
    lang,
    path: '/guide',
    title: t('site.meta.guide.title'),
    description: t('site.meta.guide.description'),
  });
}

const SESSION_STEPS = 6;
const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ['Space'], action: 'space' },
  { keys: ['R'], action: 'reset' },
  { keys: ['T'], action: 'tasks' },
  { keys: ['S'], action: 'sound' },
  { keys: ['B'], action: 'scene' },
  { keys: ['C'], action: 'timer' },
  { keys: ['H'], action: 'stats' },
  { keys: ['G'], action: 'arcade' },
  { keys: ['⌘ K', 'Ctrl K'], action: 'palette' },
];
const RHYTHMS = ['classic', 'extended', 'ratio', 'deep'] as const;

function Go({ panel, children }: { panel: PanelId; children: ReactNode }) {
  return (
    <p>
      <PanelLink panel={panel} className="focus-ring inline-flex items-center gap-1.5 rounded-sm font-heading text-base font-bold text-brand underline-offset-4 hover:text-brand-hover hover:underline">
        {children}
        <ArrowRight size={14} weight="bold" />
      </PanelLink>
    </p>
  );
}

export default async function GuidePage({ params }: LangParams) {
  const lang = await routeLang(params);
  const t = getT(lang);
  const list = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => t(`${prefix}.${i + 1}`));
  const steps = list('guide2.session.steps', SESSION_STEPS);

  const sections: DocSection[] = [
    {
      id: 'what-is-pomodoro',
      title: t('guide2.what.title'),
      body: (
        <>
          <P>{t('guide2.what.p1')}</P>
          <P>{t('guide2.what.p2')}</P>
          <P>{t('guide2.what.p3')}</P>
        </>
      ),
    },
    {
      id: 'run-a-session',
      title: t('guide2.session.title'),
      body: (
        <>
          <P>{t('guide2.session.intro')}</P>
          <OL items={steps} />
          <P>{t('guide2.session.note')}</P>
          <Go panel="tasks">{t('shell.panels.tasks')}</Go>
        </>
      ),
    },
    {
      id: 'choose-a-rhythm',
      title: t('guide2.rhythm.title'),
      body: (
        <>
          <P>{t('guide2.rhythm.intro')}</P>
          <div className="border-sticker overflow-x-auto rounded-xl bg-surface">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b-2 border-outline bg-surface-raised font-heading text-sm font-bold text-ink">
                <tr>
                  <th scope="col" className="px-4 py-3">{t('guide2.rhythm.colName')}</th>
                  <th scope="col" className="px-4 py-3">{t('guide2.rhythm.colTimes')}</th>
                  <th scope="col" className="px-4 py-3">{t('guide2.rhythm.colFor')}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border align-top">
                {RHYTHMS.map((r) => (
                  <tr key={r}>
                    <th scope="row" className="px-4 py-3 font-heading text-base font-bold text-ink">{t(`guide2.rhythm.${r}.name`)}</th>
                    <td className="whitespace-nowrap px-4 py-3 font-bold tabular-nums text-ink">{t(`guide2.rhythm.${r}.times`)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{t(`guide2.rhythm.${r}.for`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>{t('guide2.rhythm.how')}</P>
          <P>{t('guide2.rhythm.limits')}</P>
          <Go panel="timer">{t('shell.panels.timer')}</Go>
        </>
      ),
    },
    {
      id: 'interruptions',
      title: t('guide2.interruptions.title'),
      body: (
        <>
          <P>{t('guide2.interruptions.intro')}</P>
          <UL items={list('guide2.interruptions.list', 3)} />
          <P>{t('guide2.interruptions.outro')}</P>
        </>
      ),
    },
    {
      id: 'tasks-and-estimates',
      title: t('guide2.tasks.title'),
      body: (
        <>
          <P>{t('guide2.tasks.intro')}</P>
          <UL items={list('guide2.tasks.list', 4)} />
          <Go panel="tasks">{t('shell.panels.tasks')}</Go>
        </>
      ),
    },
    {
      id: 'breaks',
      title: t('guide2.breaks.title'),
      body: (
        <>
          <P>{t('guide2.breaks.intro')}</P>
          <UL items={list('guide2.breaks.list', 4)} />
          <P>{t('guide2.breaks.outro')}</P>
        </>
      ),
    },
    {
      id: 'sounds-scenes-history',
      title: t('guide2.tools.title'),
      body: (
        <>
          <UL items={list('guide2.tools.list', 4)} />
          <Go panel="stats">{t('shell.panels.stats')}</Go>
        </>
      ),
    },
    {
      id: 'shortcuts',
      title: t('guide2.shortcuts.title'),
      body: (
        <>
          <P>{t('guide2.shortcuts.intro')}</P>
          <div className="border-sticker overflow-x-auto rounded-xl bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-outline bg-surface-raised font-heading text-sm font-bold text-ink">
                <tr>
                  <th scope="col" className="w-40 px-4 py-3">{t('pagesUi.guide.colKey')}</th>
                  <th scope="col" className="px-4 py-3">{t('pagesUi.guide.colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {SHORTCUTS.map(({ keys, action }) => (
                  <tr key={action}>
                    <td className="px-4 py-2.5">
                      <span className="flex flex-wrap items-center gap-1.5">
                        {keys.map((k, i) => (
                          <span key={k} className="flex items-center gap-1.5">
                            {i > 0 ? <span className="text-xs text-ink-muted">/</span> : null}
                            <Kbd>{k}</Kbd>
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-ink-secondary">{t(`guide2.shortcuts.${action}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'sources',
      title: t('guide2.sources.title'),
      body: (
        <>
          <P>{t('guide2.sources.intro')}</P>
          <UL items={list('guide2.sources.list', 2)} />
        </>
      ),
    },
  ];

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t('guide2.session.title'),
    description: t('guide2.session.intro'),
    step: steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: text.replaceAll('**', ''),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
      <DocLayout
        title={t('guide2.title')}
        lead={t('guide2.lead')}
        meta={t('guide2.updated')}
        metaDateTime="2026-10-05"
        tocLabel={t('guide2.toc')}
        sections={sections}
        after={
          <section className="border-t-2 border-dashed border-border pt-10">
            <h2 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-ink">{t('guide2.cta.title')}</h2>
            <p className="mt-3 text-base leading-[1.75] text-ink-secondary [&:lang(ja)]:leading-[1.95]">{t('guide2.cta.text')}</p>
            <Button asChild size="lg" className="mt-6">
              <Link href={localePath(lang, '/')}>{t('guide2.cta.button')}</Link>
            </Button>
          </section>
        }
      />
    </>
  );
}
