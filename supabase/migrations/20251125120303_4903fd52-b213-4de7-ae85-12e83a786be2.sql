-- Create invites table to track referrals
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired
  invite_code TEXT NOT NULL UNIQUE,
  accepted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- Add referral tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Enable RLS on invites table
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Users can view their own sent invites
CREATE POLICY "Users can view their own invites"
ON public.invites
FOR SELECT
USING (auth.uid() = inviter_id);

-- Users can create invites
CREATE POLICY "Users can create invites"
ON public.invites
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

-- Users can update their own invites (for resending, etc.)
CREATE POLICY "Users can update their own invites"
ON public.invites
FOR UPDATE
USING (auth.uid() = inviter_id);

-- Create index for faster lookups
CREATE INDEX idx_invites_code ON public.invites(invite_code);
CREATE INDEX idx_invites_inviter ON public.invites(inviter_id);
CREATE INDEX idx_invites_status ON public.invites(status);

-- Function to update referral count when invite is accepted
CREATE OR REPLACE FUNCTION public.update_referral_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Increment referral count for inviter
    UPDATE public.profiles
    SET referral_count = referral_count + 1
    WHERE id = NEW.inviter_id;
    
    -- Set referred_by for the new user
    UPDATE public.profiles
    SET referred_by = NEW.inviter_id
    WHERE id = NEW.accepted_by;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update referral count
CREATE TRIGGER on_invite_accepted
AFTER UPDATE ON public.invites
FOR EACH ROW
EXECUTE FUNCTION public.update_referral_count();