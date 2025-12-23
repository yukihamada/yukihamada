-- Remove sensitive metadata columns from chat_conversations table
-- This data is not necessary for the chat feature and poses a privacy/security risk

ALTER TABLE public.chat_conversations 
DROP COLUMN IF EXISTS ip_address,
DROP COLUMN IF EXISTS hostname,
DROP COLUMN IF EXISTS user_agent;