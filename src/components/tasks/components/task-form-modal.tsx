"use client"

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, AlertCircle, Tag as TagIcon, Loader2 } from 'lucide-react'
import { Task } from '@/stores/task-store'
import { useI18n } from '@/contexts/i18n-context'
import { cn } from '@/lib/utils'
import { TemplatePicker } from './template-picker'
import { TaskTemplate } from '@/hooks/use-templates'

interface TaskFormModalProps {
  editingTask: Task | null
  isOpen: boolean
  isLoading?: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: any) => void
  availableTags?: string[]
  userTags?: string[]
  isSaving?: boolean
}

const DEFAULT_FORM_STATE = {
  title: '',
  description: '',
  estimatePomodoros: 1,
  priority: 'medium' as Task['priority'],
  status: 'todo' as Task['status'],
  tags: [] as string[],
  dueDate: '' as string,
}

export function TaskFormModal({
  editingTask,
  isOpen,
  isLoading = false,
  onOpenChange,
  onSave,
  availableTags = [],
  userTags = [],
}: TaskFormModalProps) {
  const { t } = useI18n()
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE)
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description ?? '',
        estimatePomodoros: editingTask.estimatePomodoros,
        priority: editingTask.priority,
        status: editingTask.status,
        tags: editingTask.tags,
        dueDate: editingTask.dueDate ? editingTask.dueDate.split('T')[0] : '',
      })
    } else {
      setFormData(DEFAULT_FORM_STATE)
    }
    setErrors({})
  }, [editingTask, isOpen])

  // Handle template selection
  const handleTemplateSelect = (template: TaskTemplate) => {
    setFormData({
      ...formData,
      title: template.title,
      description: template.description ?? '',
      estimatePomodoros: template.estimatePomodoros,
      priority: template.priority,
      tags: template.tags,
    })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = t('errors.fieldRequired')
    }
    if (formData.estimatePomodoros < 1) {
      newErrors.estimatePomodoros = 'Minimum 1 pomodoro'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      const payload = {
        ...formData,
        // Convert date string to ISO format for API
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      }
      onSave(payload)
    }
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmedTag] })
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-semibold truncate">
                {editingTask ? t('tasks.editTask') : t('tasks.addTask')}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {t('tasks.subtitle')}
              </p>
            </div>
            {!editingTask && (
              <div className="shrink-0">
                <TemplatePicker onSelect={handleTemplateSelect} />
              </div>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium text-foreground/80">
              {t('tasks.taskName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('tasks.taskNamePlaceholder')}
              className={cn("h-11 text-base", errors.title ? 'border-destructive' : '')}
              autoFocus
            />
            {errors.title && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-foreground/80">
              {t('tasks.taskDescription')}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('tasks.taskDescriptionPlaceholder')}
              className={cn("resize-none min-h-[80px]", errors.description ? 'border-destructive' : '')}
            />
            {errors.description && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="estimatePomodoros" className="text-sm font-medium text-foreground/80">
                {t('tasks.estimated')}
              </Label>
              <Input
                id="estimatePomodoros"
                type="number"
                min="1"
                max="64"
                value={formData.estimatePomodoros === 0 ? '' : formData.estimatePomodoros}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value)
                  setFormData({ ...formData, estimatePomodoros: isNaN(val) ? 0 : val })
                }}
                className={cn("h-10", errors.estimatePomodoros ? 'border-destructive' : '')}
              />
              {errors.estimatePomodoros && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.estimatePomodoros}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-sm font-medium text-foreground/80">
                {t('tasks.priority')}
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(val: Task['priority']) =>
                  setFormData({ ...formData, priority: val })
                }
              >
                <SelectTrigger id="priority" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('tasks.priorityLevels.low')}</SelectItem>
                  <SelectItem value="medium">{t('tasks.priorityLevels.medium')}</SelectItem>
                  <SelectItem value="high">{t('tasks.priorityLevels.high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-sm font-medium text-foreground/80">
                {t('tasks.dueDate')}
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          {/* Only show status field when editing existing task */}
          {editingTask && (
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm font-medium text-foreground/80">
                {t('tasks.status')}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(val: Task['status']) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger id="status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{t('tasks.statuses.todo')}</SelectItem>
                  <SelectItem value="doing">{t('tasks.statuses.doing')}</SelectItem>
                  <SelectItem value="done">{t('tasks.statuses.done')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
              <TagIcon className="h-3.5 w-3.5" /> Tags
            </Label>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-1.5">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pl-2.5 pr-1 h-6 gap-1 bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(tagInput)
                  }
                }}
                placeholder="Add tags..."
                className="h-9"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddTag(tagInput)}
                className="shrink-0 h-9 px-2 sm:px-3"
              >
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t('common.add')}</span>
              </Button>
            </div>

            {/* Tag Suggestions */}
            {userTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground w-full mb-0.5">Suggestions:</span>
                {userTags
                  .filter(tag => !formData.tags.includes(tag))
                  .map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 bg-muted/30 border-t shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 sm:flex-none min-w-[100px] gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingTask ? t('common.save') : t('tasks.actions.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
