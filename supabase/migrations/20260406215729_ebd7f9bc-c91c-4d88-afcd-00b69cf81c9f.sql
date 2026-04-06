
-- Add question type and options to campaign questions
ALTER TABLE public.evaluation_campaign_questions
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'stars',
  ADD COLUMN IF NOT EXISTS options jsonb;

-- Add selected_options to evaluation answers
ALTER TABLE public.evaluation_answers
  ADD COLUMN IF NOT EXISTS selected_options jsonb;
