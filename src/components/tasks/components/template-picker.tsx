"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
          className="h-8 gap-1.5 text-[0.8125rem]"
          disabled={isLoading}
        >
          <BookmarkSimple size={14} />
          {t('tasks.templates.useTemplate')}
          {templates.length > 0 && (
            <Badge variant="secondary" className="ml-0.5">
              {templates.length}
            </Badge>
          )}
          <CaretDown size={12} className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0 overflow-hidden">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <BookmarkSimple size={16} className="text-ink-faint" />
            <span className="font-semibold text-sm">{t('tasks.templates.title')}</span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {t('tasks.templates.description')}
          </p>
        </div>
        {templates.length === 0 ? (
          <div className="p-6 text-center">
            <BookmarkSimple size={32} className="mx-auto text-ink-muted/30 mb-2" />
            <p className="text-sm text-ink-muted">{t('tasks.templates.empty')}</p>
            <p className="text-xs text-ink-muted/70 mt-1">{t('tasks.templates.emptyHint')}</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors overflow-hidden",
                  "hover:bg-surface-hover focus:bg-surface-hover focus:outline-none",
                  "border border-transparent hover:border-border"
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
                  <span className="text-[10px] text-ink-muted">
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
                        <span className="text-[10px] text-ink-muted">
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
