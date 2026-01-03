"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StatsCards } from "./components/stats-cards"
import { FocusChart } from "./components/focus-chart"
import { DistributionChart } from "./components/distribution-chart"
import { SessionHistory } from "./components/session-history"
import { DateRangePicker } from "./components/date-range-picker"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { useI18n } from '@/contexts/i18n-context'

import { useStats } from "@/hooks/use-stats"
import { useHistory } from "@/hooks/use-history"
import { StatsLoading } from "./components/stats-loading"
import { StatsEmpty } from "./components/stats-empty"

export default function HistoryPage() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const router = useRouter()
    const { t } = useI18n()
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date()
    })

    const { data: statsData, isLoading: isStatsLoading, isError: isStatsError } = useStats(dateRange)
    const { data: historyData, isLoading: isHistoryLoading, isError: isHistoryError } = useHistory(dateRange)

    const isLoading = isStatsLoading || isHistoryLoading
    const isError = isStatsError || isHistoryError

    if (isAuthLoading) {
        return <main
            className="container mx-auto px-4 py-8 md:py-12 min-h-screen"
            aria-label="History and statistics page"
        >
            <StatsLoading />
        </main>
    }

    if (!isAuthenticated) {
        return (
            <main
                className="container mx-auto px-4 py-8 md:py-12 min-h-screen flex flex-col items-center justify-center space-y-4"
                aria-label="History and statistics page"
            >
                <h2 className="text-xl font-semibold text-center">{t('auth.signInToViewStats')}</h2>
                <Button onClick={() => router.push('/login?redirect=/history')}>{t('auth.signInButton')}</Button>
            </main>
        )
    }

    return (
        <main
            className="w-full h-full p-4 md:p-8"
            aria-label="History and statistics page"
        >
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{t('history.title')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('history.subtitle')}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            className="w-full sm:w-auto"
                        />
                        <Button onClick={() => router.push('/timer')} className="w-full sm:w-auto">
                            {t('history.startNewSession')}
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <StatsLoading />
                ) : isError ? (
                    <div className="flex h-64 items-center justify-center rounded-xl border bg-card/70 backdrop-blur">
                        <div className="text-center space-y-2">
                            <p className="text-destructive font-medium">{t('history.errorLoading')}</p>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                {t('common.retry')}
                            </Button>
                        </div>
                    </div>
                ) : !statsData || !historyData || (statsData.summary.totalFocusTime === 0 && historyData.sessions.length === 0) ? (
                    <section className="rounded-xl border bg-card/70 backdrop-blur p-4 md:p-6">
                        <StatsEmpty />
                    </section>
                ) : (
                    <>
                        <StatsCards
                            totalFocusTime={statsData.summary.totalFocusTime}
                            completedSessions={statsData.summary.completedSessions}
                            streak={statsData.summary.streak}
                        />

                        <section className="rounded-xl border bg-card/70 backdrop-blur p-4 md:p-6 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">{t('history.charts.focusOverview')}</h3>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                                    <div className="lg:col-span-4">
                                        <FocusChart data={statsData.dailyFocus} />
                                    </div>
                                    <div className="lg:col-span-3">
                                        <DistributionChart data={statsData.distribution} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <SessionHistory sessions={historyData.sessions
                                    .map(s => ({
                                        id: s.id,
                                        taskName: s.tasks?.title || t('history.charts.noTask'),
                                        mode: s.mode,
                                        date: s.created_at,
                                        duration: s.duration
                                    }))} />
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    )
}
