-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- Recipient of the notification
  actor_id uuid NOT NULL, -- User who performed the action
  type text NOT NULL CHECK (type IN ('follower', 'like', 'comment', 'reply')),
  drill_id uuid, -- Related drill (for likes/comments)
  comment_id uuid, -- Related comment (for replies)
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create notification for new follower
CREATE OR REPLACE FUNCTION public.create_follower_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name text;
BEGIN
  -- Get the follower's name
  SELECT name INTO follower_name
  FROM profiles
  WHERE id = NEW.follower_id;

  -- Create notification for the user being followed
  INSERT INTO notifications (user_id, actor_id, type, message)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follower',
    follower_name || ' started following you'
  );

  RETURN NEW;
END;
$$;

-- Trigger for new followers
CREATE TRIGGER on_new_follower
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follower_notification();

-- Function to create notification for new like
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  liker_name text;
  drill_title text;
  drill_owner_id uuid;
BEGIN
  -- Get the liker's name and drill info
  SELECT p.name, d.title, d.user_id
  INTO liker_name, drill_title, drill_owner_id
  FROM profiles p, drills d
  WHERE p.id = NEW.user_id AND d.id = NEW.drill_id;

  -- Only create notification if someone else liked the drill (not the owner)
  IF drill_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, drill_id, message)
    VALUES (
      drill_owner_id,
      NEW.user_id,
      'like',
      NEW.drill_id,
      liker_name || ' liked your drill "' || drill_title || '"'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for new likes
CREATE TRIGGER on_new_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();

-- Function to create notification for new comment or reply
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  commenter_name text;
  drill_title text;
  drill_owner_id uuid;
  parent_comment_user_id uuid;
BEGIN
  -- Get the commenter's name and drill info
  SELECT p.name, d.title, d.user_id
  INTO commenter_name, drill_title, drill_owner_id
  FROM profiles p, drills d
  WHERE p.id = NEW.user_id AND d.id = NEW.drill_id;

  -- If this is a reply (has parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Get the parent comment's author
    SELECT user_id INTO parent_comment_user_id
    FROM comments
    WHERE id = NEW.parent_id;

    -- Notify the parent comment author (if not replying to themselves)
    IF parent_comment_user_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, actor_id, type, drill_id, comment_id, message)
      VALUES (
        parent_comment_user_id,
        NEW.user_id,
        'reply',
        NEW.drill_id,
        NEW.id,
        commenter_name || ' replied to your comment on "' || drill_title || '"'
      );
    END IF;
  ELSE
    -- This is a top-level comment, notify the drill owner
    IF drill_owner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, actor_id, type, drill_id, comment_id, message)
      VALUES (
        drill_owner_id,
        NEW.user_id,
        'comment',
        NEW.drill_id,
        NEW.id,
        commenter_name || ' commented on your drill "' || drill_title || '"'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for new comments
CREATE TRIGGER on_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();