"use client"

import { useMemo, useState } from "react"
import { startOfMonth, subDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip"
import { PanelBody, PageHeader, SectionHeading } from "@/components/ui/page-header"
import { StatStrip } from "@/components/ui/stat-strip"
import { useAuth } from "@/hooks/use-auth"
import { useStats } from "@/hooks/use-stats"
import { useHistory } from "@/hooks/use-history"
import { useI18n } from "@/contexts/i18n-context"
import { closePanel, openPanel } from "@/features/app-shell/panel-store"
import { HistoryLoading } from "@/features/stats/components/history-loading"
import { SessionList } from "@/features/stats/components/session-list"
import { StreakHeatmap, heatmapRange } from "@/features/stats/components/streak-heatmap"
import { studyTodayDate } from "@/lib/stats/study-day"
import { WeekChart } from "@/features/stats/components/week-chart"

type RangeKey = "today" | "week" | "month"
const RANGE_KEYS: RangeKey[] = ["today", "week", "month"]

// Ranges are study days (the day starts at 04:00), so "today" is not the calendar date before 04:00.
function rangeFor(key: RangeKey): DateRange {
    const today = studyTodayDate()
    if (key === "today") return { from: today, to: today }
    if (key === "week") return { from: subDays(today, 6), to: today }
    return { from: startOfMonth(today), to: today }
}

export default function StatsPanel() {
    const { hasSession, isLoading: isAuthLoading } = useAuth()
    const { t } = useI18n()
    const [rangeKey, setRangeKey] = useState<RangeKey>("week")
    const dateRange = useMemo(() => rangeFor(rangeKey), [rangeKey])
    const trendRange = useMemo(() => heatmapRange(), [])

    const { data: statsData, isLoading: isStatsLoading, isError: isStatsError } = useStats(dateRange)
    const { data: trendData, isLoading: isTrendLoading } = useStats(trendRange)
    const { data: historyData, isLoading: isHistoryLoading, isError: isHistoryError } = useHistory(dateRange)

    const header = (
        <PageHeader
            title={t("historyUi.title")}
            description={t("historyUi.description")}
            actions={
                <FilterChipGroup label={t("historyUi.rangeLabel")}>
                    {RANGE_KEYS.map((key) => (
                        <FilterChip key={key} active={rangeKey === key} onClick={() => setRangeKey(key)}>
                            {t(`historyUi.ranges.${key}`)}
                        </FilterChip>
                    ))}
                </FilterChipGroup>
            }
        />
    )

    if (isAuthLoading) {
        return (
            <PanelBody>
                {header}
                <HistoryLoading />
            </PanelBody>
        )
    }

    if (!hasSession) {
        return (
            <PanelBody>
                <EmptyState
                    title={t("auth.signInToViewStats")}
                    action={
                        <Button onClick={() => openPanel("login")}>
                            {t("auth.signInButton")}
                        </Button>
                    }
                />
            </PanelBody>
        )
    }

    const isLoading = isStatsLoading || isHistoryLoading || isTrendLoading
    const trend = trendData?.dailyFocus ?? []
    const hasAnyActivity =
        trend.some((d) => d.duration > 0) ||
        (statsData?.summary.totalFocusTime ?? 0) > 0 ||
        (historyData?.sessions.length ?? 0) > 0

    const formatFocus = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return hours > 0
            ? t("historyUi.hoursMinutes", { hours, minutes })
            : t("historyUi.minutesOnly", { minutes })
    }
    const formatDays = (count: number) => t(count === 1 ? "historyUi.dayOne" : "historyUi.dayOther", { count })

    return (
        <PanelBody>
            {header}

            {isLoading ? (
                <HistoryLoading />
            ) : isStatsError || isHistoryError || !statsData || !historyData ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface text-center">
                    <p className="text-sm text-ink-secondary">{t("historyUi.error")}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        {t("common.retry")}
                    </Button>
                </div>
            ) : !hasAnyActivity ? (
                <div className="rounded-lg border border-border bg-surface">
                    <EmptyState
                        title={t("historyUi.empty.title")}
                        description={t("historyUi.empty.description")}
                        action={
                            <Button onClick={closePanel}>{t("historyUi.empty.action")}</Button>
                        }
                    />
                </div>
            ) : (
                <div className="space-y-10">
                    <StatStrip
                        items={[
                            { label: t("historyUi.stats.focusTime"), value: formatFocus(statsData.summary.totalFocusTime) },
                            { label: t("historyUi.stats.sessions"), value: statsData.summary.completedSessions },
                            { label: t("historyUi.stats.currentStreak"), value: formatDays(statsData.summary.streak.current) },
                            { label: t("historyUi.stats.bestStreak"), value: formatDays(statsData.summary.streak.longest) },
                        ]}
                    />

                    <div className="grid gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <section>
                            <SectionHeading action={<span className="text-xs text-ink-muted">{t("historyUi.chart.subtitle")}</span>}>
                                {t("historyUi.chart.title")}
                            </SectionHeading>
                            <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
                                <WeekChart data={trend} />
                            </div>
                        </section>
                        <section>
                            <SectionHeading action={<span className="text-xs text-ink-muted">{t("historyUi.heatmap.subtitle")}</span>}>
                                {t("historyUi.heatmap.title")}
                            </SectionHeading>
                            <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
                                <StreakHeatmap data={trend} />
                            </div>
                        </section>
                    </div>

                    <section>
                        <SectionHeading>{t("historyUi.sessions.title")}</SectionHeading>
                        <SessionList
                            sessions={historyData.sessions.map((s) => ({
                                id: s.id,
                                taskName: s.tasks?.title ?? null,
                                mode: s.mode,
                                date: s.created_at,
                                duration: s.duration,
                            }))}
                        />
                    </section>
                </div>
            )}
        </PanelBody>
    )
}
