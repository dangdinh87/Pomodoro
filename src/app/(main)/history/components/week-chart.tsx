'use client'

import { useI18n } from '@/contexts/i18n-context'
import { cn } from '@/lib/utils'
import { INTL_LOCALE, parseDayKey, toDayKey } from './history-format'

interface WeekChartProps {
    data: { date: string; duration: number }[]
}

const CHART_HEIGHT = 160

export function WeekChart({ data }: WeekChartProps) {
    const { t, lang } = useI18n()
    const todayKey = toDayKey(new Date())
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
                const height = day.minutes === 0 ? 3 : Math.max(6, Math.round((day.minutes / max) * CHART_HEIGHT))
                return (
                    <li
                        key={day.key}
                        aria-label={`${day.full}: ${t('historyUi.minutesShort', { minutes: day.minutes })}`}
                        className="flex min-w-0 flex-col items-center gap-2"
                    >
                        <span className={cn('text-xs tabular-nums', day.minutes ? 'text-ink-secondary' : 'text-ink-faint')}>
                            {day.minutes}
                        </span>
                        <div className="flex items-end border-b border-border-strong" style={{ height: CHART_HEIGHT }}>
                            <div
                                className="w-6 rounded-t-[4px] transition-[height] duration-500 ease-out motion-reduce:transition-none sm:w-9"
                                style={{
                                    height,
                                    background: isToday
                                        ? 'var(--accent-solid)'
                                        : 'var(--border-strong)',
                                    opacity: day.minutes === 0 ? 0.5 : 1,
                                }}
                            />
                        </div>
                        <span className={cn('text-xs', isToday ? 'font-semibold text-ink' : 'text-ink-muted')}>{day.label}</span>
                    </li>
                )
            })}
        </ul>
    )
}
