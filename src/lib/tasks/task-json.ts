import type { tasks } from '@/db/schema';

type TaskRow = typeof tasks.$inferSelect;

/** Wire format of a task: snake_case, as the client has always received it. */
export function toTaskJson(task: TaskRow) {
  return {
    id: task.id,
    user_id: task.userId,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    estimate_pomodoros: task.estimatePomodoros,
    actual_pomodoros: task.actualPomodoros,
    time_spent: task.timeSpentMs,
    tags: task.tags,
    due_date: task.dueDate,
    display_order: task.displayOrder,
    is_template: task.isTemplate,
    is_deleted: task.isDeleted,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}
