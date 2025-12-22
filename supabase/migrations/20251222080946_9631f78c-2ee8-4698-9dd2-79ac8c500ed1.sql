-- Create table for tracking music play counts
CREATE TABLE public.music_play_counts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id uuid NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
    visitor_id text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_play_counts ENABLE ROW LEVEL SECURITY;

-- Anyone can add play counts (for tracking)
CREATE POLICY "Anyone can add play counts"
ON public.music_play_counts
FOR INSERT
WITH CHECK (true);

-- Only admins can view play counts
CREATE POLICY "Admins can view play counts"
ON public.music_play_counts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster aggregation
CREATE INDEX idx_music_play_counts_track_id ON public.music_play_counts(track_id);

-- Create function to get play count per track
CREATE OR REPLACE FUNCTION public.get_music_play_counts()
RETURNS TABLE(track_id uuid, play_count bigint, unique_listeners bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        mpc.track_id,
        COUNT(*) as play_count,
        COUNT(DISTINCT mpc.visitor_id) as unique_listeners
    FROM public.music_play_counts mpc
    GROUP BY mpc.track_id;
$$;