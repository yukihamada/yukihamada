-- Create table for caching blog summaries
CREATE TABLE public.blog_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL UNIQUE,
  summary_ja TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for caching AI-generated questions
CREATE TABLE public.blog_suggested_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL UNIQUE,
  questions_ja JSONB NOT NULL DEFAULT '[]',
  questions_en JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_suggested_questions ENABLE ROW LEVEL SECURITY;

-- Public read access for summaries
CREATE POLICY "Blog summaries are publicly readable" 
ON public.blog_summaries 
FOR SELECT 
USING (true);

-- Public read access for questions
CREATE POLICY "Blog questions are publicly readable" 
ON public.blog_suggested_questions 
FOR SELECT 
USING (true);

-- Service role can insert/update (for edge functions)
CREATE POLICY "Service role can manage summaries" 
ON public.blog_summaries 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage questions" 
ON public.blog_suggested_questions 
FOR ALL 
USING (true)
WITH CHECK (true);