-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  drill_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, drill_id)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Ratings are viewable by everyone"
ON public.ratings FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own ratings"
ON public.ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.ratings FOR DELETE
USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.ratings
ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_drill_id_fkey FOREIGN KEY (drill_id) REFERENCES drills(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_ratings_drill_id ON public.ratings(drill_id);
CREATE INDEX idx_ratings_user_id ON public.ratings(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_ratings_updated_at
BEFORE UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();