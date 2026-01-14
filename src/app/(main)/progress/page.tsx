'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Clock, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/contexts/i18n-context'

export default function ProgressPage() {
  const { t } = useI18n();
  return (
    <div className="h-full grid place-items-center">
      <Card className="w-full max-w-2xl bg-background/70 backdrop-blur-md border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 grid place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">{t('progress.comingSoon')}</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('progress.description')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{t('progress.features.focusTime.title')}</div>
                <div className="text-xs text-muted-foreground">{t('progress.features.focusTime.description')}</div>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm font-medium">{t('progress.features.pomodoroSessions.title')}</div>
                <div className="text-xs text-muted-foreground">{t('progress.features.pomodoroSessions.description')}</div>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm font-medium">{t('progress.features.streaks.title')}</div>
                <div className="text-xs text-muted-foreground">{t('progress.features.streaks.description')}</div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/timer">{t('progress.backToTimer')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}