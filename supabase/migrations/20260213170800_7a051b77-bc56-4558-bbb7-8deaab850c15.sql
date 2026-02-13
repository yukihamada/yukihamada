
CREATE TABLE public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'blog',
  blog_slug TEXT,
  visitor_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feature requests"
ON public.feature_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view feature requests"
ON public.feature_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
