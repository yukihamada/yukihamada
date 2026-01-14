
-- Remove duplicate INSERT policy on elio_signups
DROP POLICY IF EXISTS "Valid emails can be inserted" ON public.elio_signups;
