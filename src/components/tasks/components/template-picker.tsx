"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Bookmark, ChevronDown, Sparkles } from 'lucide-react'
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
          className="h-8 gap-1.5 text-xs font-medium"
          disabled={isLoading}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {t('tasks.templates.useTemplate')}
          {templates.length > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] ml-0.5">
              {templates.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0 overflow-hidden">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{t('tasks.templates.title')}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('tasks.templates.description')}
          </p>
        </div>
        {templates.length === 0 ? (
          <div className="p-6 text-center">
            <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">{t('tasks.templates.empty')}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{t('tasks.templates.emptyHint')}</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors overflow-hidden",
                  "hover:bg-accent/50 focus:bg-accent/50 focus:outline-none",
                  "border border-transparent hover:border-border"
                )}
              >
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{template.title}</p>
                  {template.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {template.estimatePomodoros} pomodoro{template.estimatePomodoros > 1 ? 's' : ''}
                  </span>
                  {template.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[9px] h-4 px-1.5"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
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
