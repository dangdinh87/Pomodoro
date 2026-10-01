"use client"

import { useEffect, useState } from "react"
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr';
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip"
import { PageContainer, PageHeader } from "@/components/ui/page-header"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/i18n-context"

type LeaderboardEntry = {
  user_id: string
  name: string
  avatar_url: string | null
  total_focus_time: number
  tasks_completed: number
}

type SortBy = 'time' | 'tasks'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortBy>('time')

  useEffect(() => {
    if (user) {
      fetch('/api/leaderboard', { method: 'POST' }).catch(console.error)
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/leaderboard?sortBy=${sortBy}`)
        const data = await res.json()
        if (data.data) {
          setEntries(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sortBy])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={t('leaderboard.title')}
        description={t('leaderboard.description')}
        actions={
          <FilterChipGroup label={t('leaderboard.title')}>
            <FilterChip active={sortBy === 'time'} onClick={() => setSortBy('time')}>
              {t('leaderboard.tabs.focusTime')}
            </FilterChip>
            <FilterChip active={sortBy === 'tasks'} onClick={() => setSortBy('tasks')}>
              {t('leaderboard.tabs.completedTasks')}
            </FilterChip>
          </FilterChipGroup>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse bg-surface-raised/40" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState title={t('leaderboard.empty')} className="min-h-[280px] py-8" />
        ) : (
          <ol className="divide-y divide-border">
            {entries.map((entry, index) => {
              const isCurrentUser = entry.user_id === user?.id
              const rank = index + 1

              return (
                <li
                  key={entry.user_id}
                  aria-current={isCurrentUser ? 'true' : undefined}
                  className={cn("flex items-center gap-3 px-5 py-3", isCurrentUser && "bg-surface-raised")}
                >
                  <span
                    className={cn(
                      "w-8 shrink-0 font-heading text-base font-bold tabular-nums",
                      rank <= 3 ? "text-gold" : "text-ink-muted"
                    )}
                  >
                    {rank}
                  </span>

                  <Avatar className="h-8 w-8 shrink-0 border border-border">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>
                      <UserIcon size={12} />
                    </AvatarFallback>
                  </Avatar>

                  <p className={cn("min-w-0 flex-1 truncate text-sm text-ink", isCurrentUser ? "font-semibold" : "font-medium")}>
                    {entry.name}
                    {isCurrentUser && <span className="ml-1.5 font-normal text-ink-muted">({t('leaderboard.you')})</span>}
                  </p>

                  <span className="shrink-0 font-heading text-sm font-bold tabular-nums text-ink">
                    {sortBy === 'time'
                      ? formatTime(entry.total_focus_time)
                      : t('pagesUi.leaderboard.tasksCount', { count: entry.tasks_completed })}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </PageContainer>
  )
}
