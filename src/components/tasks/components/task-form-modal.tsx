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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { X, Plus, WarningCircle, CalendarBlank, CircleNotch } from '@phosphor-icons/react/dist/ssr';
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

const toDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

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
  const { t, lang } = useI18n()
  const [dateOpen, setDateOpen] = useState(false)
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
      newErrors.estimatePomodoros = t('tasksUi.estimateMin')
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

  const suggestions = userTags.filter((tag) => !formData.tags.includes(tag))

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {editingTask ? t('tasks.editTask') : t('tasks.addTask')}
              </DialogTitle>
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
            <Label htmlFor="title" className="text-sm font-medium text-ink-secondary">
              {t('tasks.taskName')} <span className="text-danger-ink">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('tasks.taskNamePlaceholder')}
              className={cn("h-11 text-base", errors.title ? 'border-danger' : '')}
              autoFocus
            />
            {errors.title && (
              <p className="text-[11px] text-danger-ink flex items-center gap-1">
                <WarningCircle size={12} /> {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-ink-secondary">
              {t('tasks.taskDescription')}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('tasks.taskDescriptionPlaceholder')}
              className={cn("resize-none min-h-[80px]", errors.description ? 'border-danger' : '')}
            />
            {errors.description && (
              <p className="text-[11px] text-danger-ink flex items-center gap-1">
                <WarningCircle size={12} /> {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 [&>div]:min-w-0">
            <div className="space-y-1.5">
              <Label htmlFor="estimatePomodoros" className="text-sm font-medium text-ink-secondary">
                {t('tasksUi.estimateShort')}
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
                className={cn("h-10", errors.estimatePomodoros ? 'border-danger' : '')}
              />
              {errors.estimatePomodoros && (
                <p className="text-[11px] text-danger-ink flex items-center gap-1">
                  <WarningCircle size={12} /> {errors.estimatePomodoros}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-sm font-medium text-ink-secondary">
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

            <div className="col-span-2 space-y-1.5 sm:col-span-1">
              <Label htmlFor="dueDate" className="text-sm font-medium text-ink-secondary">
                {t('tasks.dueDate')}
              </Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="dueDate"
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start gap-2 px-3 font-normal"
                  >
                    <CalendarBlank size={16} className="shrink-0 text-ink-muted" />
                    <span className={cn('truncate', !formData.dueDate && 'text-ink-faint')}>
                      {formData.dueDate
                        ? toDate(formData.dueDate).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })
                        : t('tasksUi.pickDate')}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate ? toDate(formData.dueDate) : undefined}
                    defaultMonth={formData.dueDate ? toDate(formData.dueDate) : undefined}
                    onSelect={(date) => {
                      setFormData({ ...formData, dueDate: date ? toDateString(date) : '' })
                      setDateOpen(false)
                    }}
                  />
                  {formData.dueDate && (
                    <div className="border-t border-border p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setFormData({ ...formData, dueDate: '' })
                          setDateOpen(false)
                        }}
                      >
                        {t('tasksUi.clearDate')}
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Only show status field when editing existing task */}
          {editingTask && (
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm font-medium text-ink-secondary">
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
            <Label htmlFor="tag-input" className="text-sm font-medium text-ink-secondary">
              {t('tasksUi.tagsLabel')}
            </Label>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-1.5">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="h-6 gap-1 pl-2.5 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded-full p-0.5 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      aria-label={`${t('common.delete')} ${tag}`}
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                id="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(tagInput)
                  }
                }}
                placeholder={t('tasksUi.tagsPlaceholder')}
                className="h-9"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!tagInput.trim()}
                onClick={() => handleAddTag(tagInput)}
                className="h-9 shrink-0 gap-1 px-3"
              >
                <Plus size={14} />
                {t('common.add')}
              </Button>
            </div>

            {/* Tag Suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="mr-1 text-xs text-ink-muted">{t('tasksUi.tagSuggestions')}</span>
                {suggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-ink-secondary transition-colors hover:border-border-strong hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 bg-surface-raised border-t border-border shrink-0">
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
            {isLoading && <CircleNotch size={16} className="animate-spin" />}
            {editingTask ? t('common.save') : t('tasks.actions.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
