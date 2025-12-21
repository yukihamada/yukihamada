-- Add policy to allow public access to profiles with forum activity
CREATE POLICY "Public can view profiles with forum activity" 
ON public.profiles 
FOR SELECT 
USING (
  (EXISTS (SELECT 1 FROM forum_comments fc WHERE fc.user_id = profiles.user_id))
  OR 
  (EXISTS (SELECT 1 FROM forum_topics ft WHERE ft.user_id = profiles.user_id))
);