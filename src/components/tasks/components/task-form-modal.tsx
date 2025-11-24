import { useState, useEffect, useRef, useMemo } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/stores/task-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTaskForm, TaskFormSubmission } from '@/hooks/use-task-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit } from 'lucide-react'

interface TaskFormModalProps {
  editingTask?: Task | null
  trigger?: React.ReactNode
  onSave?: (payload: TaskFormSubmission) => Promise<void>
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  availableTags?: string[]
}

export function TaskFormModal({ editingTask, trigger, onSave, isOpen: controlledIsOpen, onOpenChange, availableTags = [] }: TaskFormModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen ?? internalIsOpen
  const setIsOpen = onOpenChange ?? setInternalIsOpen

  const { formState, updateField, getSubmissionData, isValid, resetForm } = useTaskForm(editingTask || null)

  // Tag input state
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens/closes or editing task changes
  useEffect(() => {
    if (isOpen) {
      // If we have an editing task, the hook handles initialization, but we might need to reset if it changes
    } else {
      resetForm()
      setTagInput('')
      setShowTagSuggestions(false)
    }
  }, [isOpen, editingTask, resetForm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    const payload = getSubmissionData()

    if (onSave) {
      await onSave(payload)
    }

    setIsOpen(false)
    resetForm()
    setTagInput('')
  }

  const defaultTrigger = editingTask ? (
    <Button variant="outline" size="sm">
      <Edit className="h-3 w-3 mr-1" />
      Edit
    </Button>
  ) : (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add New Task
    </Button>
  )

  // Tag handling
  const currentTags = useMemo(() => {
    return formState.tags.split(',').map(t => t.trim()).filter(Boolean)
  }, [formState.tags])

  const filteredTags = useMemo(() => {
    const input = tagInput.toLowerCase().trim()
    return availableTags.filter(tag =>
      !currentTags.includes(tag) &&
      tag.toLowerCase().includes(input)
    )
  }, [availableTags, currentTags, tagInput])

  const addTag = (tag: string) => {
    const newTags = [...currentTags, tag]
    updateField('tags', newTags.join(', '))
    setTagInput('')
    setShowTagSuggestions(false)
    tagInputRef.current?.focus()
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    updateField('tags', newTags.join(', '))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (tagInput.trim()) {
        addTag(tagInput.trim())
      }
    } else if (e.key === 'Backspace' && !tagInput && currentTags.length > 0) {
      removeTag(currentTags[currentTags.length - 1])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="max-w-md overflow-visible">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {editingTask
              ? 'Update your task details and save changes.'
              : 'Add a new task to your Pomodoro workflow.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="modal-task-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="modal-task-title"
              placeholder="Enter task title"
              value={formState.title}
              onChange={(event) => updateField('title', event.target.value)}
              aria-required="true"
              aria-invalid={!isValid && formState.title.trim().length === 0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-task-description" className="text-sm font-medium">
              Description (optional)
            </Label>
            <textarea
              id="modal-task-description"
              placeholder="Add a detailed description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              value={formState.description}
              onChange={(event) => updateField('description', event.target.value)}
              aria-label="Task description"
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="modal-estimate-pomodoros" className="text-sm font-medium">
                Estimated Pomodoros
              </Label>

              <Input
                id="modal-estimate-pomodoros"
                type="number"
                min={1}
                max={99}
                value={formState.estimatePomodoros}
                onChange={(event) =>
                  updateField(
                    'estimatePomodoros',
                    Math.max(1, Number(event.target.value) || 1),
                  )
                }
                aria-label="Estimated number of Pomodoros"
              />
              <p className="text-xs text-muted-foreground">
                1 Pomodoro = 25 minutes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-task-priority" className="text-sm font-medium">
                Priority Level
              </Label>
              <Select
                value={formState.priority}
                onValueChange={(value: TaskPriority) => updateField('priority', value)}
                aria-label="Task priority level"
              >
                <SelectTrigger id="modal-task-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[0.8rem] text-muted-foreground">
                Set the urgency of this task
              </p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">


            <div className="space-y-2">
              <Label htmlFor="modal-task-status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formState.status}
                onValueChange={(value: TaskStatus) => updateField('status', value)}
                aria-label="Task status"
              >
                <SelectTrigger id="modal-task-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <Label htmlFor="modal-task-tags" className="text-sm font-medium">
              Tags
            </Label>
            <div className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-ring flex flex-wrap gap-2">
              {currentTags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag} tag</span>
                  </button>
                </Badge>
              ))}
              <input
                ref={tagInputRef}
                id="modal-task-tags"
                type="text"
                className="flex-1 bg-transparent outline-none min-w-[80px] placeholder:text-muted-foreground"
                placeholder={currentTags.length === 0 ? "Select or create tags..." : ""}
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value)
                  setShowTagSuggestions(true)
                }}
                onFocus={() => setShowTagSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                onKeyDown={handleTagKeyDown}
                autoComplete="off"
              />
            </div>

            {showTagSuggestions && (tagInput || filteredTags.length > 0) && (
              <div className="absolute top-full left-0 w-full mt-1 bg-popover border rounded-md shadow-md overflow-hidden z-50 max-h-[200px] overflow-y-auto">
                {filteredTags.length > 0 && (
                  <div className="p-1">
                    <div className="text-xs text-muted-foreground px-2 py-1 font-medium">Suggested</div>
                    {filteredTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center gap-2"
                        onClick={() => addTag(tag)}
                      >
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                )}
                {tagInput && !currentTags.includes(tagInput) && (
                  <div className="p-1 border-t">
                    <button
                      type="button"
                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center gap-2 text-primary"
                      onClick={() => addTag(tagInput)}
                    >
                      <Plus className="h-3 w-3" />
                      Create "{tagInput}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full"
          >
            {editingTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
