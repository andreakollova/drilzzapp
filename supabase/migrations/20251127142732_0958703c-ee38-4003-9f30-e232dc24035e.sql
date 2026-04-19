-- Create training sessions table
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  total_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session drills junction table
CREATE TABLE public.session_drills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  drill_id UUID REFERENCES drills(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
  duration_override INTEGER,
  custom_activity_name TEXT,
  custom_activity_duration INTEGER,
  section TEXT NOT NULL DEFAULT 'main',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_drills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_sessions
CREATE POLICY "Users can view their own sessions"
ON public.training_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.training_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.training_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.training_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for session_drills
CREATE POLICY "Users can view drills in their own sessions"
ON public.session_drills
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM training_sessions
  WHERE training_sessions.id = session_drills.session_id
  AND training_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can add drills to their own sessions"
ON public.session_drills
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM training_sessions
  WHERE training_sessions.id = session_drills.session_id
  AND training_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can update drills in their own sessions"
ON public.session_drills
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM training_sessions
  WHERE training_sessions.id = session_drills.session_id
  AND training_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can delete drills from their own sessions"
ON public.session_drills
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM training_sessions
  WHERE training_sessions.id = session_drills.session_id
  AND training_sessions.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_training_sessions_updated_at
BEFORE UPDATE ON public.training_sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();