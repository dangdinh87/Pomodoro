'use client'

import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/contexts/i18n-context'
import { cn } from '@/lib/utils'
import { INTL_LOCALE } from './history-format'

type Mode = 'work' | 'shortBreak' | 'longBreak'

interface SessionListProps {
    sessions: { id: string; taskName: string | null; mode: Mode; date: string; duration: number }[]
}

const MODE_VARIANT = { work: 'brand', shortBreak: 'secondary', longBreak: 'outline' } as const
const MAX_ROWS = 50

export function SessionList({ sessions }: SessionListProps) {
    const { t, lang } = useI18n()

    if (sessions.length === 0) {
        return (
            <p className="rounded-lg border border-border bg-surface px-5 py-8 text-center text-sm text-ink-muted">
                {t('historyUi.sessions.none')}
            </p>
        )
    }

    return (
        <ul className="m-0 list-none divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface p-0">
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
                            session.taskName ? 'font-medium text-ink' : 'text-ink-muted',
                        )}
                    >
                        {session.taskName ?? t('historyUi.sessions.noTask')}
                    </span>
                    <Badge variant={MODE_VARIANT[session.mode]} className="order-3 justify-self-start sm:order-0 sm:justify-self-auto">
                        {t(`historyUi.sessions.modes.${session.mode}`)}
                    </Badge>
                    <span className="order-2 text-right text-sm tabular-nums text-ink-secondary sm:order-0">
                        {t('historyUi.minutesShort', { minutes: Math.round(session.duration / 60) })}
                    </span>
                </li>
            ))}
        </ul>
    )
}
