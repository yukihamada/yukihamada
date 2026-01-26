-- Create storage bucket for podcast BGM tracks
INSERT INTO storage.buckets (id, name, public)
VALUES ('podcast-bgm', 'podcast-bgm', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to podcast BGM
CREATE POLICY "Anyone can view podcast BGM"
ON storage.objects FOR SELECT
USING (bucket_id = 'podcast-bgm');

-- Allow service role to upload BGM
CREATE POLICY "Service role can upload BGM"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'podcast-bgm');