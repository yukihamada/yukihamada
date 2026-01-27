-- Create newsletter_subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public users can only INSERT with email validation
CREATE POLICY "Public can subscribe to newsletter"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (
  email IS NOT NULL 
  AND email ~ '^[^@]+@[^@]+\.[^@]+$'
);

-- Only admins can view subscriptions
CREATE POLICY "Only admins can view subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete subscriptions
CREATE POLICY "Only admins can delete subscriptions"
ON public.newsletter_subscriptions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));