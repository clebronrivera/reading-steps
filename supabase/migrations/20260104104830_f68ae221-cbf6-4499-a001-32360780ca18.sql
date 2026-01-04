-- Create enums for various status fields
CREATE TYPE public.lead_status AS ENUM ('new', 'scheduled', 'completed', 'follow_up_needed', 'converted');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.response_code AS ENUM ('correct', 'incorrect', 'self_correct', 'prompted', 'no_response');
CREATE TYPE public.app_role AS ENUM ('admin', 'assessor');

-- Parents table
CREATE TABLE public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  grade TEXT NOT NULL,
  school TEXT,
  languages_at_home TEXT[],
  primary_concerns TEXT[],
  current_supports TEXT,
  parent_observations TEXT,
  consent_screening BOOLEAN NOT NULL DEFAULT false,
  consent_store_data BOOLEAN NOT NULL DEFAULT false,
  consent_record_zoom BOOLEAN DEFAULT false,
  lead_status public.lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  timezone TEXT NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  zoom_join_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subtests table
CREATE TABLE public.subtests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  script_prompt TEXT,
  stimulus_url TEXT,
  item_count INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions table (assessment sessions)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  assessor_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Responses table (individual item responses)
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  subtest_id UUID NOT NULL REFERENCES public.subtests(id) ON DELETE CASCADE,
  item_index INTEGER NOT NULL,
  score_code public.response_code NOT NULL,
  notes TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session summaries table
CREATE TABLE public.session_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE UNIQUE,
  observations TEXT,
  strengths TEXT,
  needs_risk_indicators TEXT,
  recommendations_parents TEXT,
  recommendations_school TEXT,
  next_steps TEXT,
  total_correct INTEGER,
  total_items INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (for admin/assessor roles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON public.parents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subtests_updated_at BEFORE UPDATE ON public.subtests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_session_summaries_updated_at BEFORE UPDATE ON public.session_summaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies

-- Parents: allow public insert (intake form), only assessors can read
CREATE POLICY "Anyone can create parents" ON public.parents FOR INSERT WITH CHECK (true);
CREATE POLICY "Assessors can view all parents" ON public.parents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can update parents" ON public.parents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

-- Students: allow public insert (intake form), only assessors can read/update
CREATE POLICY "Anyone can create students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Assessors can view all students" ON public.students FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can update students" ON public.students FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

-- Appointments: allow public insert (scheduling), only assessors can read/update
CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view appointments for scheduling" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Assessors can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

-- Assessments: only assessors can CRUD
CREATE POLICY "Assessors can view assessments" ON public.assessments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can create assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can update assessments" ON public.assessments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can delete assessments" ON public.assessments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

-- Subtests: only assessors can CRUD
CREATE POLICY "Assessors can view subtests" ON public.subtests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can create subtests" ON public.subtests FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can update subtests" ON public.subtests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can delete subtests" ON public.subtests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

-- Sessions: only assessors can CRUD
CREATE POLICY "Assessors can view sessions" ON public.sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can create sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can update sessions" ON public.sessions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

-- Responses: only assessors can CRUD
CREATE POLICY "Assessors can view responses" ON public.responses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can create responses" ON public.responses FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can update responses" ON public.responses FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

-- Session summaries: only assessors can CRUD
CREATE POLICY "Assessors can view session summaries" ON public.session_summaries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can create session summaries" ON public.session_summaries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assessors can update session summaries" ON public.session_summaries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

-- User roles: only admins can manage
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));