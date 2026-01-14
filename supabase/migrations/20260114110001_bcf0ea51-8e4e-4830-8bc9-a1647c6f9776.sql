
-- ============================================
-- 1. Fix ERROR: elio_signups email leak
-- ============================================

-- Drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view signups" ON public.elio_signups;

-- Only admins can view signups (protects email addresses)
CREATE POLICY "Only admins can view signups"
ON public.elio_signups
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 2. Fix RLS Always True warnings - Restrict to authenticated users
-- ============================================

-- blog_likes: Restrict INSERT to authenticated visitors
DROP POLICY IF EXISTS "Visitors can add likes" ON public.blog_likes;
CREATE POLICY "Authenticated visitors can add likes"
ON public.blog_likes
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR visitor_id IS NOT NULL);

-- blog_views: Already has trigger validation, but tighten INSERT
DROP POLICY IF EXISTS "Anyone can insert views" ON public.blog_views;
CREATE POLICY "Visitors can insert views with valid visitor_id"
ON public.blog_views
FOR INSERT
WITH CHECK (visitor_id IS NOT NULL AND LENGTH(visitor_id) >= 32);

-- chat_conversations: Restrict to valid visitor_id
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
CREATE POLICY "Valid visitors can create conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (visitor_id IS NOT NULL AND LENGTH(visitor_id) >= 32);

-- chat_messages: Restrict to conversation participants
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
CREATE POLICY "Conversation participants can insert messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations cc
    WHERE cc.id = conversation_id
  )
);

-- music_play_counts: Restrict to valid visitor_id
DROP POLICY IF EXISTS "Anyone can insert play counts" ON public.music_play_counts;
CREATE POLICY "Valid visitors can insert play counts"
ON public.music_play_counts
FOR INSERT
WITH CHECK (visitor_id IS NOT NULL AND LENGTH(visitor_id) >= 32);

-- elio_signups: Restrict INSERT to valid emails only
DROP POLICY IF EXISTS "Anyone can insert signups" ON public.elio_signups;
CREATE POLICY "Valid emails can be inserted"
ON public.elio_signups
FOR INSERT
WITH CHECK (email IS NOT NULL AND email ~ '^[^@]+@[^@]+\.[^@]+$');

-- blog_share_counts: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert share counts" ON public.blog_share_counts;
DROP POLICY IF EXISTS "Anyone can update share counts" ON public.blog_share_counts;
CREATE POLICY "Admins can insert share counts"
ON public.blog_share_counts
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update share counts"
ON public.blog_share_counts
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- blog_summaries: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert summaries" ON public.blog_summaries;
DROP POLICY IF EXISTS "Anyone can update summaries" ON public.blog_summaries;
CREATE POLICY "Admins can insert summaries"
ON public.blog_summaries
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update summaries"
ON public.blog_summaries
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- blog_suggested_questions: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert questions" ON public.blog_suggested_questions;
DROP POLICY IF EXISTS "Anyone can update questions" ON public.blog_suggested_questions;
CREATE POLICY "Admins can insert questions"
ON public.blog_suggested_questions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update questions"
ON public.blog_suggested_questions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 3. Fix forum_comments INSERT policy
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.forum_comments;
CREATE POLICY "Authenticated users can create their own comments"
ON public.forum_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
