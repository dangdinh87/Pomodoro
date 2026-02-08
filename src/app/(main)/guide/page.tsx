'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Timer,
    CheckSquare,
    BarChart3,
    Settings,
    ArrowRight,
    MessageSquare,
    Gamepad2,
    Trophy,
    Shield,
    Send,
} from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';

export default function GuidePage() {
    const { t, dict } = useI18n();
    return (
        <main className="max-w-5xl mx-auto space-y-12 py-8 pb-16 px-4 lg:px-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    {t('guide.title')}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {t('guide.subtitle')}
                </p>
            </div>

            {/* Pomodoro Introduction */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">{t('guide.pomodoro.badge')}</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t('guide.pomodoro.title')}
                    </h2>
                </div>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t('guide.pomodoro.description') }} />
                </div>

                {/* Image Illustration */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                    <Image
                        src="/images/content_1/pomodoro_explain.png"
                        alt={t('guide.pomodoro.imageAlt')}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </section>

            {/* How to Apply Pomodoro */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">{t('guide.howToApply.badge')}</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t('guide.howToApply.title')}
                    </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    1
                                </div>
                                <CardTitle>{t('guide.howToApply.steps.step1.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {t('guide.howToApply.steps.step1.description')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    2
                                </div>
                                <CardTitle>{t('guide.howToApply.steps.step2.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {t('guide.howToApply.steps.step2.description')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    3
                                </div>
                                <CardTitle>{t('guide.howToApply.steps.step3.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {t('guide.howToApply.steps.step3.description')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    4
                                </div>
                                <CardTitle>{t('guide.howToApply.steps.step4.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {t('guide.howToApply.steps.step4.description')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Benefits */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">{t('guide.benefits.badge')}</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t('guide.benefits.title')}
                    </h2>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <ul className="space-y-3">
                            {Array.isArray(dict.guide?.benefits?.list) && dict.guide.benefits.list.map((benefit: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <div className="bg-muted rounded-lg p-6">
                    <p className="text-sm text-muted-foreground italic" dangerouslySetInnerHTML={{ __html: t('guide.benefits.tip') }} />
                </div>
            </section>

            {/* How to Use This Website */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">{t('guide.howToUse.badge')}</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t('guide.howToUse.title')}
                    </h2>
                </div>
                <p className="text-lg text-muted-foreground">
                    {t('guide.howToUse.description')}
                </p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Timer Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Timer className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.timer.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.timer.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.timer.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.timer?.points) && dict.guide.howToUse.features.timer.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/timer"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.timer.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Tasks Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <CheckSquare className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.tasks.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.tasks.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.tasks.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.tasks?.points) && dict.guide.howToUse.features.tasks.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/tasks"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.tasks.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* History Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.history.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.history.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.history.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.history?.points) && dict.guide.howToUse.features.history.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/history"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.history.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Chat AI Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.chatAI.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.chatAI.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.chatAI.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.chatAI?.points) && dict.guide.howToUse.features.chatAI.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/chat"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.chatAI.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Entertainment Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Gamepad2 className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.entertainment.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.entertainment.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.entertainment.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.entertainment?.points) && dict.guide.howToUse.features.entertainment.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/entertainment"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.entertainment.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Leaderboard Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Trophy className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.leaderboard.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.leaderboard.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.leaderboard.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.leaderboard?.points) && dict.guide.howToUse.features.leaderboard.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/leaderboard"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.leaderboard.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Focus Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.focus.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.focus.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.focus.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.focus?.points) && dict.guide.howToUse.features.focus.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/focus"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.focus.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Feedback Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Send className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.feedback.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.feedback.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.feedback.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.feedback?.points) && dict.guide.howToUse.features.feedback.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/feedback"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.feedback.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Settings Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Settings className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{t('guide.howToUse.features.settings.title')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('guide.howToUse.features.settings.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('guide.howToUse.features.settings.description')}
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {Array.isArray(dict.guide?.howToUse?.features?.settings?.points) && dict.guide.howToUse.features.settings.points.map((point: string, index: number) => (
                                    <li key={index}>• {point}</li>
                                ))}
                            </ul>
                            <Link
                                href="/settings"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                {t('guide.howToUse.features.settings.cta')} <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Getting Started */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">{t('guide.getStarted.badge')}</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t('guide.getStarted.title')}
                    </h2>
                </div>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <p className="text-lg">
                                {t('guide.getStarted.description')}
                            </p>
                            <ol className="space-y-3 text-muted-foreground">
                                {Array.isArray(dict.guide?.getStarted?.steps) && dict.guide.getStarted.steps.map((step: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="font-bold text-primary">{index + 1}.</span>
                                        <span dangerouslySetInnerHTML={{ __html: step.replace(/<link>/g, '<a href="/tasks" class="text-primary hover:underline font-medium">').replace(/<\/link>/g, '</a>').replace(/<link>/g, '<a href="/timer" class="text-primary hover:underline font-medium">') }} />
                                    </li>
                                ))}
                            </ol>
                            <div className="pt-4">
                                <Link
                                    href="/timer"
                                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                                >
                                    {t('guide.getStarted.cta')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}
