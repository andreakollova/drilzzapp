-- Allow public viewing of training sessions
CREATE POLICY "Published sessions are viewable by everyone"
ON public.training_sessions
FOR SELECT
USING (true);

-- Allow public viewing of session drills
CREATE POLICY "Session drills are viewable by everyone"
ON public.session_drills
FOR SELECT
USING (true);