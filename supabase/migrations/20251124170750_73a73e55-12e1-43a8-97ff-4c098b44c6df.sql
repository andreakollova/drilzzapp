-- Remove the overly permissive policy that still exposes email
DROP POLICY IF EXISTS "Public profile data is viewable" ON public.profiles;

-- The public_profiles view will handle public access without exposing email
-- Only authenticated users viewing their own profile can see the email field