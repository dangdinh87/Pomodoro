"use client"

import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { TaskManagement } from '@/components/tasks/task-management'
import { PageContainer } from '@/components/ui/page-header'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/contexts/i18n-context'

// Guests use tasks right away: their first task starts a guest session.
export default function TasksPage() {
  const { isLoading } = useAuth()
  const { t } = useI18n()

  if (isLoading) {
    return (
      <PageContainer size="narrow" className="flex min-h-[50vh] items-center justify-center">
        <CircleNotch size={28} className="animate-spin text-ink-faint" aria-label={t('common.loading')} />
      </PageContainer>
    )
  }

  return (
    <PageContainer size="narrow">
      <TaskManagement />
    </PageContainer>
  )
}
