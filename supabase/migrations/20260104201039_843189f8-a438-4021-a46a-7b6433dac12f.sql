-- Create table for assessor session tokens
CREATE TABLE public.assessor_session_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(token_hash)
);

-- Enable RLS
ALTER TABLE public.assessor_session_tokens ENABLE ROW LEVEL SECURITY;

-- Only staff can create/view tokens
CREATE POLICY "Staff can view session tokens"
ON public.assessor_session_tokens
FOR SELECT
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can create session tokens"
ON public.assessor_session_tokens
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can delete session tokens"
ON public.assessor_session_tokens
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Function to validate assessor session token
CREATE OR REPLACE FUNCTION public.validate_assessor_token(token_value text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_uuid uuid;
BEGIN
  SELECT session_id INTO session_uuid
  FROM assessor_session_tokens
  WHERE token_hash = encode(sha256(token_value::bytea), 'hex')
    AND expires_at > now();
  
  IF session_uuid IS NOT NULL THEN
    UPDATE assessor_session_tokens 
    SET used_at = COALESCE(used_at, now())
    WHERE token_hash = encode(sha256(token_value::bytea), 'hex');
  END IF;
  
  RETURN session_uuid;
END;
$$;