-- Fix the security definer view by recreating it with SECURITY INVOKER
DROP VIEW IF EXISTS public.drills_with_ratings;

CREATE VIEW public.drills_with_ratings 
WITH (security_invoker = true)
AS
SELECT 
  d.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as rating_count
FROM public.drills d
LEFT JOIN public.ratings r ON d.id = r.drill_id
GROUP BY d.id;