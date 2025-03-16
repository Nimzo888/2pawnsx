-- Add rating change columns to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS white_rating_change INTEGER;
ALTER TABLE games ADD COLUMN IF NOT EXISTS black_rating_change INTEGER;

-- Create a function to increment a column value
CREATE OR REPLACE FUNCTION increment(row_id UUID, table_name TEXT, column_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_val INTEGER;
  query TEXT;
BEGIN
  query := 'SELECT ' || column_name || ' FROM ' || table_name || ' WHERE id = $1';
  EXECUTE query INTO current_val USING row_id;
  RETURN current_val + 1;
END;
$$ LANGUAGE plpgsql;

-- Create rating history table
CREATE TABLE IF NOT EXISTS rating_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  rating_before INTEGER NOT NULL,
  rating_after INTEGER NOT NULL,
  rating_change INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rating_history_user_id ON rating_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_history_game_id ON rating_history(game_id);

-- Rating history table is already added to realtime publication
