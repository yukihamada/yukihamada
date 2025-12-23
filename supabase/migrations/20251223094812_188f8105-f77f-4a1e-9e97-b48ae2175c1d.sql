-- 1. Create a security definer function to get safe profile data for forum display
-- This ensures only public_id, display_name, avatar_url, bio are exposed (never user_id)
CREATE OR REPLACE FUNCTION public.get_forum_profile(p_user_id uuid)
RETURNS TABLE (
  public_id text,
  display_name text,
  avatar_url text,
  bio text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    profiles.public_id,
    profiles.display_name,
    profiles.avatar_url,
    profiles.bio
  FROM public.profiles
  WHERE profiles.user_id = p_user_id;
$$;

-- 2. Create a function to validate visitor_id format (UUID-like pattern)
CREATE OR REPLACE FUNCTION public.validate_visitor_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate visitor_id format: must be 36 chars (UUID format) or specific pattern
  IF NEW.visitor_id IS NULL OR LENGTH(NEW.visitor_id) < 32 OR LENGTH(NEW.visitor_id) > 64 THEN
    RAISE EXCEPTION 'Invalid visitor_id format';
  END IF;
  
  -- Check for suspicious patterns (too short, sequential, etc.)
  IF NEW.visitor_id ~ '^[0-9]+$' THEN
    RAISE EXCEPTION 'Invalid visitor_id format: numeric only not allowed';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger to chat_conversations
DROP TRIGGER IF EXISTS validate_visitor_id_trigger ON public.chat_conversations;
CREATE TRIGGER validate_visitor_id_trigger
  BEFORE INSERT ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_visitor_id();

-- Apply same trigger to chat_messages (if visitor_id exists there)
-- Apply to blog_views and blog_likes for consistency
DROP TRIGGER IF EXISTS validate_visitor_id_trigger ON public.blog_views;
CREATE TRIGGER validate_visitor_id_trigger
  BEFORE INSERT ON public.blog_views
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_visitor_id();

DROP TRIGGER IF EXISTS validate_visitor_id_trigger ON public.blog_likes;
CREATE TRIGGER validate_visitor_id_trigger
  BEFORE INSERT ON public.blog_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_visitor_id();

-- 3. Create a security definer function to get forum comments with public profile data only
CREATE OR REPLACE FUNCTION public.get_forum_comments_safe(p_topic_id uuid DEFAULT NULL, p_blog_slug text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  topic_id uuid,
  blog_slug text,
  parent_id uuid,
  author_public_id text,
  author_display_name text,
  author_avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    fc.id,
    fc.content,
    fc.created_at,
    fc.updated_at,
    fc.topic_id,
    fc.blog_slug,
    fc.parent_id,
    p.public_id as author_public_id,
    p.display_name as author_display_name,
    p.avatar_url as author_avatar_url
  FROM public.forum_comments fc
  LEFT JOIN public.profiles p ON fc.user_id = p.user_id
  WHERE 
    (p_topic_id IS NULL OR fc.topic_id = p_topic_id)
    AND (p_blog_slug IS NULL OR fc.blog_slug = p_blog_slug)
  ORDER BY fc.created_at ASC;
$$;

-- 4. Create a security definer function to get forum topics with public profile data only
CREATE OR REPLACE FUNCTION public.get_forum_topics_safe()
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  created_at timestamptz,
  updated_at timestamptz,
  view_count integer,
  is_pinned boolean,
  author_public_id text,
  author_display_name text,
  author_avatar_url text,
  comment_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ft.id,
    ft.title,
    ft.content,
    ft.category,
    ft.created_at,
    ft.updated_at,
    ft.view_count,
    ft.is_pinned,
    p.public_id as author_public_id,
    p.display_name as author_display_name,
    p.avatar_url as author_avatar_url,
    (SELECT COUNT(*) FROM public.forum_comments fc WHERE fc.topic_id = ft.id) as comment_count
  FROM public.forum_topics ft
  LEFT JOIN public.profiles p ON ft.user_id = p.user_id
  ORDER BY ft.is_pinned DESC NULLS LAST, ft.created_at DESC;
$$;