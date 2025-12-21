-- Add published_at column for scheduled publishing with hour-level precision
ALTER TABLE public.blog_posts 
ADD COLUMN published_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Migrate existing data: set published_at based on existing date_ja values
-- This will be approximate as existing dates don't have time info
UPDATE public.blog_posts 
SET published_at = 
  CASE 
    -- Parse Japanese date format like "2025年12月21日"
    WHEN date_ja ~ '^\d{4}年\d{1,2}月\d{1,2}日$' THEN
      to_timestamp(
        regexp_replace(date_ja, '(\d{4})年(\d{1,2})月(\d{1,2})日', '\1-\2-\3'),
        'YYYY-MM-DD'
      ) AT TIME ZONE 'Asia/Tokyo'
    ELSE now()
  END
WHERE published_at IS NULL OR published_at = now();

-- Create index for efficient filtering
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);