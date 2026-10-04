'use client'

import { useI18n } from '@/contexts/i18n-context'
import { cn } from '@/lib/utils'
import { studyTodayDate } from '@/lib/stats/study-day'
import { INTL_LOCALE, parseDayKey, toDayKey } from './history-format'

interface WeekChartProps {
    data: { date: string; duration: number }[]
}

const CHART_HEIGHT = 160

export function WeekChart({ data }: WeekChartProps) {
    const { t, lang } = useI18n()
    const todayKey = toDayKey(studyTodayDate())
    const days = data.slice(-7).map((item) => {
        const date = parseDayKey(item.date)
        return {
            key: item.date,
            minutes: Math.round(item.duration / 60),
            label: date.toLocaleDateString(INTL_LOCALE[lang], { weekday: 'short' }),
            full: date.toLocaleDateString(INTL_LOCALE[lang], { weekday: 'long', month: 'short', day: 'numeric' }),
        }
    })
    const max = Math.max(60, ...days.map((d) => d.minutes))

    return (
        <ul
            aria-label={t('historyUi.chart.summary')}
            className="m-0 grid list-none grid-cols-7 gap-2 p-0 sm:gap-4"
        >
            {days.map((day) => {
                const isToday = day.key === todayKey
                const height = day.minutes === 0 ? 6 : Math.max(14, Math.round((day.minutes / max) * CHART_HEIGHT))
                return (
                    <li
                        key={day.key}
                        aria-label={`${day.full}: ${t('historyUi.minutesShort', { minutes: day.minutes })}`}
                        className="flex min-w-0 flex-col items-center gap-2"
                    >
                        <span className={cn('font-heading text-sm font-bold tabular-nums', day.minutes ? 'text-ink' : 'text-ink-muted')}>
                            {day.minutes}
                        </span>
                        <div className="flex items-end border-b-2 border-border" style={{ height: CHART_HEIGHT }}>
                            {/* Rounded, outlined bar: today is the accent colour, other days butter, an empty day a flat raised stub. */}
                            <div
                                data-today={isToday}
                                className={cn(
                                    'w-6 rounded-t-xl border-2 border-b-0 transition-[height] duration-500 ease-out motion-reduce:transition-none sm:w-9',
                                    day.minutes === 0
                                        ? 'rounded-t-md border-control-edge bg-surface-raised'
                                        : isToday
                                          ? 'border-outline bg-primary'
                                          : 'border-outline bg-candy-butter',
                                )}
                                style={{ height }}
                            />
                        </div>
                        <span className={cn('text-xs', isToday ? 'font-semibold text-ink' : 'font-medium text-ink-muted')}>{day.label}</span>
                    </li>
                )
            })}
        </ul>
    )
}
