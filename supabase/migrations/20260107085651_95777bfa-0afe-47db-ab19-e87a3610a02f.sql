-- Add is_archived column to subtests table for soft-delete functionality
ALTER TABLE public.subtests 
ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- Create index for faster filtering
CREATE INDEX idx_subtests_is_archived ON public.subtests(is_archived);