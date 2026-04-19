-- Make actor_id nullable to allow system-generated audit logs
ALTER TABLE public.audit_logs 
  ALTER COLUMN actor_id DROP NOT NULL;

-- Update the log_role_change function to handle NULL actor_id (system actions)
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Only log if there's an authenticated user (admin action)
    -- Skip logging for automatic role assignments during signup (auth.uid() is NULL)
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        new_value,
        metadata
      ) VALUES (
        auth.uid(),
        'role_assigned',
        'user_role',
        NEW.user_id,
        jsonb_build_object('role', NEW.role),
        jsonb_build_object('role_id', NEW.id)
      );
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Only log if there's an authenticated user (admin action)
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        old_value,
        metadata
      ) VALUES (
        auth.uid(),
        'role_removed',
        'user_role',
        OLD.user_id,
        jsonb_build_object('role', OLD.role),
        jsonb_build_object('role_id', OLD.id)
      );
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;