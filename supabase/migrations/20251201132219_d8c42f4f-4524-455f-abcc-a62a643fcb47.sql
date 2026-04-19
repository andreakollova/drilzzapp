-- Add RLS policy to allow anyone to view drills in official collections
CREATE POLICY "Anyone can view drills in official collections" 
ON public.drill_collections 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.collections 
    WHERE collections.id = drill_collections.collection_id 
    AND collections.is_official = true
  )
);