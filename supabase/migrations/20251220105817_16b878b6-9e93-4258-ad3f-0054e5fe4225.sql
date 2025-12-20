-- Drop the view
DROP VIEW IF EXISTS public.blog_analytics;

-- Create a function to get blog analytics instead (security definer is intentional here for admin access)
CREATE OR REPLACE FUNCTION public.get_blog_analytics()
RETURNS TABLE (
    post_slug text,
    view_count bigint,
    unique_visitors bigint,
    like_count bigint,
    first_view_at timestamptz,
    last_view_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        bv.post_slug,
        COUNT(DISTINCT bv.id) as view_count,
        COUNT(DISTINCT bv.visitor_id) as unique_visitors,
        (SELECT COUNT(*) FROM public.blog_likes bl WHERE bl.post_slug = bv.post_slug) as like_count,
        MIN(bv.created_at) as first_view_at,
        MAX(bv.created_at) as last_view_at
    FROM public.blog_views bv
    GROUP BY bv.post_slug
    ORDER BY view_count DESC;
$$;