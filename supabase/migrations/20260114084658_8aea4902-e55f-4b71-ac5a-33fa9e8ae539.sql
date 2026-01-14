
-- Fix: Forum topics should not be directly readable
-- Users must use the get_forum_topics_safe() RPC function which returns public_id instead of user_id

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Forum topics are viewable by everyone" ON public.forum_topics;

-- Create a new restrictive SELECT policy - only topic owners can directly select their own topics
-- Everyone else must use the get_forum_topics_safe() RPC function
CREATE POLICY "Users can only view their own topics directly"
ON public.forum_topics
FOR SELECT
USING (auth.uid() = user_id);
