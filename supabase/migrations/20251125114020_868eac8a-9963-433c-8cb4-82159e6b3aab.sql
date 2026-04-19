-- Ensure profiles table has proper CASCADE on auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure all tables cascade delete when profile is deleted
ALTER TABLE drills DROP CONSTRAINT IF EXISTS drills_user_id_fkey;
ALTER TABLE drills ADD CONSTRAINT drills_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;
ALTER TABLE ratings ADD CONSTRAINT ratings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE saved_drills DROP CONSTRAINT IF EXISTS saved_drills_user_id_fkey;
ALTER TABLE saved_drills ADD CONSTRAINT saved_drills_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_user_id_fkey;
ALTER TABLE collections ADD CONSTRAINT collections_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure follows table cascades properly
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE follows ADD CONSTRAINT follows_follower_id_fkey 
  FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE follows ADD CONSTRAINT follows_following_id_fkey 
  FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure notifications cascade
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_actor_id_fkey 
  FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE CASCADE;