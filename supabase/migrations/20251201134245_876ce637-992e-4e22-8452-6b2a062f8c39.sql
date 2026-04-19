-- Set security_invoker on views to make them respect underlying table RLS policies
-- This means the view executes with the permissions of the calling user

-- For drills_with_ratings view
DROP VIEW IF EXISTS public.drills_with_ratings CASCADE;

CREATE VIEW public.drills_with_ratings
WITH (security_invoker = on)
AS
SELECT 
  d.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as rating_count
FROM public.drills d
LEFT JOIN public.ratings r ON d.id = r.drill_id
GROUP BY d.id;

-- For following_activity view
DROP VIEW IF EXISTS public.following_activity CASCADE;

CREATE VIEW public.following_activity
WITH (security_invoker = on)
AS
SELECT 
  d.id,
  d.title,
  d.description,
  d.sport,
  d.category,
  d.difficulty,
  d.image_url,
  d.created_at,
  d.user_id,
  f.follower_id,
  p.name as author_name,
  p.club as author_club,
  'drill' as activity_type
FROM public.drills d
JOIN public.follows f ON d.user_id = f.following_id
JOIN public.profiles p ON d.user_id = p.id
WHERE d.published = true;