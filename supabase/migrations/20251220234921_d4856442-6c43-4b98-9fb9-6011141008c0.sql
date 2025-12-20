-- Add status column to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN status text NOT NULL DEFAULT 'published' 
CHECK (status IN ('draft', 'published'));

-- Create index for filtering by status
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);

-- Update existing posts to published (they're already published)
-- No action needed as default is 'published'