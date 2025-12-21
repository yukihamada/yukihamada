-- 1. Fix profiles table - only allow viewing profiles when needed (for forum comments, etc.)
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more restrictive policies:
-- Users can always view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can view profiles that have posted in forums (for displaying author info)
CREATE POLICY "Profiles visible when user has forum activity"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.forum_comments fc WHERE fc.user_id = profiles.user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.forum_topics ft WHERE ft.user_id = profiles.user_id
  )
);

-- 2. Fix chat_conversations - remove ability to read conversations entirely
-- The visitor_id header approach is insecure, so we'll make conversations write-only
-- Chat history will be managed client-side in memory only

DROP POLICY IF EXISTS "Visitors can view their own conversations" ON public.chat_conversations;

-- Conversations are insert-only, no reading allowed
CREATE POLICY "Conversations are write-only"
ON public.chat_conversations
FOR SELECT
USING (false);

-- 3. Also fix chat_messages - make them write-only as well
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.chat_messages;

CREATE POLICY "Messages are write-only"
ON public.chat_messages
FOR SELECT
USING (false);