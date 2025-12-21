-- Allow admins to read chat_conversations
CREATE POLICY "Admins can view all conversations"
ON public.chat_conversations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete chat_conversations
CREATE POLICY "Admins can delete conversations"
ON public.chat_conversations
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read chat_messages
CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete chat_messages
CREATE POLICY "Admins can delete messages"
ON public.chat_messages
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));