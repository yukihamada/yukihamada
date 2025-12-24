-- Add user_id column to chat_conversations for tracking logged-in users
ALTER TABLE public.chat_conversations 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);

-- Add RLS policy for users to view their own conversations
CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations
FOR SELECT
USING (auth.uid() = user_id);

-- Add RLS policy for users to update their own conversations
CREATE POLICY "Users can update their own conversations"
ON public.chat_conversations
FOR UPDATE
USING (auth.uid() = user_id);