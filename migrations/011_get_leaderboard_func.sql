-- Create function to get leaderboard with optional time period filter
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  period_start TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  user_id text,
  name text,
  avatar_url text,
  total_focus_time bigint,
  tasks_completed bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH session_stats AS (
    SELECT
      s.user_id::text,
      SUM(s.duration) as total_focus_time
    FROM public.sessions s
    WHERE s.mode = 'work'
      AND (period_start IS NULL OR s.created_at >= period_start)
    GROUP BY s.user_id
  ),
  task_stats AS (
    SELECT
      t.user_id::text,
      COUNT(*) as tasks_completed
    FROM public.tasks t
    WHERE (t.status = 'DONE' OR t.status = 'done')
      AND (period_start IS NULL OR t.updated_at >= period_start)
    GROUP BY t.user_id
  )
  SELECT
    p.id::text as user_id,
    p.name,
    p.avatar_url,
    COALESCE(s.total_focus_time, 0)::bigint as total_focus_time,
    COALESCE(t.tasks_completed, 0)::bigint as tasks_completed
  FROM
    public.profiles p
    LEFT JOIN session_stats s ON p.id::text = s.user_id
    LEFT JOIN task_stats t ON p.id::text = t.user_id
  WHERE
    COALESCE(s.total_focus_time, 0) > 0 OR COALESCE(t.tasks_completed, 0) > 0;
END;
$$;
