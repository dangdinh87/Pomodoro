-- Fix RLS policies for sessions table
-- This fixes the issue where completed Pomodoro sessions are not being saved

-- Enable RLS for sessions table (if not already enabled)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;

-- Create policy for viewing own sessions
CREATE POLICY "Users can view their own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = user_id::uuid);

-- Create policy for inserting own sessions (THIS IS THE CRITICAL FIX)
CREATE POLICY "Users can insert their own sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- Create policy for updating own sessions
CREATE POLICY "Users can update their own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Create policy for deleting own sessions
CREATE POLICY "Users can delete their own sessions" ON public.sessions
    FOR DELETE USING (auth.uid() = user_id::uuid);
