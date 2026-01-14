-- Drop streaks table if it exists to ensure clean recreation with correct types
DROP TABLE IF EXISTS public.streaks;

-- Create streaks table with correct UUID type for user_id
CREATE TABLE public.streaks (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "current" INTEGER NOT NULL DEFAULT 0,
    longest INTEGER NOT NULL DEFAULT 0,
    last_session TIMESTAMP(3) WITHOUT TIME ZONE,
    user_id UUID NOT NULL, -- Changed from TEXT to UUID to match auth.users.id
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS streaks_user_id_key ON public.streaks(user_id);

-- Add foreign key for streaks
ALTER TABLE public.streaks
    ADD CONSTRAINT streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key for sessions -> tasks if missing
-- Note: This assumes tasks table exists. If not, it needs to be created too.
-- Based on error "Could not find a relationship between 'sessions' and 'tasks'", 
-- we need to ensure the foreign key exists.

-- First, check if the constraint exists, if not add it. 
-- Since we can't easily check in raw SQL without a function, we'll try to drop it first to avoid errors
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_task_id_fkey;

ALTER TABLE public.sessions
    ADD CONSTRAINT sessions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS for streaks
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for streaks
-- Drop existing policies if any (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can insert their own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can update their own streaks" ON public.streaks;

CREATE POLICY "Users can view their own streaks" ON public.streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.streaks
    FOR UPDATE USING (auth.uid() = user_id);
