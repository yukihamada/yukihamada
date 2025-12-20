-- Create high scores table for 404 game
CREATE TABLE public.game_high_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  score integer NOT NULL,
  game_type text NOT NULL DEFAULT 'snake',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_high_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can view high scores (public leaderboard)
CREATE POLICY "Anyone can view high scores"
ON public.game_high_scores
FOR SELECT
USING (true);

-- Anyone can insert their score
CREATE POLICY "Anyone can add high scores"
ON public.game_high_scores
FOR INSERT
WITH CHECK (true);

-- Create index for faster leaderboard queries
CREATE INDEX idx_game_high_scores_ranking ON public.game_high_scores (game_type, score DESC, created_at ASC);