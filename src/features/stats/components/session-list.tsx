'use client'

import { Badge } from '@/components/ui/badge'
import { Tomo } from '@/components/brand/tomo'
import { useI18n } from '@/contexts/i18n-context'
import { cn } from '@/lib/utils'
import { INTL_LOCALE } from './history-format'

type Mode = 'work' | 'shortBreak' | 'longBreak'

interface SessionListProps {
    sessions: { id: string; taskName: string | null; mode: Mode; date: string; duration: number }[]
}

// Same colours as the timer modes: focus = tomato, short break = mint, long break = sky.
const MODE_VARIANT = { work: 'brand', shortBreak: 'success', longBreak: 'info' } as const
const MAX_ROWS = 50

export function SessionList({ sessions }: SessionListProps) {
    const { t, lang } = useI18n()

    if (sessions.length === 0) {
        return (
            <div className="sticker flex items-center justify-center gap-4 px-5 py-7">
                <Tomo face="sleepy" size={56} className="shrink-0" />
                <p className="text-sm font-semibold text-ink-muted">{t('historyUi.sessions.none')}</p>
            </div>
        )
    }

    return (
        <ul className="sticker m-0 list-none divide-y-2 divide-border overflow-hidden p-0">
            {sessions.slice(0, MAX_ROWS).map((session) => (
                <li
                    key={session.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 sm:grid-cols-[9.5rem_1fr_auto_4.5rem] sm:gap-x-4 sm:px-5"
                >
                    <time
                        dateTime={session.date}
                        className="order-4 text-right text-xs tabular-nums text-ink-muted sm:order-0 sm:text-left sm:text-[0.8125rem]"
                    >
                        {new Date(session.date).toLocaleString(INTL_LOCALE[lang], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </time>
                    <span
                        className={cn(
                            'order-1 min-w-0 truncate text-sm sm:order-0',
                            session.taskName ? 'font-semibold text-ink' : 'font-medium text-ink-muted',
                        )}
                    >
                        {session.taskName ?? t('historyUi.sessions.noTask')}
                    </span>
                    <Badge variant={MODE_VARIANT[session.mode]} className="order-3 justify-self-start sm:order-0 sm:justify-self-auto">
                        {t(`historyUi.sessions.modes.${session.mode}`)}
                    </Badge>
                    <span className="order-2 text-right font-heading text-sm font-bold tabular-nums text-ink sm:order-0">
                        {t('historyUi.minutesShort', { minutes: Math.round(session.duration / 60) })}
                    </span>
                </li>
            ))}
        </ul>
    )
}
