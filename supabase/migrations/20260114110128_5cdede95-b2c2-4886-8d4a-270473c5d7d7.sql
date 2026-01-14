
-- Fix: elio_signups still has public SELECT access
-- Drop ALL existing SELECT policies on elio_signups
DROP POLICY IF EXISTS "Anyone can signup for elio" ON public.elio_signups;
DROP POLICY IF EXISTS "Admins can view signups" ON public.elio_signups;
DROP POLICY IF EXISTS "Only admins can view signups" ON public.elio_signups;

-- Keep only INSERT policy for signups
CREATE POLICY "Public can insert signups"
ON public.elio_signups
FOR INSERT
WITH CHECK (email IS NOT NULL AND email ~ '^[^@]+@[^@]+\.[^@]+$');

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can view signups"
ON public.elio_signups
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
