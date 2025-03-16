-- Add missing columns to the moves table without trying to add to realtime publication
ALTER TABLE moves ADD COLUMN IF NOT EXISTS evaluation TEXT;
ALTER TABLE moves ADD COLUMN IF NOT EXISTS best_move TEXT;
ALTER TABLE moves ADD COLUMN IF NOT EXISTS best_line TEXT;
