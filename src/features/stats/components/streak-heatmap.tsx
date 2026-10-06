'use client'

import { addDays, startOfWeek, subWeeks } from 'date-fns'
import { useI18n } from '@/contexts/i18n-context'
import { studyTodayDate } from '@/lib/stats/study-day'
import { INTL_LOCALE, toDayKey } from './history-format'

const WEEKS = 12

export function heatmapRange(today = studyTodayDate()) {
    return { from: startOfWeek(subWeeks(today, WEEKS - 1), { weekStartsOn: 1 }), to: today }
}

/** Share of the accent colour mixed into the empty-cell colour, per level (0 = no focus ... 4 = 2h+). */
export const HEATMAP_LEVEL_MIX = [0, 30, 55, 80, 100] as const;

/** Bucket a day's focus minutes into a colour level 0-4. */
export function levelFor(minutes: number): number {
    if (minutes <= 0) return 0
    if (minutes < 25) return 1
    if (minutes < 60) return 2
    if (minutes < 120) return 3
    return 4
}

// Cream (the raised surface) to the accent colour (tomato by default; follows the chosen colour set).
// Both ends are theme tokens, so the same scale works in light and dark.
function levelColor(level: number): string {
    return level === 0
        ? 'var(--surface-raised)'
        : `color-mix(in srgb, var(--accent-solid) ${HEATMAP_LEVEL_MIX[level]}%, var(--surface-raised))`
}

// Thin outline on every cell; empty cells get the quiet divider colour so they read as slots.
const CELL = 'aspect-square min-w-3.5 rounded-[4px] border'
const LEGEND_CELL = 'size-3.5 shrink-0 rounded-[4px] border'
const cellBorder = (level: number) => (level === 0 ? 'var(--border)' : 'var(--outline)')

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
                {/* same 7 rows and 3px gap as the cells, so each weekday label lines up with its row */}
                <div className="grid shrink-0 grid-rows-7 gap-[3px] pr-1 text-[0.6875rem] font-semibold leading-none text-ink-muted" aria-hidden>
                    {Array.from({ length: 7 }, (_, r) => (
                        <span key={r} className="flex items-center">
                            {r % 2 === 0 ? weekdayLabel(r) : ''}
                        </span>
                    ))}
                </div>
                <div role="list" className="grid min-w-0 flex-1 grid-flow-col grid-rows-7 gap-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(14px, 1fr))` }}>
                    {columns.flat().map((cell) =>
                        cell.future ? (
                            <span key={cell.key} className="aspect-square" aria-hidden />
                        ) : (
                            <span
                                key={cell.key}
                                role="listitem"
                                data-level={levelFor(cell.minutes)}
                                title={cellLabel(cell.minutes, cell.date)}
                                aria-label={cellLabel(cell.minutes, cell.date)}
                                className={CELL}
                                style={{
                                    background: levelColor(levelFor(cell.minutes)),
                                    borderColor: cellBorder(levelFor(cell.minutes)),
                                    // today: a ring outside the cell, so it shows even on the darkest level
                                    outline: cell.key === todayKey ? '2px solid var(--ink)' : undefined,
                                    outlineOffset: cell.key === todayKey ? 1 : undefined,
                                }}
                            />
                        ),
                    )}
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <span>{t('historyUi.heatmap.less')}</span>
                {HEATMAP_LEVEL_MIX.map((_, level) => (
                    <span key={level} className={LEGEND_CELL} style={{ background: levelColor(level), borderColor: cellBorder(level) }} aria-hidden />
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
