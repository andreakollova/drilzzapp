-- Create collections table for organizing drills
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Users can only view their own collections
CREATE POLICY "Users can view their own collections"
ON public.collections
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own collections
CREATE POLICY "Users can create their own collections"
ON public.collections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own collections
CREATE POLICY "Users can update their own collections"
ON public.collections
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own collections
CREATE POLICY "Users can delete their own collections"
ON public.collections
FOR DELETE
USING (auth.uid() = user_id);

-- Create drill_collections junction table
CREATE TABLE public.drill_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  drill_id uuid NOT NULL REFERENCES public.drills(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(collection_id, drill_id)
);

-- Enable RLS
ALTER TABLE public.drill_collections ENABLE ROW LEVEL SECURITY;

-- Users can view drill_collections for their own collections
CREATE POLICY "Users can view their own drill collections"
ON public.drill_collections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = drill_collections.collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Users can add drills to their own collections
CREATE POLICY "Users can add drills to their own collections"
ON public.drill_collections
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = drill_collections.collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Users can remove drills from their own collections
CREATE POLICY "Users can remove drills from their own collections"
ON public.drill_collections
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = drill_collections.collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_drill_collections_collection_id ON public.drill_collections(collection_id);
CREATE INDEX idx_drill_collections_drill_id ON public.drill_collections(drill_id);

-- Trigger for updating updated_at on collections
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();