-- Function to increment task pomodoro count and time spent
-- This function is called from the session completion API
-- It safely increments values atomically

CREATE OR REPLACE FUNCTION increment_task_pomodoro(
  task_id_input UUID,
  user_id_input UUID,
  duration_ms_input INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tasks
  SET 
    actual_pomodoros = actual_pomodoros + 1,
    time_spent = time_spent + duration_ms_input,
    updated_at = NOW()
  WHERE 
    id = task_id_input 
    AND user_id = user_id_input;
END;
$$;
