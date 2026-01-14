import { FormEvent } from 'react'
import { Task, TaskPriority } from '@/stores/task-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTaskForm, TaskFormSubmission } from '@/hooks/use-task-form'

interface TaskFormProps {
  editingTask: Task | null
  isSaving: boolean
  onSubmit: (values: TaskFormSubmission) => Promise<void>
  onCancelEdit: () => void
}

export function TaskForm({
  editingTask,
  isSaving,
  onSubmit,
  onCancelEdit,
}: TaskFormProps) {
  const { formState, updateField, getSubmissionData, isValid } = useTaskForm(editingTask)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return

    const payload = getSubmissionData()
    await onSubmit(payload)
  }

  return (
    <section className="rounded-xl border bg-card/70 backdrop-blur p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {editingTask ? 'Update selected task' : 'Create a new task to get started'}
          </p>
          <h2 className="text-lg font-semibold">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
        </div>

        {editingTask && (
          <Button 
            variant="ghost" 
            onClick={onCancelEdit}
            aria-label="Cancel editing"
          >
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-title" className="text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="task-title"
            placeholder="Enter task title"
            value={formState.title}
            onChange={(event) => updateField('title', event.target.value)}
            aria-required="true"
            aria-invalid={!isValid && formState.title.trim().length === 0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-description" className="text-sm font-medium">
            Description (optional)
          </Label>
          <textarea
            id="task-description"
            placeholder="Add a detailed description"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            value={formState.description}
            onChange={(event) =>
              updateField('description', event.target.value)
            }
            aria-label="Task description"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="estimate-pomodoros" className="text-sm font-medium">
              Estimated Pomodoros
            </Label>
            <Input
              id="estimate-pomodoros"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-priority" className="text-sm font-medium">
              Priority Level
            </Label>
            <Select
              value={formState.priority}
              onValueChange={(value: TaskPriority) => updateField('priority', value)}
              aria-label="Task priority level"
            >
              <SelectTrigger id="task-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-tags" className="text-sm font-medium">
              Tags
            </Label>
            <Input
              id="task-tags"
              placeholder="e.g., study, deep work"
              value={formState.tags}
              onChange={(event) => updateField('tags', event.target.value)}
              aria-label="Task tags (comma-separated)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {editingTask && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSaving || !isValid}
            aria-busy={isSaving}
          >
            {isSaving ? 'Saving...' : editingTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      </form>
    </section>
  )
}












