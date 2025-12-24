-- Create a new storage bucket for project files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
-- 1. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- 2. Allow users to view their own uploaded files or public files
-- (Adjusting generic public view since we made the bucket public)
CREATE POLICY "Public access to project files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');

-- 3. Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-files' AND auth.uid() = owner);
