-- Drop the existing check constraint
ALTER TABLE public.parent_scales DROP CONSTRAINT parent_scales_scale_type_check;

-- Add new check constraint with SEB screener types
ALTER TABLE public.parent_scales ADD CONSTRAINT parent_scales_scale_type_check 
CHECK (scale_type = ANY (ARRAY[
  'reading_history'::text, 
  'behavior_checklist'::text, 
  'home_literacy'::text, 
  'developmental_milestones'::text,
  'seb_brief'::text,
  'seb_full'::text,
  'attention_screener'::text
]));