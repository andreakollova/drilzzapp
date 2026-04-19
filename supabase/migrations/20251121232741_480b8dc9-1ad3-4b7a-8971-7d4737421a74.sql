-- Create a view that includes drill ratings for easier querying and sorting
CREATE OR REPLACE VIEW public.drills_with_ratings AS
SELECT 
  d.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as rating_count
FROM public.drills d
LEFT JOIN public.ratings r ON d.id = r.drill_id
GROUP BY d.id;

-- Grant select permissions on the view
GRANT SELECT ON public.drills_with_ratings TO authenticated;

-- Create an index on the ratings table for better performance
CREATE INDEX IF NOT EXISTS idx_ratings_drill_rating ON public.ratings(drill_id, rating);