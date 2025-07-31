-- Enhanced CMS Storage Configuration
-- Storage buckets and policies for comprehensive media management

-- ======================================================================
-- STORAGE BUCKETS FOR CMS MEDIA
-- ======================================================================

-- Create storage buckets for different types of media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
('article-media', 'article-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']), -- 50MB limit
('business-media', 'business-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
('page-media', 'page-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
('user-avatars', 'user-avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 10MB limit
('team-photos', 'team-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('testimonial-photos', 'testimonial-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('gallery-media', 'gallery-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']),
('newsletter-assets', 'newsletter-assets', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp']) -- 20MB limit
ON CONFLICT (id) DO NOTHING;

-- ======================================================================
-- STORAGE POLICIES FOR PUBLIC ACCESS
-- ======================================================================

-- Article media policies
CREATE POLICY "Anyone can view article media" ON storage.objects FOR SELECT 
USING (bucket_id = 'article-media');

CREATE POLICY "Authenticated users can upload article media" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'article-media' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor', 'author')
  )
);

CREATE POLICY "Authors can update own article media" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'article-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authors can delete own article media" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'article-media'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  )
);

-- ======================================================================
-- BUSINESS MEDIA POLICIES
-- ======================================================================

-- Business media policies
CREATE POLICY "Anyone can view business media" ON storage.objects FOR SELECT 
USING (bucket_id = 'business-media');

CREATE POLICY "Business owners can upload business media" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'business-media' 
  AND auth.role() = 'authenticated'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Business owners can manage own business media" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'business-media'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Business owners can delete own business media" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'business-media'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  )
);

-- ======================================================================
-- PAGE MEDIA POLICIES
-- ======================================================================

-- Page media policies
CREATE POLICY "Anyone can view page media" ON storage.objects FOR SELECT 
USING (bucket_id = 'page-media');

CREATE POLICY "Editors can manage page media" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'page-media' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Editors can update page media" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'page-media'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Editors can delete page media" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'page-media'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- USER AVATAR POLICIES
-- ======================================================================

-- User avatar policies
CREATE POLICY "Anyone can view user avatars" ON storage.objects FOR SELECT 
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload own avatars" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ======================================================================
-- TEAM PHOTOS POLICIES
-- ======================================================================

-- Team photos policies
CREATE POLICY "Anyone can view team photos" ON storage.objects FOR SELECT 
USING (bucket_id = 'team-photos');

CREATE POLICY "Admins can manage team photos" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'team-photos' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins can update team photos" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'team-photos'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins can delete team photos" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'team-photos'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- TESTIMONIAL PHOTOS POLICIES
-- ======================================================================

-- Testimonial photos policies
CREATE POLICY "Anyone can view testimonial photos" ON storage.objects FOR SELECT 
USING (bucket_id = 'testimonial-photos');

CREATE POLICY "Admins can manage testimonial photos" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'testimonial-photos' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins can update testimonial photos" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'testimonial-photos'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins can delete testimonial photos" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'testimonial-photos'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- GALLERY MEDIA POLICIES
-- ======================================================================

-- Gallery media policies (supports images and videos)
CREATE POLICY "Anyone can view gallery media" ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery-media');

CREATE POLICY "Content creators can upload gallery media" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'gallery-media' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor', 'author')
  )
);

CREATE POLICY "Gallery creators can manage own gallery media" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'gallery-media'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Gallery creators can delete own gallery media" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'gallery-media'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  )
);

-- ======================================================================
-- NEWSLETTER ASSETS POLICIES
-- ======================================================================

-- Newsletter assets policies
CREATE POLICY "Anyone can view newsletter assets" ON storage.objects FOR SELECT 
USING (bucket_id = 'newsletter-assets');

CREATE POLICY "Editors can manage newsletter assets" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'newsletter-assets' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Editors can update newsletter assets" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'newsletter-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Editors can delete newsletter assets" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'newsletter-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- STORAGE HELPER FUNCTIONS
-- ======================================================================

-- Function to get user's storage usage
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_files', COUNT(*),
    'total_size_bytes', COALESCE(SUM(metadata->>'size'), '0')::BIGINT,
    'total_size_mb', ROUND((COALESCE(SUM((metadata->>'size')::BIGINT), 0) / 1048576.0)::NUMERIC, 2),
    'by_bucket', json_object_agg(
      bucket_id, 
      json_build_object(
        'files', bucket_files,
        'size_mb', bucket_size_mb
      )
    )
  ) INTO result
  FROM (
    SELECT 
      bucket_id,
      COUNT(*) as bucket_files,
      ROUND((COALESCE(SUM((metadata->>'size')::BIGINT), 0) / 1048576.0)::NUMERIC, 2) as bucket_size_mb
    FROM storage.objects 
    WHERE owner = user_uuid
    GROUP BY bucket_id
  ) bucket_stats;
  
  RETURN COALESCE(result, '{"total_files": 0, "total_size_bytes": 0, "total_size_mb": 0, "by_bucket": {}}'::json);
END;
$$;

-- Function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage_files()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_count INT := 0;
  result JSON;
BEGIN
  -- This would identify and clean up files that are no longer referenced
  -- in the media table or other content tables
  
  -- For now, just return a placeholder
  SELECT json_build_object(
    'cleaned_files', cleaned_count,
    'message', 'Storage cleanup functionality ready for implementation',
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get storage statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_storage_statistics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_files', COUNT(*),
    'total_size_mb', ROUND((COALESCE(SUM((metadata->>'size')::BIGINT), 0) / 1048576.0)::NUMERIC, 2),
    'by_bucket', json_object_agg(
      bucket_id,
      json_build_object(
        'files', bucket_files,
        'size_mb', bucket_size_mb,
        'avg_file_size_kb', ROUND(avg_file_size_kb::NUMERIC, 2)
      )
    ),
    'recent_uploads', (
      SELECT json_agg(
        json_build_object(
          'name', name,
          'bucket', bucket_id,
          'size_mb', ROUND(((metadata->>'size')::BIGINT / 1048576.0)::NUMERIC, 2),
          'uploaded_at', created_at
        )
      )
      FROM storage.objects 
      ORDER BY created_at DESC 
      LIMIT 10
    )
  ) INTO result
  FROM (
    SELECT 
      bucket_id,
      COUNT(*) as bucket_files,
      ROUND((COALESCE(SUM((metadata->>'size')::BIGINT), 0) / 1048576.0)::NUMERIC, 2) as bucket_size_mb,
      AVG((metadata->>'size')::BIGINT / 1024.0) as avg_file_size_kb
    FROM storage.objects 
    GROUP BY bucket_id
  ) bucket_stats;
  
  RETURN COALESCE(result, '{"total_files": 0, "total_size_mb": 0, "by_bucket": {}, "recent_uploads": []}'::json);
END;
$$;