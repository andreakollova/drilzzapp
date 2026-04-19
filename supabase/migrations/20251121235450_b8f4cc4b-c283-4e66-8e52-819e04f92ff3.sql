-- Create storage bucket for drill videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'drill-videos',
  'drill-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']
);

-- Create RLS policies for drill videos bucket
CREATE POLICY "Anyone can view drill videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'drill-videos');

CREATE POLICY "Authenticated users can upload drill videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'drill-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own drill videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'drill-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own drill videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'drill-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add video_url column to drills table
ALTER TABLE drills ADD COLUMN video_url text;