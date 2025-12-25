-- Drop the policy that exposes user_id to everyone
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.forum_comments;

-- Create a policy that only allows users to view their own comments directly
-- Public access is handled through the security definer function get_forum_comments_safe()
CREATE POLICY "Users can view their own comments"
ON public.forum_comments
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all comments for moderation
CREATE POLICY "Admins can view all comments"
ON public.forum_comments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));