-- Fix 1: Remove public INSERT policies to force all traffic through Edge Function
-- This prevents direct database access bypass of rate limiting, validation, and bot protection
DROP POLICY IF EXISTS "Anyone can create parents" ON public.parents;
DROP POLICY IF EXISTS "Anyone can create students" ON public.students;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

-- Fix 2: Add DELETE policies for data retention compliance (GDPR/privacy requirements)
-- Allow admins to delete parents (cascades to students, appointments, sessions)
CREATE POLICY "Admins can delete parents" ON public.parents 
FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete students
CREATE POLICY "Admins can delete students" ON public.students 
FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- Allow staff to delete appointments
CREATE POLICY "Staff can delete appointments" ON public.appointments 
FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

-- Allow staff to delete sessions
CREATE POLICY "Staff can delete sessions" ON public.sessions 
FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

-- Allow staff to delete responses
CREATE POLICY "Staff can delete responses" ON public.responses 
FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'assessor') OR has_role(auth.uid(), 'admin'));

-- Allow admins to delete session summaries
CREATE POLICY "Admins can delete summaries" ON public.session_summaries 
FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin'));