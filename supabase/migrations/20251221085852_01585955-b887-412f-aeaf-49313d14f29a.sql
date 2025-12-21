-- Create table to cache share counts
CREATE TABLE public.blog_share_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL UNIQUE,
  twitter_count INTEGER NOT NULL DEFAULT 0,
  facebook_count INTEGER NOT NULL DEFAULT 0,
  hatena_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_share_counts ENABLE ROW LEVEL SECURITY;

-- Anyone can read share counts
CREATE POLICY "Anyone can view share counts"
ON public.blog_share_counts
FOR SELECT
USING (true);

-- Service role can manage share counts
CREATE POLICY "Service role can manage share counts"
ON public.blog_share_counts
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_blog_share_counts_slug ON public.blog_share_counts(post_slug);

-- Trigger for updated_at
CREATE TRIGGER update_blog_share_counts_updated_at
BEFORE UPDATE ON public.blog_share_counts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();