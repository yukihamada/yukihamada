-- Create table for AI response feedback/evaluation
CREATE TABLE public.chat_message_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'bad', 'neutral')),
  feedback_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id)
);

-- Enable RLS
ALTER TABLE public.chat_message_feedback ENABLE ROW LEVEL SECURITY;

-- Only admins can manage feedback
CREATE POLICY "Admins can manage feedback"
ON public.chat_message_feedback
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX idx_chat_message_feedback_message_id ON public.chat_message_feedback(message_id);
CREATE INDEX idx_chat_message_feedback_rating ON public.chat_message_feedback(rating);

-- Add trigger for updated_at
CREATE TRIGGER update_chat_message_feedback_updated_at
BEFORE UPDATE ON public.chat_message_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();