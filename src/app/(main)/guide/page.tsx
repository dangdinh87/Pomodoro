'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { PageContainer } from '@/components/ui/page-header';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { useI18n } from '@/contexts/i18n-context';

const FEATURES = [
    { key: 'timer', href: '/timer' },
    { key: 'tasks', href: '/tasks' },
    { key: 'history', href: '/history' },
    { key: 'entertainment', href: '/entertainment' },
    { key: 'settings', href: '/settings' },
    { key: 'feedback', href: '/feedback' },
] as const;

const H2 = 'font-heading text-2xl font-bold tracking-[-0.02em] text-ink';
const BODY = 'text-[1.0625rem] leading-[1.7] text-ink-secondary';

export default function GuidePage() {
    const { t, dict } = useI18n();
    const benefits: string[] = Array.isArray(dict.guide?.benefits?.list) ? dict.guide.benefits.list : [];
    const startSteps: string[] = Array.isArray(dict.guide?.getStarted?.steps) ? dict.guide.getStarted.steps : [];

    return (
        <PageContainer size="narrow">
            <article className="mx-auto max-w-[68ch] space-y-14">
                <header className="space-y-3">
                    <h1 className="font-heading text-[2rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl">
                        {t('guide.title')}
                    </h1>
                    <p className="text-lg leading-relaxed text-ink-muted">{t('guide.subtitle')}</p>
                </header>

                <section className="space-y-5">
                    <h2 className={H2}>{t('guide.pomodoro.title')}</h2>
                    <p className={BODY} dangerouslySetInnerHTML={{ __html: t('guide.pomodoro.description') }} />
                    <figure className="space-y-2">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-surface-raised">
                            <Image
                                src="/images/content_1/pomodoro_explain.png"
                                alt={t('guide.pomodoro.imageAlt')}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <figcaption className="text-[0.8125rem] text-ink-muted">{t('pagesUi.guide.figureCaption')}</figcaption>
                    </figure>
                </section>

                <section className="space-y-5">
                    <h2 className={H2}>{t('guide.howToApply.title')}</h2>
                    <ol className="divide-y divide-border rounded-lg border border-border bg-surface">
                        {(['step1', 'step2', 'step3', 'step4'] as const).map((step, i) => (
                            <li key={step} className="flex gap-4 px-5 py-4">
                                <span className="w-5 shrink-0 font-heading text-lg font-bold tabular-nums text-ink-faint">{i + 1}</span>
                                <div className="space-y-1">
                                    <h3 className="text-[0.9375rem] font-semibold text-ink">{t(`guide.howToApply.steps.${step}.title`)}</h3>
                                    <p className="text-sm leading-relaxed text-ink-muted">{t(`guide.howToApply.steps.${step}.description`)}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="space-y-5">
                    <h2 className={H2}>{t('guide.benefits.title')}</h2>
                    <ul className={`list-disc space-y-2 pl-5 marker:text-ink-faint ${BODY}`}>
                        {benefits.map((benefit) => (
                            <li key={benefit}>{benefit}</li>
                        ))}
                    </ul>
                    <p className="rounded-lg bg-surface-raised px-5 py-4 text-sm leading-relaxed text-ink-secondary">{t('pagesUi.guide.tip')}</p>
                </section>

                <section className="space-y-5">
                    <div className="space-y-2">
                        <h2 className={H2}>{t('guide.howToUse.title')}</h2>
                        <p className="text-ink-muted">{t('guide.howToUse.description')}</p>
                    </div>
                    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
                        {FEATURES.map(({ key, href }) => (
                            <li key={key}>
                                <Link
                                    href={href}
                                    className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                                >
                                    <span className="min-w-0 space-y-0.5">
                                        <span className="block text-[0.9375rem] font-semibold text-ink">{t(`guide.howToUse.features.${key}.title`)}</span>
                                        <span className="block text-[0.8125rem] text-ink-muted">{t(`guide.howToUse.features.${key}.subtitle`)}</span>
                                    </span>
                                    <ArrowRight size={16} className="shrink-0 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-secondary" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-5">
                    <div className="space-y-2">
                        <h2 className={H2}>{t('pagesUi.guide.shortcutsTitle')}</h2>
                        <p className="text-ink-muted">{t('pagesUi.guide.shortcutsIntro')}</p>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-raised text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">
                                <tr>
                                    <th scope="col" className="w-32 px-5 py-2.5">{t('pagesUi.guide.colKey')}</th>
                                    <th scope="col" className="px-5 py-2.5">{t('pagesUi.guide.colAction')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-surface text-ink-secondary">
                                <tr>
                                    <td className="px-5 py-3"><Kbd>{t('pagesUi.guide.keySpace')}</Kbd></td>
                                    <td className="px-5 py-3">{t('pagesUi.guide.actionStartPause')}</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3"><Kbd>R</Kbd></td>
                                    <td className="px-5 py-3">{t('pagesUi.guide.actionReset')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-5 border-t border-border pt-10">
                    <h2 className={H2}>{t('guide.getStarted.title')}</h2>
                    <p className={BODY}>{t('guide.getStarted.description')}</p>
                    <ol className="space-y-3 text-ink-secondary">
                        {startSteps.map((step, index) => (
                            <li key={step} className="flex items-start gap-3">
                                <span className="w-5 shrink-0 font-heading font-bold tabular-nums text-ink-faint">{index + 1}</span>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: step
                                            .replace('<link>', '<a href="/tasks" class="font-medium text-brand hover:underline">')
                                            .replace('<link>', '<a href="/timer" class="font-medium text-brand hover:underline">')
                                            .replace(/<\/link>/g, '</a>'),
                                    }}
                                />
                            </li>
                        ))}
                    </ol>
                    <Button asChild size="lg">
                        <Link href="/timer">{t('guide.getStarted.cta')}</Link>
                    </Button>
                </section>
            </article>
        </PageContainer>
    );
}
