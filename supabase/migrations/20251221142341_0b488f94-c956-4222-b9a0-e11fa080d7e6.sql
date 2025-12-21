-- Create ai_prompt_versions table for version history
CREATE TABLE public.ai_prompt_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.ai_prompts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;

-- Admins can view versions
CREATE POLICY "Admins can view prompt versions"
  ON public.ai_prompt_versions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create versions
CREATE POLICY "Admins can create prompt versions"
  ON public.ai_prompt_versions
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_ai_prompt_versions_prompt_id ON public.ai_prompt_versions(prompt_id);
CREATE INDEX idx_ai_prompt_versions_created_at ON public.ai_prompt_versions(created_at DESC);