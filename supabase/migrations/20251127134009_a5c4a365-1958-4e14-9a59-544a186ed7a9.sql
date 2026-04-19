-- Add position column to drill_collections for custom ordering
ALTER TABLE drill_collections ADD COLUMN position integer;

-- Create index for faster ordering queries
CREATE INDEX idx_drill_collections_position ON drill_collections(collection_id, position);

-- Set initial positions for existing drill_collections
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY collection_id ORDER BY created_at) as row_num
  FROM drill_collections
)
UPDATE drill_collections
SET position = numbered.row_num
FROM numbered
WHERE drill_collections.id = numbered.id;