'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { useI18n } from '@/contexts/i18n-context'

export default function ProgressPage() {
  const { t } = useI18n();

  return (
    <PageContainer size="narrow">
      <PageHeader title={t('nav.history')} />
      <div className="rounded-lg border border-border bg-surface">
        <EmptyState
          title={t('progress.comingSoon')}
          description={t('progress.description')}
          action={
            <Button asChild>
              <Link href="/timer">{t('progress.backToTimer')}</Link>
            </Button>
          }
        />
      </div>
    </PageContainer>
  )
}
