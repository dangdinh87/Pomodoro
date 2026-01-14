'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useI18n } from "@/contexts/i18n-context"

interface SessionHistoryProps {
    sessions: {
        id: string
        taskName: string
        mode: 'work' | 'shortBreak' | 'longBreak'
        date: string
        duration: number // in seconds
    }[]
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
    const { t } = useI18n();

    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'work': return t('historyComponents.sessionHistory.modes.focus')
            case 'shortBreak': return t('historyComponents.sessionHistory.modes.shortBreak')
            case 'longBreak': return t('historyComponents.sessionHistory.modes.longBreak')
            default: return mode
        }
    }

    const getModeColor = (mode: string) => {
        switch (mode) {
            case 'work': return 'default' // primary
            case 'shortBreak': return 'secondary' // amber-like usually but secondary works
            case 'longBreak': return 'outline'
            default: return 'outline'
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{t('historyComponents.sessionHistory.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">{t('historyComponents.sessionHistory.tableHeaders.task')}</TableHead>
                            <TableHead>{t('historyComponents.sessionHistory.tableHeaders.sessionType')}</TableHead>
                            <TableHead>{t('historyComponents.sessionHistory.tableHeaders.dateTime')}</TableHead>
                            <TableHead className="text-right">{t('historyComponents.sessionHistory.tableHeaders.duration')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map((session) => (
                            <TableRow key={session.id}>
                                <TableCell className={cn("font-medium", session.taskName === t('historyComponents.sessionHistory.noTask') && "text-muted-foreground italic")}>{session.taskName}</TableCell>
                                <TableCell>
                                    <Badge variant={getModeColor(session.mode) as any}>
                                        {getModeLabel(session.mode)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(session.date).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    {t('historyComponents.sessionHistory.minutes', { minutes: Math.round(session.duration / 60) })}
                                </TableCell>
                            </TableRow>
                        ))}
                        {sessions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    {t('historyComponents.sessionHistory.noData')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
