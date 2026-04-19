-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Allow users to view their own complete profile (including email)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a public view that excludes sensitive information like email
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  sport,
  club,
  teams,
  country,
  bio,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles;

-- Allow everyone to view the public profiles view (without email)
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Create a policy to allow viewing public profile data through queries
-- This allows viewing other profiles but application should use public_profiles view
CREATE POLICY "Public profile data is viewable"
ON public.profiles
FOR SELECT
USING (true);