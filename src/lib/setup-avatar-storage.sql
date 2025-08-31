-- Setup Avatar Storage Bucket and Policies
-- Run this in Supabase SQL Editor

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can view avatars (public read)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

COMMENT ON POLICY "Users can upload own avatar" ON storage.objects IS 
'Users can upload avatar images to their own folder (user_id/filename)';

COMMENT ON POLICY "Users can update own avatar" ON storage.objects IS 
'Users can update their own avatar images';

COMMENT ON POLICY "Users can delete own avatar" ON storage.objects IS 
'Users can delete their own avatar images';

COMMENT ON POLICY "Anyone can view avatars" ON storage.objects IS 
'Public read access to all avatar images';