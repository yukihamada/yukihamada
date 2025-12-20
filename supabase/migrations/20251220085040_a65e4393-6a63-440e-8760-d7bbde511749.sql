-- Create a table for blog post likes
CREATE TABLE public.blog_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Store a simple fingerprint to prevent duplicate likes from same browser
  visitor_id TEXT NOT NULL,
  UNIQUE(post_slug, visitor_id)
);

-- Enable Row Level Security
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view likes (for counting)
CREATE POLICY "Anyone can view likes" 
ON public.blog_likes 
FOR SELECT 
USING (true);

-- Allow anyone to insert likes (public blog)
CREATE POLICY "Anyone can add likes" 
ON public.blog_likes 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster counting
CREATE INDEX idx_blog_likes_post_slug ON public.blog_likes(post_slug);