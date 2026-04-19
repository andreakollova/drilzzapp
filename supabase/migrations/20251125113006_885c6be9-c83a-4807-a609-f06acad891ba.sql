-- Add notification preferences to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT jsonb_build_object(
  'email_on_comment', true,
  'email_on_like', true,
  'email_on_follow', true,
  'email_on_reply', true
);