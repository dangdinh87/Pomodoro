"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CircleNotch, Trash } from '@phosphor-icons/react/dist/ssr';
import { useI18n } from '@/contexts/i18n-context'
import { TaskTemplate, useTemplates } from '@/hooks/use-templates'

interface TemplateManagerProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TemplateManager({ trigger, open, onOpenChange }: TemplateManagerProps) {
  const { t } = useI18n()
  const { templates, isLoading, removeTemplate } = useTemplates()
  const [innerOpen, setInnerOpen] = useState(false)
  const isOpen = open ?? innerOpen
  const setIsOpen = onOpenChange ?? setInnerOpen
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (id: string) => {
    setRemovingId(id)
    try {
      await removeTemplate(id)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('tasks.templates.title')}</DialogTitle>
          <DialogDescription>{t('tasksUi.templatesDescription')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <CircleNotch size={20} className="animate-spin text-ink-muted" />
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-ink-faint px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink">{t('tasks.templates.empty')}</p>
            <p className="mx-auto mt-1 max-w-[32ch] text-[0.8125rem] text-ink-muted">{t('tasks.templates.emptyHint')}</p>
          </div>
        ) : (
          <ul className="sticker-sm max-h-[400px] divide-y-2 divide-border overflow-y-auto">
            {templates.map((template) => (
              <li key={template.id} className="flex items-start gap-3 py-3 pl-4 pr-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium text-ink">{template.title}</p>
                  {template.description && <p className="truncate text-[0.8125rem] text-ink-muted">{template.description}</p>}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                    {template.priority !== 'low' && (
                      <Badge variant={template.priority === 'high' ? 'destructive' : 'warning'}>
                        {t(`tasks.priorityLevels.${template.priority}`)}
                      </Badge>
                    )}
                    <span className="tabular-nums">
                      {t(template.estimatePomodoros === 1 ? 'tasksUi.estimateValue' : 'tasksUi.estimateValuePlural', {
                        count: template.estimatePomodoros,
                      })}
                    </span>
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && <span className="font-bold text-ink-muted">+{template.tags.length - 3}</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-ink-muted hover:text-danger-ink"
                  onClick={() => handleRemove(template.id)}
                  disabled={removingId === template.id}
                  aria-label={`${t('common.delete')} ${template.title}`}
                >
                  {removingId === template.id ? <CircleNotch size={16} className="animate-spin" /> : <Trash size={16} />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
