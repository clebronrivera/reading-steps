-- Create storage bucket for ORF audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('orf-recordings', 'orf-recordings', false);

-- Create RLS policies for the bucket
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'orf-recordings');

CREATE POLICY "Authenticated users can view recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'orf-recordings');

CREATE POLICY "Authenticated users can delete their recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'orf-recordings');

-- Create table to track audio recordings with metadata
CREATE TABLE public.orf_audio_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  subtest_id UUID NOT NULL REFERENCES public.subtests(id) ON DELETE CASCADE,
  response_id UUID REFERENCES public.responses(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  duration_seconds NUMERIC(6,2),
  file_size_bytes INTEGER,
  wcpm INTEGER,
  accuracy_percent NUMERIC(5,2),
  word_marks JSONB,
  fluency_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.orf_audio_recordings ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (assessors)
CREATE POLICY "Assessors can insert recordings"
ON public.orf_audio_recordings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Assessors can view recordings"
ON public.orf_audio_recordings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Assessors can update recordings"
ON public.orf_audio_recordings FOR UPDATE
TO authenticated
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_orf_recordings_session ON public.orf_audio_recordings(session_id);
CREATE INDEX idx_orf_recordings_subtest ON public.orf_audio_recordings(subtest_id);