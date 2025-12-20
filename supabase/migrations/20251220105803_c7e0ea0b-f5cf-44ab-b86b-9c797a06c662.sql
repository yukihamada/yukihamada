-- Drop the SECURITY DEFINER view and create a regular view instead
DROP VIEW IF EXISTS public.blog_analytics;

-- Create a regular view (without SECURITY DEFINER)
CREATE VIEW public.blog_analytics AS
SELECT 
    bv.post_slug,
    COUNT(DISTINCT bv.id) as view_count,
    COUNT(DISTINCT bv.visitor_id) as unique_visitors,
    (SELECT COUNT(*) FROM public.blog_likes bl WHERE bl.post_slug = bv.post_slug) as like_count,
    MIN(bv.created_at) as first_view_at,
    MAX(bv.created_at) as last_view_at
FROM public.blog_views bv
GROUP BY bv.post_slug;