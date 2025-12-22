-- Fix forum_topics view_count manipulation by creating a function to increment view count
-- and restricting direct updates to view_count field

-- Create a function to safely increment view count (can only increment, not set arbitrary values)
CREATE OR REPLACE FUNCTION public.increment_topic_view_count(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_topics 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = topic_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_topic_view_count(uuid) TO authenticated;

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own topics" ON public.forum_topics;

-- Create new update policy that prevents updating view_count
CREATE POLICY "Users can update their own topics except view_count"
ON public.forum_topics
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- This policy allows update but we'll use a trigger to protect view_count
);

-- Create trigger to prevent direct view_count manipulation
CREATE OR REPLACE FUNCTION public.protect_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is trying to change view_count directly, preserve the old value
  -- Only allow view_count changes from the increment function (which runs as security definer)
  IF OLD.user_id = auth.uid() AND NEW.view_count != OLD.view_count THEN
    NEW.view_count = OLD.view_count;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS protect_view_count_trigger ON public.forum_topics;
CREATE TRIGGER protect_view_count_trigger
  BEFORE UPDATE ON public.forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_view_count();