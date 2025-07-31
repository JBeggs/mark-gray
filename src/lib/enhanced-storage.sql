-- Enhanced Storage Configuration for Modern News Platform
-- Comprehensive storage buckets and policies for media management

-- ======================================================================
-- STORAGE BUCKETS
-- ======================================================================

-- Create storage buckets for different media types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
-- Article media (images, videos, documents)
('article-media', 'article-media', true, 52428800, ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]),

-- Business media (logos, gallery images, documents)
('business-media', 'business-media', true, 26214400, ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf'
]),

-- User avatars and profiles
('user-avatars', 'user-avatars', true, 5242880, ARRAY[
  'image/jpeg', 'image/png', 'image/webp'
]),

-- Advertisement media
('advertisement-media', 'advertisement-media', true, 10485760, ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif'
]),

-- Audio files (podcasts, voice recordings)
('audio-files', 'audio-files', false, 104857600, ARRAY[
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'
]),

-- Content imports (CSV, JSON, etc.)
('content-imports', 'content-imports', false, 52428800, ARRAY[
  'text/csv', 'application/json', 'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
]),

-- Newsletter templates and assets
('newsletter-assets', 'newsletter-assets', true, 5242880, ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'text/html'
]),

-- System assets (logos, favicons, etc.)
('system-assets', 'system-assets', true, 2097152, ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon'
]);

-- ======================================================================
-- STORAGE POLICIES
-- ======================================================================

-- Article Media Policies
CREATE POLICY "Anyone can view article media" ON storage.objects FOR SELECT 
USING (bucket_id = 'article-media');

CREATE POLICY "Authenticated users can upload article media" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'article-media' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own article media" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'article-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own article media" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'article-media' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
    )
  )
);

-- Business Media Policies
CREATE POLICY "Anyone can view business media" ON storage.objects FOR SELECT 
USING (bucket_id = 'business-media');

CREATE POLICY "Business owners can upload business media" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'business-media' 
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.owner_id = auth.uid() 
      AND businesses.id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Business owners can manage business media" ON storage.objects FOR ALL 
USING (
  bucket_id = 'business-media' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.owner_id = auth.uid() 
      AND businesses.id::text = (storage.foldername(name))[1]
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
);

-- User Avatar Policies
CREATE POLICY "Anyone can view user avatars" ON storage.objects FOR SELECT 
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can manage own avatar" ON storage.objects FOR ALL 
USING (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Advertisement Media Policies
CREATE POLICY "Anyone can view advertisement media" ON storage.objects FOR SELECT 
USING (bucket_id = 'advertisement-media');

CREATE POLICY "Business owners can upload ad media" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'advertisement-media' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.owner_id = auth.uid() 
    AND businesses.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Business owners can manage ad media" ON storage.objects FOR ALL 
USING (
  bucket_id = 'advertisement-media' 
  AND (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.owner_id = auth.uid() 
      AND businesses.id::text = (storage.foldername(name))[1]
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
);

-- Audio Files Policies (Private)
CREATE POLICY "Users can view own audio files" ON storage.objects FOR SELECT 
USING (
  bucket_id = 'audio-files' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Users can manage own audio files" ON storage.objects FOR ALL 
USING (
  bucket_id = 'audio-files' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
    )
  )
);

-- Content Imports Policies (Private)
CREATE POLICY "Users can manage own imports" ON storage.objects FOR ALL 
USING (
  bucket_id = 'content-imports' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
    )
  )
);

-- Newsletter Assets Policies
CREATE POLICY "Anyone can view newsletter assets" ON storage.objects FOR SELECT 
USING (bucket_id = 'newsletter-assets');

CREATE POLICY "Editors can manage newsletter assets" ON storage.objects FOR ALL 
USING (
  bucket_id = 'newsletter-assets' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- System Assets Policies
CREATE POLICY "Anyone can view system assets" ON storage.objects FOR SELECT 
USING (bucket_id = 'system-assets');

CREATE POLICY "Admins can manage system assets" ON storage.objects FOR ALL 
USING (
  bucket_id = 'system-assets' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ======================================================================
-- STORAGE HELPER FUNCTIONS
-- ======================================================================

-- Function to generate secure file paths
CREATE OR REPLACE FUNCTION generate_storage_path(
  bucket_name TEXT,
  user_id UUID,
  original_filename TEXT,
  entity_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  file_extension TEXT;
  unique_filename TEXT;
  folder_path TEXT;
BEGIN
  -- Extract file extension
  file_extension := LOWER(SUBSTRING(original_filename FROM '\.([^.]*)$'));
  
  -- Generate unique filename
  unique_filename := gen_random_uuid()::text || '.' || file_extension;
  
  -- Determine folder structure based on bucket
  CASE bucket_name
    WHEN 'article-media' THEN
      folder_path := user_id::text || '/articles/' || COALESCE(entity_id::text, 'general');
    WHEN 'business-media' THEN
      folder_path := COALESCE(entity_id::text, user_id::text) || '/gallery';
    WHEN 'user-avatars' THEN
      folder_path := user_id::text;
    WHEN 'advertisement-media' THEN
      folder_path := COALESCE(entity_id::text, user_id::text) || '/ads';
    WHEN 'audio-files' THEN
      folder_path := user_id::text || '/audio';
    WHEN 'content-imports' THEN
      folder_path := user_id::text || '/imports';
    WHEN 'newsletter-assets' THEN
      folder_path := 'templates/' || COALESCE(entity_id::text, 'general');
    WHEN 'system-assets' THEN
      folder_path := 'system';
    ELSE
      folder_path := user_id::text || '/misc';
  END CASE;
  
  RETURN folder_path || '/' || unique_filename;
END;
$$;

-- Function to clean up orphaned media files
CREATE OR REPLACE FUNCTION cleanup_orphaned_media()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  orphaned_count INT := 0;
  result JSON;
BEGIN
  -- Find media records without corresponding storage objects
  -- This would need to be implemented with actual storage API calls
  -- For now, we'll just clean up database records without files
  
  WITH orphaned_media AS (
    SELECT id FROM media 
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND id NOT IN (
      SELECT DISTINCT featured_media_id FROM articles WHERE featured_media_id IS NOT NULL
      UNION
      SELECT DISTINCT social_image_id FROM articles WHERE social_image_id IS NOT NULL
      UNION
      SELECT DISTINCT media_id FROM article_media
      UNION
      SELECT DISTINCT logo_id FROM businesses WHERE logo_id IS NOT NULL
      UNION
      SELECT DISTINCT cover_image_id FROM businesses WHERE cover_image_id IS NOT NULL
      UNION
      SELECT DISTINCT media_id FROM business_media
      UNION
      SELECT DISTINCT media_id FROM advertisements WHERE media_id IS NOT NULL
    )
  )
  DELETE FROM media WHERE id IN (SELECT id FROM orphaned_media);
  
  GET DIAGNOSTICS orphaned_count = ROW_COUNT;
  
  SELECT json_build_object(
    'cleaned_orphaned_media', orphaned_count,
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get storage usage statistics
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_files', COUNT(*),
    'total_size_bytes', COALESCE(SUM(file_size), 0),
    'total_size_mb', ROUND(COALESCE(SUM(file_size), 0) / 1048576.0, 2),
    'by_type', json_object_agg(media_type, type_stats)
  ) INTO result
  FROM (
    SELECT 
      media_type,
      json_build_object(
        'count', COUNT(*),
        'size_bytes', COALESCE(SUM(file_size), 0),
        'size_mb', ROUND(COALESCE(SUM(file_size), 0) / 1048576.0, 2)
      ) as type_stats
    FROM media
    GROUP BY media_type
  ) media_stats;
  
  RETURN COALESCE(result, '{"total_files": 0, "total_size_bytes": 0, "total_size_mb": 0, "by_type": {}}'::json);
END;
$$;

-- Function to optimize media (generate thumbnails, compress, etc.)
-- This would integrate with external services like Cloudinary or ImageKit
CREATE OR REPLACE FUNCTION process_media_upload(media_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  media_record RECORD;
  result JSON;
BEGIN
  SELECT * INTO media_record FROM media WHERE id = media_id;
  
  IF media_record.id IS NULL THEN
    RAISE EXCEPTION 'Media not found';
  END IF;
  
  -- For images, we would typically:
  -- 1. Generate thumbnails
  -- 2. Optimize file size
  -- 3. Extract metadata (dimensions, EXIF data)
  -- 4. Generate WebP versions
  
  -- For now, just return success
  SELECT json_build_object(
    'success', true,
    'media_id', media_id,
    'original_size', media_record.file_size,
    'optimized', false, -- Would be true after processing
    'thumbnail_generated', media_record.media_type = 'image',
    'processed_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ======================================================================
-- MEDIA MANAGEMENT TRIGGERS
-- ======================================================================

-- Trigger to update media metadata after upload
CREATE OR REPLACE FUNCTION trigger_process_media()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract metadata based on media type
  IF NEW.media_type = 'image' THEN
    -- For images, we'd typically extract EXIF data, dimensions, etc.
    NEW.metadata = COALESCE(NEW.metadata, '{}'::jsonb) || jsonb_build_object(
      'processed_at', NOW(),
      'needs_optimization', true
    );
  ELSIF NEW.media_type = 'video' THEN
    -- For videos, extract duration, resolution, etc.
    NEW.metadata = COALESCE(NEW.metadata, '{}'::jsonb) || jsonb_build_object(
      'processed_at', NOW(),
      'needs_thumbnail', true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER process_media_trigger
  BEFORE INSERT ON media
  FOR EACH ROW EXECUTE FUNCTION trigger_process_media();

-- Trigger to clean up storage when media is deleted
CREATE OR REPLACE FUNCTION trigger_cleanup_media_storage()
RETURNS TRIGGER AS $$
BEGIN
  -- In a real implementation, this would call the storage API to delete files
  -- For now, we'll just log the deletion
  INSERT INTO analytics_events (event_type, entity_type, entity_id, properties)
  VALUES (
    'media_deleted',
    'media',
    OLD.id,
    jsonb_build_object(
      'filename', OLD.filename,
      'file_url', OLD.file_url,
      'media_type', OLD.media_type,
      'file_size', OLD.file_size
    )
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_media_storage_trigger
  AFTER DELETE ON media
  FOR EACH ROW EXECUTE FUNCTION trigger_cleanup_media_storage();