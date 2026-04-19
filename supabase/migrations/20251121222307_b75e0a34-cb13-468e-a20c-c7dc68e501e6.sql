-- Create storage bucket for drill images
INSERT INTO storage.buckets (id, name, public)
VALUES ('drill-images', 'drill-images', true);

-- Allow authenticated users to upload their own drill images
CREATE POLICY "Users can upload drill images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'drill-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own drill images
CREATE POLICY "Users can update their own drill images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'drill-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own drill images
CREATE POLICY "Users can delete their own drill images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'drill-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow everyone to view drill images (public bucket)
CREATE POLICY "Anyone can view drill images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'drill-images');