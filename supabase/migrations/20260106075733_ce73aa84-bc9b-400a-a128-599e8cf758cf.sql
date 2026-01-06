-- Add parent_id for hierarchical categories (area > category > sub-category)
ALTER TABLE public.assessment_categories 
ADD COLUMN parent_id uuid REFERENCES public.assessment_categories(id) ON DELETE CASCADE;

-- Add index for efficient tree queries
CREATE INDEX idx_assessment_categories_parent ON public.assessment_categories(parent_id);

-- Clear existing categories to rebuild with proper hierarchy
DELETE FROM public.assessment_categories;

-- Insert Areas (top level)
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Reading', 'Reading and literacy assessments', 1, NULL),
  ('a1000000-0000-0000-0000-000000000002', 'Math Understanding', 'Mathematical reasoning and number skills', 2, NULL),
  ('a1000000-0000-0000-0000-000000000003', 'Social, Emotional & Behavior', 'Social-emotional and behavioral assessments', 3, NULL),
  ('a1000000-0000-0000-0000-000000000004', 'Writing', 'Written expression assessments', 4, NULL),
  ('a1000000-0000-0000-0000-000000000005', 'Communication', 'Speech and language assessments', 5, NULL);

-- Insert Reading Categories
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Comprehension', 'Reading comprehension skills', 1, 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'Phonics', 'Letter-sound correspondence', 2, 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003', 'Phonological Awareness', 'Sound manipulation skills', 3, 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000004', 'Fluency', 'Reading fluency and automaticity', 4, 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000005', 'Vocabulary', 'Word knowledge and usage', 5, 'a1000000-0000-0000-0000-000000000001');

-- Insert Phonological Awareness Sub-categories
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Substitution', 'Sound substitution tasks', 1, 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002', 'Initial Sound', 'Initial sound identification', 2, 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000003', 'Final Sound', 'Final sound identification', 3, 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000004', 'Blending', 'Sound blending tasks', 4, 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000005', 'Segmenting', 'Sound segmentation tasks', 5, 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000006', 'Deletion', 'Sound deletion tasks', 6, 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000007', 'Rhyming', 'Rhyme recognition and production', 7, 'b1000000-0000-0000-0000-000000000003');

-- Insert Math Categories
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('b2000000-0000-0000-0000-000000000001', 'Number Sense', 'Understanding of number concepts', 1, 'a1000000-0000-0000-0000-000000000002'),
  ('b2000000-0000-0000-0000-000000000002', 'Comparative Relationships', 'Comparing quantities and values', 2, 'a1000000-0000-0000-0000-000000000002');

-- Insert Social-Emotional-Behavior Categories
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('b3000000-0000-0000-0000-000000000001', 'Safety & Behavior', 'Behavioral safety concerns', 1, 'a1000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000002', 'Attention & Self-Control', 'Focus and impulse regulation', 2, 'a1000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000003', 'Feelings & Stress', 'Emotional regulation and anxiety', 3, 'a1000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000004', 'Social Connection', 'Peer relationships and social skills', 4, 'a1000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000005', 'Flexibility & Independence', 'Adaptability and self-reliance', 5, 'a1000000-0000-0000-0000-000000000003'),
  ('b3000000-0000-0000-0000-000000000006', 'Repetitive Behavior & Unusual Experience', 'Atypical patterns and sensory differences', 6, 'a1000000-0000-0000-0000-000000000003');

-- Insert SEB Sub-categories (under Safety & Behavior)
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('c3000000-0000-0000-0000-000000000001', 'Aggression', 'Physical and verbal aggression', 1, 'b3000000-0000-0000-0000-000000000001'),
  ('c3000000-0000-0000-0000-000000000002', 'Rule-Breaking Conduct', 'Non-compliance and defiance', 2, 'b3000000-0000-0000-0000-000000000001');

-- Insert SEB Sub-categories (under Attention & Self-Control)
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('c3000000-0000-0000-0000-000000000003', 'Hyperactivity', 'Excessive motor activity', 1, 'b3000000-0000-0000-0000-000000000002'),
  ('c3000000-0000-0000-0000-000000000004', 'Impulsivity', 'Acting without thinking', 2, 'b3000000-0000-0000-0000-000000000002'),
  ('c3000000-0000-0000-0000-000000000005', 'Inattention', 'Difficulty sustaining focus', 3, 'b3000000-0000-0000-0000-000000000002');

-- Insert SEB Sub-categories (under Feelings & Stress)
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('c3000000-0000-0000-0000-000000000006', 'Anxiety', 'Excessive worry and fear', 1, 'b3000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000007', 'Depression', 'Sadness and low mood', 2, 'b3000000-0000-0000-0000-000000000003'),
  ('c3000000-0000-0000-0000-000000000008', 'Emotional Regulation', 'Managing emotional responses', 3, 'b3000000-0000-0000-0000-000000000003');

-- Insert SEB Sub-categories (under Social Connection)
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('c3000000-0000-0000-0000-000000000009', 'Social Skills', 'Peer interaction abilities', 1, 'b3000000-0000-0000-0000-000000000004'),
  ('c3000000-0000-0000-0000-000000000010', 'Social Withdrawal', 'Isolation and avoidance', 2, 'b3000000-0000-0000-0000-000000000004');

-- Insert Writing Categories
INSERT INTO public.assessment_categories (id, name, description, display_order, parent_id) VALUES
  ('b4000000-0000-0000-0000-000000000001', 'Initial Sound Spelling', 'Encoding initial sounds', 1, 'a1000000-0000-0000-0000-000000000004'),
  ('b4000000-0000-0000-0000-000000000002', 'Ending Sound Spelling', 'Encoding final sounds', 2, 'a1000000-0000-0000-0000-000000000004'),
  ('b4000000-0000-0000-0000-000000000003', 'Word Spelling', 'Complete word encoding', 3, 'a1000000-0000-0000-0000-000000000004'),
  ('b4000000-0000-0000-0000-000000000004', 'Sentence Writing', 'Sentence composition', 4, 'a1000000-0000-0000-0000-000000000004');