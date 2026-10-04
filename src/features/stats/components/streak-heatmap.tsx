'use client'

import { addDays, startOfWeek, subWeeks } from 'date-fns'
import { useI18n } from '@/contexts/i18n-context'
import { studyTodayDate } from '@/lib/stats/study-day'
import { INTL_LOCALE, toDayKey } from './history-format'

const WEEKS = 12

export function heatmapRange(today = studyTodayDate()) {
    return { from: startOfWeek(subWeeks(today, WEEKS - 1), { weekStartsOn: 1 }), to: today }
}

const LEVEL_MIX = [0, 30, 55, 80, 100]

function levelFor(minutes: number): number {
    if (minutes <= 0) return 0
    if (minutes < 25) return 1
    if (minutes < 60) return 2
    if (minutes < 120) return 3
    return 4
}

function levelColor(level: number): string {
    return level === 0
        ? 'var(--surface-raised)'
        : `color-mix(in srgb, var(--accent-solid) ${LEVEL_MIX[level]}%, var(--surface-raised))`
}

interface StreakHeatmapProps {
    data: { date: string; duration: number }[]
}

export function StreakHeatmap({ data }: StreakHeatmapProps) {
    const { t, lang } = useI18n()
    const locale = INTL_LOCALE[lang]
    const minutesByDay = new Map(data.map((d) => [d.date, Math.round(d.duration / 60)]))
    const today = studyTodayDate()
    const todayKey = toDayKey(today)
    const start = heatmapRange(today).from

    const columns = Array.from({ length: WEEKS }, (_, w) =>
        Array.from({ length: 7 }, (_, r) => {
            const date = addDays(start, w * 7 + r)
            const key = toDayKey(date)
            return { key, date, minutes: minutesByDay.get(key) ?? 0, future: key > todayKey }
        }),
    )
    // 2024-01-01 is a Monday; label Mon / Wed / Fri rows in the UI language.
    const weekdayLabel = (offset: number) =>
        new Date(2024, 0, 1 + offset).toLocaleDateString(locale, { weekday: 'short' })

    return (
        <div>
            <div className="flex gap-2">
                <div className="grid shrink-0 grid-rows-7 gap-[3px] pr-1 text-[0.6875rem] leading-3 text-ink-faint" aria-hidden>
                    {Array.from({ length: 7 }, (_, r) => (
                        <span key={r} className="h-3">
                            {r % 2 === 0 ? weekdayLabel(r) : ''}
                        </span>
                    ))}
                </div>
                <div role="list" className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 12px)` }}>
                    {columns.flat().map((cell) =>
                        cell.future ? (
                            <span key={cell.key} className="size-3" aria-hidden />
                        ) : (
                            <span
                                key={cell.key}
                                role="listitem"
                                title={cellLabel(cell.minutes, cell.date)}
                                aria-label={cellLabel(cell.minutes, cell.date)}
                                className="size-3 rounded-[3px]"
                                style={{
                                    background: levelColor(levelFor(cell.minutes)),
                                    boxShadow: cell.key === todayKey ? 'inset 0 0 0 1px var(--ink-secondary)' : undefined,
                                }}
                            />
                        ),
                    )}
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
                <span>{t('historyUi.heatmap.less')}</span>
                {LEVEL_MIX.map((_, level) => (
                    <span key={level} className="size-3 rounded-[3px]" style={{ background: levelColor(level) }} aria-hidden />
                ))}
                <span>{t('historyUi.heatmap.more')}</span>
            </div>
        </div>
    )

    function cellLabel(minutes: number, date: Date) {
        const day = date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })
        return minutes > 0
            ? t('historyUi.heatmap.cell', { date: day, minutes })
            : t('historyUi.heatmap.cellNone', { date: day })
    }
}
