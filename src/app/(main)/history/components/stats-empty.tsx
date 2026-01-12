'use client';

import { Button } from "@/components/ui/button"
import { CalendarX2 } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/contexts/i18n-context"

export function StatsEmpty() {
    const { t } = useI18n();

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 min-h-[400px]">
            <div className="bg-muted/50 p-4 rounded-full">
                <CalendarX2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('historyComponents.statsEmpty.title')}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    {t('historyComponents.statsEmpty.description')}
                </p>
            </div>
            <Button asChild>
                <Link href="/timer">{t('historyComponents.statsEmpty.startFocus')}</Link>
            </Button>
        </div>
    )
}
