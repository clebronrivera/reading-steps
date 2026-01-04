-- Add missing RLS policies for appointments
CREATE POLICY "Staff can view appointments" 
ON public.appointments 
FOR SELECT 
USING (has_role(auth.uid(), 'assessor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can insert appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'assessor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));