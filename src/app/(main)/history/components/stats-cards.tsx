'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/contexts/i18n-context"

interface StatsCardsProps {
    totalFocusTime: number // in seconds
    completedSessions: number
    streak: {
        current: number
        longest: number
    }
}

export function StatsCards({ totalFocusTime, completedSessions, streak }: StatsCardsProps) {
    const { t } = useI18n();
    const hours = Math.floor(totalFocusTime / 3600)
    const minutes = Math.floor((totalFocusTime % 3600) / 60)

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('historyComponents.statsCards.totalFocusTime')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {t('historyComponents.statsCards.timeFormat', { hours, minutes })}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('historyComponents.statsCards.completedSessions')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{completedSessions}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('historyComponents.statsCards.longestStreak')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{t('historyComponents.statsCards.days', { days: streak.longest })}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('historyComponents.statsCards.currentStreak', { current: streak.current })}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
