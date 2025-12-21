-- Create music_tracks table for managing music
CREATE TABLE public.music_tracks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  artist text NOT NULL DEFAULT 'Yuki Hamada',
  src text NOT NULL,
  artwork text,
  color text DEFAULT '#3b82f6',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Anyone can view active tracks
CREATE POLICY "Anyone can view active tracks"
ON public.music_tracks
FOR SELECT
USING (is_active = true);

-- Admins can view all tracks
CREATE POLICY "Admins can view all tracks"
ON public.music_tracks
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can create tracks
CREATE POLICY "Admins can create tracks"
ON public.music_tracks
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update tracks
CREATE POLICY "Admins can update tracks"
ON public.music_tracks
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete tracks
CREATE POLICY "Admins can delete tracks"
ON public.music_tracks
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_music_tracks_updated_at
  BEFORE UPDATE ON public.music_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial tracks from existing data
INSERT INTO public.music_tracks (title, artist, src, artwork, color, display_order) VALUES
('Free to Change', 'Yuki Hamada', '/audio/free-to-change.mp3', '/assets/album-free-to-change.jpg', '#3b82f6', 1),
('HELLO 2150', 'Yuki Hamada', '/audio/hello-2150.mp3', '/assets/album-hello-2150.jpg', '#8b5cf6', 2),
('Everybody say BJJ', 'Yuki Hamada', '/audio/everybody-say-bjj.mp3', '/assets/album-everybody-bjj.jpg', '#ef4444', 3),
('I Love You', 'Yuki Hamada', '/audio/i-love-you.mp3', '/assets/album-i-love-you.jpg', '#ec4899', 4),
('I Need Your Attention', 'Yuki Hamada', '/audio/i-need-your-attention.mp3', '/assets/album-attention.jpg', '#f59e0b', 5),
('それ恋じゃなく柔術でした', 'Yuki Hamada', '/audio/sore-koi-janaku-jujutsu.mp3', '/assets/album-koi-jujutsu.jpg', '#10b981', 6),
('塩とピクセル', 'Yuki Hamada', '/audio/shio-to-pixel.mp3', '/assets/album-shio-pixel.jpg', '#06b6d4', 7),
('結び直す朝', 'Yuki Hamada', '/audio/musubinaosu-asa.mp3', '/assets/album-musubinaosu.jpg', '#f97316', 8);