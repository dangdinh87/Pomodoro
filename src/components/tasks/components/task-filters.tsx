"use client"

import { useEffect, useRef, useState } from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react/dist/ssr'
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/contexts/i18n-context'

export type TaskScope = 'all' | 'today' | 'todo' | 'doing' | 'done'

const SCOPES: { value: TaskScope; labelKey: string }[] = [
  { value: 'all', labelKey: 'tasksUi.filterAll' },
  { value: 'today', labelKey: 'tasksUi.filterToday' },
  { value: 'todo', labelKey: 'tasksUi.filterTodo' },
  { value: 'doing', labelKey: 'tasksUi.filterDoing' },
  { value: 'done', labelKey: 'tasksUi.filterDone' },
]

interface TaskFiltersProps {
  scope: TaskScope
  counts: Record<TaskScope, number>
  query: string
  onScopeChange: (scope: TaskScope) => void
  onQueryChange: (query: string) => void
}

export function TaskFilters({ scope, counts, query, onScopeChange, onQueryChange }: TaskFiltersProps) {
  const { t } = useI18n()
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  const closeSearch = () => {
    onQueryChange('')
    setSearchOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FilterChipGroup label={t('tasksUi.filterLabel')} className="min-w-0 flex-1">
          {SCOPES.map(({ value, labelKey }) => (
            <FilterChip key={value} active={scope === value} count={counts[value]} onClick={() => onScopeChange(value)}>
              {t(labelKey)}
            </FilterChip>
          ))}
        </FilterChipGroup>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-ink-muted"
          aria-pressed={searchOpen}
          aria-label={searchOpen ? t('tasksUi.searchClose') : t('tasksUi.searchOpen')}
          onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
        >
          {searchOpen ? <X size={16} /> : <MagnifyingGlass size={16} />}
        </Button>
      </div>

      {searchOpen && (
        <div className="relative">
          <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
            placeholder={t('tasksUi.searchPlaceholder')}
            aria-label={t('tasksUi.searchOpen')}
            className="h-10 pl-9"
          />
        </div>
      )}
    </div>
  )
}
