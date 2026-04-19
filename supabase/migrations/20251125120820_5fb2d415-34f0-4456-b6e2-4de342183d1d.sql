-- Add email_digest preference to profiles notification_preferences
-- This updates the default notification preferences to include email digest option
ALTER TABLE public.profiles 
ALTER COLUMN notification_preferences 
SET DEFAULT jsonb_build_object(
  'email_on_comment', true, 
  'email_on_like', true, 
  'email_on_follow', true, 
  'email_on_reply', true,
  'email_digest', true
);