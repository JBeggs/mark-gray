-- Simple Avatar Storage Setup (run as service_role)
-- This should work with standard permissions

-- Make sure avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

-- Grant basic permissions (this might work better)
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;