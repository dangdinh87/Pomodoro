
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Leaderboard View
CREATE OR REPLACE VIEW public.leaderboard AS
WITH session_stats AS (
  SELECT
    user_id,
    SUM(duration) as total_focus_time
  FROM public.sessions
  WHERE mode = 'work'
  GROUP BY user_id
),
task_stats AS (
  SELECT
    user_id,
    COUNT(*) as tasks_completed
  FROM public.tasks
  WHERE status = 'DONE' OR status = 'done'
  GROUP BY user_id
)
SELECT
  p.id as user_id,
  p.name,
  p.avatar_url,
  COALESCE(s.total_focus_time, 0) as total_focus_time,
  COALESCE(t.tasks_completed, 0) as tasks_completed
FROM
  public.profiles p
  LEFT JOIN session_stats s ON p.id::text = s.user_id
  LEFT JOIN task_stats t ON p.id::text = t.user_id;
