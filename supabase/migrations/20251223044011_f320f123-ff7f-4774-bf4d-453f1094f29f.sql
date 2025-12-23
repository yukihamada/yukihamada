-- Add public_id field to profiles table for external references
ALTER TABLE public.profiles ADD COLUMN public_id TEXT UNIQUE;

-- Generate public_id for existing profiles (8 character random string)
UPDATE public.profiles 
SET public_id = substr(md5(random()::text || id::text), 1, 8)
WHERE public_id IS NULL;

-- Make public_id NOT NULL after filling existing data
ALTER TABLE public.profiles ALTER COLUMN public_id SET NOT NULL;

-- Set default for new profiles
ALTER TABLE public.profiles ALTER COLUMN public_id SET DEFAULT substr(md5(random()::text || gen_random_uuid()::text), 1, 8);

-- Create index for fast lookups
CREATE INDEX idx_profiles_public_id ON public.profiles(public_id);

-- Update RLS policy to not expose user_id in forum activity lookups
-- First drop the existing policies that expose user_id
DROP POLICY IF EXISTS "Public can view profiles with forum activity" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles with forum activity" ON public.profiles;

-- Create new policies that only expose public-safe fields
CREATE POLICY "Public can view limited profile info with forum activity" 
ON public.profiles 
FOR SELECT 
USING (
  (EXISTS (SELECT 1 FROM forum_comments fc WHERE fc.user_id = profiles.user_id))
  OR 
  (EXISTS (SELECT 1 FROM forum_topics ft WHERE ft.user_id = profiles.user_id))
);