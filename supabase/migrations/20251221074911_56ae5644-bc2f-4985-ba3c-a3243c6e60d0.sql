-- Create storage bucket for TTS audio cache
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-tts-cache', 'blog-tts-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to cached audio
CREATE POLICY "Public can read TTS audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-tts-cache');

-- Allow service role to upload TTS audio (edge functions use service role)
CREATE POLICY "Service role can upload TTS audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-tts-cache');

-- Allow service role to update TTS audio
CREATE POLICY "Service role can update TTS audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-tts-cache');