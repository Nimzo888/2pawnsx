-- Add missing columns to moves table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='moves' AND column_name='best_move') THEN
        ALTER TABLE moves ADD COLUMN best_move TEXT;
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='moves' AND column_name='principal_variation') THEN
        ALTER TABLE moves ADD COLUMN principal_variation TEXT;
    END IF;
END $$;