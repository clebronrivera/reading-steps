-- Portal access tokens for secure parent access without login
CREATE TABLE public.portal_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.portal_access_tokens ENABLE ROW LEVEL SECURITY;

-- Only staff can manage tokens
CREATE POLICY "Staff can view tokens"
ON public.portal_access_tokens FOR SELECT
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can create tokens"
ON public.portal_access_tokens FOR INSERT
WITH CHECK (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can delete tokens"
ON public.portal_access_tokens FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Teacher input requests for parent portal
CREATE TABLE public.teacher_input_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  requested_by_parent_at timestamp with time zone NOT NULL DEFAULT now(),
  teacher_email text,
  teacher_name text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed')),
  completed_at timestamp with time zone,
  responses jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_input_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage teacher requests"
ON public.teacher_input_requests FOR ALL
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

-- Parent action checklist items
CREATE TABLE public.parent_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('immediate', 'school', 'home', 'professional')),
  priority integer NOT NULL DEFAULT 1,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.parent_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage checklist items"
ON public.parent_checklist_items FOR ALL
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

-- Domain scores for the results dashboard
CREATE TABLE public.domain_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  domain text NOT NULL CHECK (domain IN ('phonological_awareness', 'phonics', 'fluency', 'vocabulary', 'comprehension', 'print_concepts')),
  raw_score integer,
  max_score integer,
  percentile integer,
  risk_level public.risk_level,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage domain scores"
ON public.domain_scores FOR ALL
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

-- Additional parent scales/questionnaires
CREATE TABLE public.parent_scales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  scale_type text NOT NULL CHECK (scale_type IN ('reading_history', 'behavior_checklist', 'home_literacy', 'developmental_milestones')),
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.parent_scales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage parent scales"
ON public.parent_scales FOR ALL
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

-- Function to validate portal token (for edge function use)
CREATE OR REPLACE FUNCTION public.validate_portal_token(token_value text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_uuid uuid;
BEGIN
  SELECT student_id INTO student_uuid
  FROM portal_access_tokens
  WHERE token_hash = encode(sha256(token_value::bytea), 'hex')
    AND expires_at > now();
  
  IF student_uuid IS NOT NULL THEN
    UPDATE portal_access_tokens 
    SET last_accessed_at = now() 
    WHERE token_hash = encode(sha256(token_value::bytea), 'hex');
  END IF;
  
  RETURN student_uuid;
END;
$$;