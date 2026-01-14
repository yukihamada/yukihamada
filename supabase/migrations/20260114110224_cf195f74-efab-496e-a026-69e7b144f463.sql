
-- Fix: chat_messages INSERT policy needs proper participant validation
-- Only the conversation owner (by visitor_id header) can insert messages

DROP POLICY IF EXISTS "Conversation participants can insert messages" ON public.chat_messages;

-- Create a more restrictive INSERT policy
-- Messages can only be inserted if the conversation belongs to the same visitor
CREATE POLICY "Conversation owners can insert messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations cc
    WHERE cc.id = conversation_id
    AND (
      -- Allow if conversation was created by the same visitor (via request header)
      cc.visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id'
      -- Or if the user is authenticated and owns the conversation
      OR (auth.uid() IS NOT NULL AND cc.user_id = auth.uid())
    )
  )
);
