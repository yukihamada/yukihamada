-- Drop the existing policy that exposes profiles to everyone
DROP POLICY IF EXISTS "Profiles visible when user has forum activity" ON public.profiles;

-- Create new policy that only allows authenticated users to see profiles with forum activity
CREATE POLICY "Authenticated users can view profiles with forum activity" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    (EXISTS (SELECT 1 FROM forum_comments fc WHERE fc.user_id = profiles.user_id))
    OR (EXISTS (SELECT 1 FROM forum_topics ft WHERE ft.user_id = profiles.user_id))
  )
);