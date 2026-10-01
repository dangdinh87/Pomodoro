"use client"

import { useRouter } from 'next/navigation'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { TaskManagement } from '@/components/tasks/task-management'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/contexts/i18n-context'

export default function TasksPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { t } = useI18n()

  if (isLoading) {
    return (
      <PageContainer size="narrow" className="flex min-h-[50vh] items-center justify-center">
        <CircleNotch size={28} className="animate-spin text-ink-faint" aria-label={t('common.loading')} />
      </PageContainer>
    )
  }

  if (!isAuthenticated) {
    return (
      <PageContainer size="narrow">
        <PageHeader title={t('tasks.title')} />
        <EmptyState
          title={t('auth.signInToManageTasks')}
          description={t('tasksUi.signedOutDescription')}
          action={<Button onClick={() => router.push('/login?redirect=/tasks')}>{t('auth.signInButton')}</Button>}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer size="narrow">
      <TaskManagement />
    </PageContainer>
  )
}
