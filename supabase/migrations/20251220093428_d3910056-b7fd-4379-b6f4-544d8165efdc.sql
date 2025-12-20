-- Create a security definer function to get view counts without exposing individual data
CREATE OR REPLACE FUNCTION public.get_blog_view_count(p_post_slug text)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.blog_views
  WHERE post_slug = p_post_slug;
$$;

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view blog views" ON public.blog_views;

-- Create a new restrictive SELECT policy - visitors can only see their own data
CREATE POLICY "Visitors can only view own data"
ON public.blog_views
FOR SELECT
USING (false);

-- Grant execute permission on the function to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_blog_view_count(text) TO anon, authenticated;