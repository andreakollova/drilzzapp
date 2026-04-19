-- Drop the existing view
DROP VIEW IF EXISTS public.following_activity;

-- Recreate the view without security definer (it was implicitly set)
-- This view will use the permissions of the querying user
CREATE VIEW public.following_activity 
WITH (security_invoker = true)
AS
SELECT 
  d.id,
  d.title,
  d.description,
  d.image_url,
  d.sport,
  d.category,
  d.difficulty,
  d.created_at,
  d.user_id,
  p.name as author_name,
  p.club as author_club,
  f.follower_id,
  'drill' as activity_type
FROM public.drills d
JOIN public.follows f ON d.user_id = f.following_id
JOIN public.profiles p ON d.user_id = p.id
WHERE d.published = true
ORDER BY d.created_at DESC;