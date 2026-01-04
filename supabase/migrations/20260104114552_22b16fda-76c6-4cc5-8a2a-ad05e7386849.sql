-- Fix 1: Remove public SELECT on appointments and create secure RPC for available slots
DROP POLICY IF EXISTS "Public can view appointments for scheduling" ON public.appointments;

-- Create secure RPC function that only returns available time slots (no sensitive data)
CREATE OR REPLACE FUNCTION public.get_available_appointment_slots(
  start_date date,
  end_date date
)
RETURNS TABLE (
  scheduled_at timestamp with time zone,
  is_booked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.scheduled_at,
    true as is_booked
  FROM appointments a
  WHERE a.scheduled_at::date BETWEEN start_date AND end_date
    AND a.status IN ('scheduled', 'confirmed')
$$;

-- Fix 2: Restrict user_roles INSERT - only admins can insert roles
-- First drop any conflicting policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create specific policies for each operation
CREATE POLICY "Admins can insert roles" ON public.user_roles 
FOR INSERT TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles 
FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles 
FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep existing SELECT policies for users to view their own roles