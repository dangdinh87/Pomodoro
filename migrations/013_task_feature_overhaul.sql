-- Migration: Task Feature Overhaul
-- Date: 2026-01-23
-- Description: Add due_date, parent_task_id, display_order, is_template columns
--              Update status values: PENDING→TODO, IN_PROGRESS→DOING

-- Add new columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Create index for parent_task_id for subtask queries
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);

-- Create index for display_order for sorting
CREATE INDEX IF NOT EXISTS idx_tasks_display_order ON tasks(display_order);

-- Create index for is_template for template queries
CREATE INDEX IF NOT EXISTS idx_tasks_is_template ON tasks(is_template) WHERE is_template = true;

-- Update status values
UPDATE tasks SET status = 'TODO' WHERE status = 'PENDING';
UPDATE tasks SET status = 'DOING' WHERE status = 'IN_PROGRESS';
UPDATE tasks SET status = 'TODO' WHERE status = 'CANCELLED';

-- Set initial display_order based on created_at (newer tasks get higher order)
WITH ordered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM tasks
  WHERE display_order = 0 OR display_order IS NULL
)
UPDATE tasks t
SET display_order = ot.rn
FROM ordered_tasks ot
WHERE t.id = ot.id;
