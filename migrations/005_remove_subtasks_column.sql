-- Drop subtasks jsonb column from tasks table
ALTER TABLE tasks DROP COLUMN IF EXISTS subtasks;
