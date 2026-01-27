"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bookmark, Loader2, Trash2 } from 'lucide-react'
import { useI18n } from '@/contexts/i18n-context'
import { TaskTemplate, useTemplates } from '@/hooks/use-templates'
import { TaskPriority } from '@/stores/task-store'

interface TemplateManagerProps {
  trigger?: React.ReactNode
}

const priorityVariants: Record<TaskPriority, "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
}

export function TemplateManager({ trigger }: TemplateManagerProps) {
  const { t } = useI18n()
  const { templates, isLoading, removeTemplate } = useTemplates()
  const [isOpen, setIsOpen] = useState(false)
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
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="h-10 px-4 gap-2">
            <Bookmark className="h-4 w-4" />
            {t('tasks.templates.title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-500 fill-amber-500/20" />
            {t('tasks.templates.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">{t('tasks.templates.empty')}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{t('tasks.templates.emptyHint')}</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2 pr-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="grid grid-cols-[1fr_auto] gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-sm truncate">{template.title}</span>
                        <Badge
                          variant={priorityVariants[template.priority]}
                          className="text-[10px] h-5 shrink-0"
                        >
                          {t(`tasks.priorityLevels.${template.priority}`)}
                        </Badge>
                      </div>
                      {template.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {template.estimatePomodoros} pomodoro{template.estimatePomodoros > 1 ? 's' : ''}
                        </span>
                        {template.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1.5">
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
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive self-start"
                      onClick={() => handleRemove(template.id)}
                      disabled={removingId === template.id}
                    >
                      {removingId === template.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
