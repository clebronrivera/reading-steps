-- Assign PAST subtests to Phonological Awareness category
UPDATE subtests 
SET category_id = 'b1000000-0000-0000-0000-000000000003'
WHERE module_type = 'phonological_awareness';

-- Assign Alphabet, Consonant, Vowel, Reading & Decoding, Spelling subtests to Phonics category
UPDATE subtests 
SET category_id = 'b1000000-0000-0000-0000-000000000002'
WHERE module_type = 'phonics';

-- Assign ORF passages to Fluency category
UPDATE subtests 
SET category_id = 'b1000000-0000-0000-0000-000000000004'
WHERE module_type = 'orf';

-- Assign Comprehension subtests to Comprehension category
UPDATE subtests 
SET category_id = 'b1000000-0000-0000-0000-000000000001'
WHERE module_type = 'comprehension';