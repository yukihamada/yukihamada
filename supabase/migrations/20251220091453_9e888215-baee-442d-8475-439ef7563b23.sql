-- Create a table for blog post views
CREATE TABLE public.blog_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view (for counting)
CREATE POLICY "Anyone can view blog views" 
ON public.blog_views 
FOR SELECT 
USING (true);

-- Allow anyone to insert views
CREATE POLICY "Anyone can add views" 
ON public.blog_views 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster counting
CREATE INDEX idx_blog_views_post_slug ON public.blog_views(post_slug);

-- Enable realtime for presence tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_views;