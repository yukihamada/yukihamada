-- Add rate limiting for chat_conversations to prevent DoS attacks
-- Limit: max 10 conversations per visitor per hour

CREATE OR REPLACE FUNCTION public.check_chat_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Count conversations from this visitor in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.chat_conversations
  WHERE visitor_id = NEW.visitor_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 10 conversations per hour per visitor
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many conversations. Please wait before creating more.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply rate limit trigger to chat_conversations
DROP TRIGGER IF EXISTS check_chat_rate_limit_trigger ON public.chat_conversations;
CREATE TRIGGER check_chat_rate_limit_trigger
  BEFORE INSERT ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_chat_rate_limit();

-- Add similar rate limiting for chat_messages (max 60 messages per conversation per hour)
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Count messages in this conversation in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.chat_messages
  WHERE conversation_id = NEW.conversation_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 60 messages per hour per conversation
  IF recent_count >= 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many messages. Please wait before sending more.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply rate limit trigger to chat_messages
DROP TRIGGER IF EXISTS check_message_rate_limit_trigger ON public.chat_messages;
CREATE TRIGGER check_message_rate_limit_trigger
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_rate_limit();

-- Add index to optimize rate limit queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_visitor_created 
  ON public.chat_conversations(visitor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created 
  ON public.chat_messages(conversation_id, created_at DESC);