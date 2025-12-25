-- Drop the existing policy that allows public access to profiles with forum activity
DROP POLICY IF EXISTS "Public can view limited profile info with forum activity" ON public.profiles;

-- Create new policy that requires authentication to view profiles with forum activity
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