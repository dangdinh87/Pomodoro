"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IconTile } from '@/components/ui/icon-tile'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { BookmarkSimple, CaretDown } from '@phosphor-icons/react/dist/ssr';
import { TaskTemplate, useTemplates } from '@/hooks/use-templates'
import { cn } from '@/lib/utils'
import { useI18n } from '@/contexts/i18n-context'

interface TemplatePickerProps {
  onSelect: (template: TaskTemplate) => void
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const { t } = useI18n()
  const { templates, isLoading } = useTemplates()
  const [open, setOpen] = useState(false)

  const handleSelect = (template: TaskTemplate) => {
    onSelect(template)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={isLoading}
        >
          <BookmarkSimple size={14} />
          {t('tasks.templates.useTemplate')}
          {templates.length > 0 && (
            <Badge variant="secondary" className="ml-0.5">
              {templates.length}
            </Badge>
          )}
          <CaretDown size={12} weight="bold" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0 overflow-hidden">
        <div className="border-b-2 border-border p-3">
          <div className="flex items-center gap-2">
            <IconTile icon={BookmarkSimple} tone="lilac" size="sm" />
            <span className="font-heading text-sm font-bold">{t('tasks.templates.title')}</span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {t('tasks.templates.description')}
          </p>
        </div>
        {templates.length === 0 ? (
          <div className="p-6 text-center">
            <BookmarkSimple size={32} className="mx-auto mb-2 text-ink-faint" aria-hidden />
            <p className="text-sm font-semibold text-ink">{t('tasks.templates.empty')}</p>
            <p className="mt-1 text-xs text-ink-muted">{t('tasks.templates.emptyHint')}</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={cn(
                  "focus-ring w-full overflow-hidden rounded-lg border-2 border-transparent p-3 text-left transition-colors focus-visible:outline-offset-0",
                  "hover:border-outline hover:bg-surface-hover"
                )}
              >
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{template.title}</p>
                  {template.description && (
                    <p className="text-xs text-ink-muted truncate mt-0.5">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-ink-muted">
                    {t(template.estimatePomodoros === 1 ? 'tasksUi.estimateValue' : 'tasksUi.estimateValuePlural', { count: template.estimatePomodoros })}
                  </span>
                  {template.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs font-bold text-ink-muted">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
