-- Fix chat_messages: Only allow viewing messages from own conversations
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;

CREATE POLICY "Users can view messages from their conversations"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations cc
    WHERE cc.id = chat_messages.conversation_id
    AND cc.visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id'
  )
);

-- Fix chat_conversations: Only allow viewing own conversations
DROP POLICY IF EXISTS "Visitors can view their own conversations" ON public.chat_conversations;

CREATE POLICY "Visitors can view their own conversations"
ON public.chat_conversations
FOR SELECT
USING (
  visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id'
);

-- Fix blog_likes: Restrict viewing to own likes only
DROP POLICY IF EXISTS "Anyone can view likes" ON public.blog_likes;

CREATE POLICY "Visitors can view their own likes"
ON public.blog_likes
FOR SELECT
USING (
  visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id'
);

-- Create function to get like count without exposing visitor_id
CREATE OR REPLACE FUNCTION public.get_blog_like_count(p_post_slug text)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.blog_likes
  WHERE post_slug = p_post_slug;
$$;

-- Create function to check if current visitor liked a post
CREATE OR REPLACE FUNCTION public.has_visitor_liked(p_post_slug text, p_visitor_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blog_likes
    WHERE post_slug = p_post_slug
    AND visitor_id = p_visitor_id
  );
$$;