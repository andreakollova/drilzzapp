-- Create follows table for coach-to-coach following
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Users can view all follows (to see who follows whom)
CREATE POLICY "Follows are viewable by everyone"
ON public.follows
FOR SELECT
USING (true);

-- Users can only follow others (insert their own follows)
CREATE POLICY "Users can follow others"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can only unfollow (delete their own follows)
CREATE POLICY "Users can unfollow"
ON public.follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Create indexes for performance
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- Create a view for activity feed (drills from followed coaches)
CREATE OR REPLACE VIEW public.following_activity AS
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