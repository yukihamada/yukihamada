-- Add lyrics column to music_tracks table
ALTER TABLE public.music_tracks ADD COLUMN IF NOT EXISTS lyrics jsonb DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.music_tracks.lyrics IS 'JSON array of lyrics with timestamps: [{start: number, end: number, text: string}]';