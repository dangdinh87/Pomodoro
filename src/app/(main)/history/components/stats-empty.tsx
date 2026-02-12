'use client';

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"
import { useI18n } from "@/contexts/i18n-context"

export function StatsEmpty() {
    const { t } = useI18n();

    return (
        <EmptyState
            title={t('historyComponents.statsEmpty.title')}
            description={t('historyComponents.statsEmpty.description')}
            action={
                <Button asChild>
                    <Link href="/timer">{t('historyComponents.statsEmpty.startFocus')}</Link>
                </Button>
            }
        />
    )
}
