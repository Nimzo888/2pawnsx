-- Create move_analysis table to store detailed analysis of each move
CREATE TABLE IF NOT EXISTS move_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  fen_position TEXT NOT NULL,
  san_notation TEXT NOT NULL,
  evaluation FLOAT,
  best_move TEXT,
  principal_variation TEXT,
  depth INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, move_number)
);

-- Add analysis fields to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS analysis_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS analysis_depth INTEGER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS move_analysis_game_id_idx ON move_analysis(game_id);
CREATE INDEX IF NOT EXISTS move_analysis_fen_idx ON move_analysis(fen_position);

-- Enable RLS on move_analysis
ALTER TABLE move_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for move_analysis
DROP POLICY IF EXISTS "Users can view any move analysis" ON move_analysis;
CREATE POLICY "Users can view any move analysis"
  ON move_analysis FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own move analysis" ON move_analysis;
CREATE POLICY "Users can insert their own move analysis"
  ON move_analysis FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM games 
      WHERE white_player_id = auth.uid() OR black_player_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own move analysis" ON move_analysis;
CREATE POLICY "Users can update their own move analysis"
  ON move_analysis FOR UPDATE
  USING (
    game_id IN (
      SELECT id FROM games 
      WHERE white_player_id = auth.uid() OR black_player_id = auth.uid()
    )
  );

-- Add to realtime publication if not already added
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'move_analysis'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE move_analysis;
  END IF;
END
$;
