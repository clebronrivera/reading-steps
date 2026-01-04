-- ============================================
-- SCHEMA UPDATES FOR SPLIT-SCREEN ASSESSMENT SYSTEM
-- ============================================

-- 1. CREATE ENUMS for new fields
CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high', 'critical');
CREATE TYPE validity_status AS ENUM ('valid', 'questionable', 'invalid');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE report_tier AS ENUM ('free', 'paid');
CREATE TYPE module_type AS ENUM ('print_awareness', 'phonological_awareness', 'phonics', 'hfw', 'orf', 'comprehension');
CREATE TYPE modality AS ENUM ('expressive', 'receptive');
CREATE TYPE parent_goal AS ENUM ('school_support', 'tutoring_plan', 'evaluation_guidance', 'full_report');

-- 2. EXPAND STUDENTS TABLE for intake triage fields (Item #9)
ALTER TABLE public.students 
  ADD COLUMN IF NOT EXISTS school_supports_status text[], -- MTSS/RTI, 504, IEP, past evaluations
  ADD COLUMN IF NOT EXISTS interventions_tried text,
  ADD COLUMN IF NOT EXISTS el_status boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS speech_language_history text,
  ADD COLUMN IF NOT EXISTS vision_hearing_status text,
  ADD COLUMN IF NOT EXISTS attendance_concerns boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_goal parent_goal,
  ADD COLUMN IF NOT EXISTS risk_level risk_level,
  ADD COLUMN IF NOT EXISTS risk_flags text[]; -- Stores specific triggers like "multiple_domains_low", "minimal_intervention_response"

-- 3. EXPAND SESSIONS TABLE for validity and status (Items #19, #20)
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS status session_status DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS validity_status validity_status,
  ADD COLUMN IF NOT EXISTS validity_notes text,
  ADD COLUMN IF NOT EXISTS current_subtest_id uuid REFERENCES public.subtests(id),
  ADD COLUMN IF NOT EXISTS observations jsonb; -- Stores attention, effort, impulsivity, frustration, avoidance, responsiveness

-- 4. EXPAND SUBTESTS TABLE for module structure (Items #16, #17)
ALTER TABLE public.subtests
  ADD COLUMN IF NOT EXISTS module_type module_type,
  ADD COLUMN IF NOT EXISTS grade text,
  ADD COLUMN IF NOT EXISTS modality modality DEFAULT 'expressive',
  ADD COLUMN IF NOT EXISTS stimulus_data jsonb, -- Embedded JSON for passages, word lists, questions
  ADD COLUMN IF NOT EXISTS discontinue_rule jsonb, -- e.g. {"consecutive_incorrect": 5, "action": "stop_or_switch"}
  ADD COLUMN IF NOT EXISTS timing_config jsonb; -- e.g. {"duration_seconds": 60, "threshold_seconds": 2}

-- 5. EXPAND SESSION_SUMMARIES TABLE for tiered reports (Item #7)
ALTER TABLE public.session_summaries
  ADD COLUMN IF NOT EXISTS report_tier report_tier DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS unlocked_at timestamptz,
  ADD COLUMN IF NOT EXISTS risk_level risk_level,
  ADD COLUMN IF NOT EXISTS advocacy_guidance text, -- For high/critical risk
  ADD COLUMN IF NOT EXISTS intervention_plan_home text,
  ADD COLUMN IF NOT EXISTS intervention_plan_school text,
  ADD COLUMN IF NOT EXISTS accommodations text[],
  ADD COLUMN IF NOT EXISTS progress_monitoring_plan text;

-- 6. EXPAND RESPONSES TABLE for detailed scoring (Item #17)
ALTER TABLE public.responses
  ADD COLUMN IF NOT EXISTS error_type text, -- substitution, omission, insertion, hesitation, short_vowel, etc.
  ADD COLUMN IF NOT EXISTS strategy_tag text, -- automatic, sounded_out
  ADD COLUMN IF NOT EXISTS qualitative_error text, -- What student actually said (for HFW)
  ADD COLUMN IF NOT EXISTS automaticity text; -- automatic, slow, incorrect (for PAST)

-- 7. CREATE DOCUMENT UPLOADS TABLE for intake attachments (Item #9)
CREATE TABLE IF NOT EXISTS public.intake_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- report_card, prior_testing, teacher_notes
  file_name text NOT NULL,
  file_url text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on intake_documents
ALTER TABLE public.intake_documents ENABLE ROW LEVEL SECURITY;

-- Staff can view intake documents
CREATE POLICY "Staff can view intake documents" ON public.intake_documents
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

-- Staff can delete intake documents
CREATE POLICY "Staff can delete intake documents" ON public.intake_documents
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 8. ADD INDEXES for common queries
CREATE INDEX IF NOT EXISTS idx_students_risk_level ON public.students(risk_level);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_subtests_module_type ON public.subtests(module_type);
CREATE INDEX IF NOT EXISTS idx_session_summaries_report_tier ON public.session_summaries(report_tier);