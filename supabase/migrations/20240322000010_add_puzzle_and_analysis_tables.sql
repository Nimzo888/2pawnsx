-- Create game_analysis table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) UNIQUE,
    white_accuracy FLOAT,
    black_accuracy FLOAT,
    white_blunders INTEGER DEFAULT 0,
    black_blunders INTEGER DEFAULT 0,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to move_analysis table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'move_analysis' AND column_name = 'accuracy') THEN
        ALTER TABLE move_analysis ADD COLUMN accuracy FLOAT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'move_analysis' AND column_name = 'is_best_move') THEN
        ALTER TABLE move_analysis ADD COLUMN is_best_move BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'move_analysis' AND column_name = 'is_blunder') THEN
        ALTER TABLE move_analysis ADD COLUMN is_blunder BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'move_analysis' AND column_name = 'is_mistake') THEN
        ALTER TABLE move_analysis ADD COLUMN is_mistake BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'move_analysis' AND column_name = 'is_inaccuracy') THEN
        ALTER TABLE move_analysis ADD COLUMN is_inaccuracy BOOLEAN;
    END IF;
    
    -- Create puzzles table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'puzzles') THEN
        CREATE TABLE puzzles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            fen_position TEXT NOT NULL,
            solution TEXT NOT NULL,
            continuation TEXT,
            difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
            source_game_id UUID REFERENCES games(id),
            source_move_number INTEGER,
            times_solved INTEGER DEFAULT 0,
            times_attempted INTEGER DEFAULT 0,
            rating INTEGER DEFAULT 1500,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Enable RLS on puzzles table
    ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for puzzles table
    DROP POLICY IF EXISTS "Puzzles are viewable by everyone" ON puzzles;
    CREATE POLICY "Puzzles are viewable by everyone" ON puzzles
        FOR SELECT USING (true);
        
    -- Add puzzles to realtime publication
    ALTER PUBLICATION supabase_realtime ADD TABLE puzzles;
    
 END $$;
