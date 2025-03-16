-- Create game_analysis table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  white_accuracy FLOAT,
  black_accuracy FLOAT,
  white_blunders INTEGER DEFAULT 0,
  black_blunders INTEGER DEFAULT 0,
  white_mistakes INTEGER DEFAULT 0,
  black_mistakes INTEGER DEFAULT 0,
  white_inaccuracies INTEGER DEFAULT 0,
  black_inaccuracies INTEGER DEFAULT 0,
  analysis_depth INTEGER DEFAULT 18,
  analysis_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_analysis_game_id ON game_analysis(game_id);

-- Enable realtime for game_analysis
alter publication supabase_realtime add table game_analysis;

-- Create imported_pgn table for storing imported games
CREATE TABLE IF NOT EXISTS imported_pgn (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pgn TEXT NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_imported_pgn_user_id ON imported_pgn(user_id);

-- Enable realtime for imported_pgn
alter publication supabase_realtime add table imported_pgn;

-- Create game_viewers table to track who has viewed a game
CREATE TABLE IF NOT EXISTS game_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_viewers_game_id ON game_viewers(game_id);
CREATE INDEX IF NOT EXISTS idx_game_viewers_user_id ON game_viewers(user_id);

-- Add columns to games table for live game support if they don't exist
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;
ALTER TABLE games ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE games ADD COLUMN IF NOT EXISTS spectator_count INTEGER DEFAULT 0;

-- Create function to update last_activity timestamp
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_activity on game updates
DROP TRIGGER IF EXISTS update_game_last_activity ON games;
CREATE TRIGGER update_game_last_activity
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();
