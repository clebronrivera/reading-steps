
-- Create categories table for unified assessment taxonomy
CREATE TABLE public.assessment_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessment_categories ENABLE ROW LEVEL SECURITY;

-- Staff can view categories
CREATE POLICY "Staff can view categories" 
ON public.assessment_categories 
FOR SELECT 
USING (has_role(auth.uid(), 'assessor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" 
ON public.assessment_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add category_id to subtests table
ALTER TABLE public.subtests 
ADD COLUMN category_id UUID REFERENCES public.assessment_categories(id);

-- Add category_id to parent_scales table for unified taxonomy
ALTER TABLE public.parent_scales 
ADD COLUMN category_id UUID REFERENCES public.assessment_categories(id);

-- Create index for efficient category lookups
CREATE INDEX idx_subtests_category ON public.subtests(category_id);
CREATE INDEX idx_parent_scales_category ON public.parent_scales(category_id);

-- Insert initial categories
INSERT INTO public.assessment_categories (name, description, display_order) VALUES
('Phonics', 'Alphabetic principle, letter identification, sounds, and decoding skills', 1),
('Phonological Awareness', 'Syllable manipulation, phoneme awareness, and sound operations (PAST)', 2),
('Oral Reading Fluency', 'Passage reading with timing, accuracy, and prosody measurement', 3),
('Comprehension', 'Reading comprehension with passage-based questions by grade level', 4),
('Social-Emotional & Mental Health', 'Behavioral, emotional, and social functioning assessments (direct and indirect)', 5);

-- Add trigger for updated_at
CREATE TRIGGER update_assessment_categories_updated_at
BEFORE UPDATE ON public.assessment_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
