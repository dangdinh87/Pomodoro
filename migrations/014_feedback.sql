-- Migration: Feedback table
-- Date: 2026-01-28
-- Description: Create feedbacks table for user feedback submissions

CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('feature', 'bug', 'question', 'other')),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_feedbacks_type ON feedbacks(type);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);

-- Enable RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert feedback (logged in or anonymous)
CREATE POLICY "Anyone can insert feedback"
    ON feedbacks FOR INSERT
    WITH CHECK (true);
