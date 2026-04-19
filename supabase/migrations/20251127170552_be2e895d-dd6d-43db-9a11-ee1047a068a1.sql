-- Add columns to collections table for official/curated collections
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sport TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Create index for fast lookups of official collections by sport
CREATE INDEX IF NOT EXISTS idx_collections_official_sport ON collections(is_official, sport) WHERE is_official = true;

-- Add RLS policy to allow all authenticated users to view official collections
CREATE POLICY "Anyone can view official collections" 
ON collections 
FOR SELECT 
USING (is_official = true);

-- Update existing policy to allow viewing own collections OR official collections
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
CREATE POLICY "Users can view their own or official collections" 
ON collections 
FOR SELECT 
USING (auth.uid() = user_id OR is_official = true);