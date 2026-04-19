-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- RLS Policies - only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
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
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
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
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to log drill deletions
CREATE OR REPLACE FUNCTION public.log_drill_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_value,
    metadata
  ) VALUES (
    auth.uid(),
    'drill_deleted',
    'drill',
    OLD.id,
    jsonb_build_object(
      'title', OLD.title,
      'sport', OLD.sport,
      'category', OLD.category,
      'author_id', OLD.user_id
    ),
    jsonb_build_object('published', OLD.published)
  );
  RETURN OLD;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_log_role_change
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

CREATE TRIGGER trigger_log_drill_deletion
  BEFORE DELETE ON public.drills
  FOR EACH ROW
  EXECUTE FUNCTION public.log_drill_deletion();