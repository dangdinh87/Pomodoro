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
import { X, Plus, AlertCircle, Tag as TagIcon } from 'lucide-react'
import { Task } from '@/stores/task-store'
import { useI18n } from '@/contexts/i18n-context'

interface TaskFormModalProps {
  editingTask: Task | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: any) => void
  availableTags?: string[]
  isSaving?: boolean
}

const DEFAULT_FORM_STATE = {
  title: '',
  description: '',
  estimatePomodoros: 1,
  priority: 'medium' as Task['priority'],
  status: 'pending' as Task['status'],
  tags: [] as string[],
}

export function TaskFormModal({
  editingTask,
  isOpen,
  onOpenChange,
  onSave,
  availableTags = [],
  isSaving = false,
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
      })
    } else {
      setFormData(DEFAULT_FORM_STATE)
    }
    setErrors({})
  }, [editingTask, isOpen])

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
      onSave(formData)
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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            {editingTask ? t('tasks.editTask') : t('tasks.addTask')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t('tasks.subtitle')}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              {t('tasks.taskName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('tasks.taskNamePlaceholder')}
              className={errors.title ? 'border-destructive' : ''}
              autoFocus
            />
            {errors.title && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              {t('tasks.taskDescription')}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('tasks.taskDescriptionPlaceholder')}
              className="resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatePomodoros" className="text-sm font-semibold">
                {t('tasks.estimated')}
              </Label>
              <Input
                id="estimatePomodoros"
                type="number"
                min="1"
                max="100"
                value={formData.estimatePomodoros === 0 ? '' : formData.estimatePomodoros}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value)
                  setFormData({ ...formData, estimatePomodoros: val })
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold">
                {t('tasks.priority')}
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(val: Task['priority']) =>
                  setFormData({ ...formData, priority: val })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('tasks.priorityLevels.low')}</SelectItem>
                  <SelectItem value="medium">{t('tasks.priorityLevels.medium')}</SelectItem>
                  <SelectItem value="high">{t('tasks.priorityLevels.high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">
              {t('tasks.status')}
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val: Task['status']) =>
                setFormData({ ...formData, status: val })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t('tasks.statuses.pending')}</SelectItem>
                <SelectItem value="in_progress">{t('tasks.statuses.in_progress')}</SelectItem>
                <SelectItem value="done">{t('tasks.statuses.done')}</SelectItem>
                <SelectItem value="cancelled">{t('tasks.statuses.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <TagIcon className="h-3.5 w-3.5" /> Tags
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-6">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="pl-2 pr-1 h-6 gap-1 group/tag bg-primary/10 text-primary border-none hover:bg-primary/20 transition-colors"
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
                className="shrink-0 h-9"
              >
                <Plus className="h-4 w-4 mr-1" /> {t('common.add')}
              </Button>
            </div>
          </div>
        </form>

        <DialogFooter className="p-6 pt-2 bg-muted/30 border-t">
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
            className="flex-1 sm:flex-none px-8 gap-2"
            disabled={isSaving}
          >
            {isSaving && <Plus className="h-4 w-4 animate-spin rotate-45" />}
            {editingTask ? t('tasks.actions.save') : t('tasks.actions.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
