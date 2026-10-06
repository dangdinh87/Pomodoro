"use client"

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Flag, Minus, Plus, SlidersHorizontal, Timer } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { IconTile } from '@/components/ui/icon-tile'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaskPriority } from '@/stores/task-store'
import { useI18n } from '@/contexts/i18n-context'

const MAX_ESTIMATE = 12

interface TaskQuickAddProps {
  onCreate: (input: { title: string; priority: TaskPriority; estimatePomodoros: number }) => Promise<void>
  onOpenDetails: () => void
}

export const TaskQuickAdd = forwardRef<HTMLInputElement, TaskQuickAddProps>(function TaskQuickAdd(
  { onCreate, onOpenDetails },
  ref,
) {
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [estimate, setEstimate] = useState(1)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)
  const hasTitle = title.trim().length > 0

  const submit = () => {
    const value = title.trim()
    if (!value) return
    setTitle('')
    inputRef.current?.focus()
    void onCreate({ title: value, priority, estimatePomodoros: estimate }).catch(() => setTitle(value))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      // The whole bar is one sticker field: typing in it turns the shadow accent-coloured and draws the focus ring.
      className="field flex h-auto flex-wrap items-center gap-x-1 gap-y-1 px-2.5 py-2 has-[input:focus-visible]:shadow-[2px_2px_0_var(--accent-solid)] has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-ring sm:flex-nowrap"
    >
      <IconTile icon={Plus} tone="tomato" size="sm" weight="bold" className="shrink-0" />
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('tasksUi.quickAddPlaceholder')}
        aria-label={t('tasksUi.quickAddLabel')}
        maxLength={200}
        className="h-8 min-w-0 flex-1 basis-[calc(100%-2.5rem)] bg-transparent px-2 font-body text-[0.9375rem] pointer-coarse:text-base font-semibold text-ink outline-hidden placeholder:font-medium placeholder:text-ink-muted sm:basis-0"
      />

      <div className="flex w-full items-center gap-1 sm:w-auto">
        <div
          role="group"
          aria-label={t('tasksUi.estimateLabel')}
          className="inline-flex h-8 items-center rounded-md text-[0.8125rem] text-ink-secondary"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-7"
            disabled={estimate <= 1}
            onClick={() => setEstimate((n) => Math.max(1, n - 1))}
            aria-label={t('tasksUi.estimateDecrease')}
          >
            <Minus size={13} />
          </Button>
          <span
            className="inline-flex min-w-22 items-center justify-center gap-1.5 whitespace-nowrap tabular-nums"
          >
            <Timer size={14} className="text-ink-muted" aria-hidden />
            {t(estimate === 1 ? 'tasksUi.estimateValue' : 'tasksUi.estimateValuePlural', { count: estimate })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-7"
            disabled={estimate >= MAX_ESTIMATE}
            onClick={() => setEstimate((n) => Math.min(MAX_ESTIMATE, n + 1))}
            aria-label={t('tasksUi.estimateIncrease')}
          >
            <Plus size={13} />
          </Button>
        </div>

        <Select value={priority} onValueChange={(v: TaskPriority) => setPriority(v)}>
          <SelectTrigger
            aria-label={t('tasksUi.priorityLabel')}
            className="h-8 w-auto gap-1.5 border-transparent bg-transparent px-2 text-[0.8125rem] text-ink-secondary shadow-none! hover:bg-surface-hover data-[state=open]:shadow-none! focus-visible:shadow-none!"
          >
            <Flag size={14} className="shrink-0 text-ink-muted" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">{t('tasks.priorityLevels.low')}</SelectItem>
            <SelectItem value="medium">{t('tasks.priorityLevels.medium')}</SelectItem>
            <SelectItem value="high">{t('tasks.priorityLevels.high')}</SelectItem>
          </SelectContent>
        </Select>

        <span className="flex-1 sm:hidden" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-ink-muted"
          onClick={onOpenDetails}
          aria-label={t('tasksUi.addDetails')}
          title={t('tasksUi.addDetails')}
        >
          <SlidersHorizontal size={16} />
        </Button>
        {hasTitle && (
          <Button type="submit" size="sm">
            {t('tasksUi.add')}
          </Button>
        )}
      </div>
    </form>
  )
})
