"use client"

import { Trophy } from "lucide-react"
import { useI18n } from '@/contexts/i18n-context'

export default function LeaderboardPage() {
    const { t } = useI18n()

    return (
        <main
            className="h-full flex items-center justify-center"
            aria-label="Leaderboard page"
        >
            <div className="max-w-md mx-auto text-center space-y-6">
                <div className="bg-muted/30 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{t('leaderboard.title')}</h1>
                    <p className="text-muted-foreground text-lg">
                        {t('leaderboard.comingSoon')}
                    </p>
                </div>
                <div className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {t('leaderboard.description')}
                </div>
            </div>
        </main>
    )
}
