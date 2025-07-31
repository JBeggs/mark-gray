-- Enhanced CMS Functions
-- Comprehensive functions for admin panel content management

-- ======================================================================
-- PAGE MANAGEMENT FUNCTIONS
-- ======================================================================

-- Get page with all content blocks and media
CREATE OR REPLACE FUNCTION get_page_with_content(page_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'page', to_jsonb(p.*),
    'content_blocks', COALESCE(blocks.blocks, '[]'::json),
    'featured_image', COALESCE(to_jsonb(fm.*), 'null'::json)
  ) INTO result
  FROM pages p
  LEFT JOIN media fm ON p.featured_image_id = fm.id
  LEFT JOIN (
    SELECT 
      cb.page_id,
      json_agg(
        json_build_object(
          'id', cb.id,
          'block_type', cb.block_type,
          'title', cb.title,
          'content', cb.content,
          'settings', cb.settings,
          'sort_order', cb.sort_order,
          'is_active', cb.is_active,
          'media', COALESCE(media_list.media, '[]'::json)
        ) ORDER BY cb.sort_order
      ) as blocks
    FROM content_blocks cb
    LEFT JOIN (
      SELECT 
        cbm.content_block_id,
        json_agg(
          json_build_object(
            'id', m.id,
            'filename', m.filename,
            'file_url', m.file_url,
            'thumbnail_url', m.thumbnail_url,
            'media_type', m.media_type,
            'caption', cbm.caption,
            'sort_order', cbm.sort_order,
            'is_featured', cbm.is_featured
          ) ORDER BY cbm.sort_order
        ) as media
      FROM content_block_media cbm
      JOIN media m ON cbm.media_id = m.id
      GROUP BY cbm.content_block_id
    ) media_list ON cb.id = media_list.content_block_id
    WHERE cb.is_active = true
    GROUP BY cb.page_id
  ) blocks ON p.id = blocks.page_id
  WHERE p.slug = page_slug AND p.is_published = true;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Create or update page with content blocks
CREATE OR REPLACE FUNCTION upsert_page_with_content(
  page_data JSON,
  content_blocks JSON DEFAULT '[]'::json
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_id UUID;
  block_data JSON;
  result JSON;
BEGIN
  -- Insert or update page
  IF page_data->>'id' IS NOT NULL AND page_data->>'id' != '' THEN
    -- Update existing page
    page_id := (page_data->>'id')::UUID;
    
    UPDATE pages SET
      title = page_data->>'title',
      slug = page_data->>'slug',
      page_type = (page_data->>'page_type')::page_type,
      meta_title = page_data->>'meta_title',
      meta_description = page_data->>'meta_description',
      meta_keywords = CASE WHEN page_data->'meta_keywords' IS NOT NULL 
                          THEN ARRAY(SELECT json_array_elements_text(page_data->'meta_keywords'))
                          ELSE NULL END,
      content = page_data->>'content',
      featured_image_id = CASE WHEN page_data->>'featured_image_id' != '' 
                              THEN (page_data->>'featured_image_id')::UUID 
                              ELSE NULL END,
      template_name = COALESCE(page_data->>'template_name', 'default'),
      is_published = COALESCE((page_data->>'is_published')::boolean, true),
      is_in_menu = COALESCE((page_data->>'is_in_menu')::boolean, false),
      menu_order = COALESCE((page_data->>'menu_order')::integer, 0),
      custom_css = page_data->>'custom_css',
      custom_js = page_data->>'custom_js',
      seo_schema = COALESCE(page_data->'seo_schema', '{}'::jsonb),
      updated_by = auth.uid(),
      updated_at = NOW()
    WHERE id = page_id;
  ELSE
    -- Insert new page
    INSERT INTO pages (
      title, slug, page_type, meta_title, meta_description, meta_keywords,
      content, featured_image_id, template_name, is_published, is_in_menu,
      menu_order, custom_css, custom_js, seo_schema, created_by, updated_by
    ) VALUES (
      page_data->>'title',
      page_data->>'slug',
      (page_data->>'page_type')::page_type,
      page_data->>'meta_title',
      page_data->>'meta_description',
      CASE WHEN page_data->'meta_keywords' IS NOT NULL 
           THEN ARRAY(SELECT json_array_elements_text(page_data->'meta_keywords'))
           ELSE NULL END,
      page_data->>'content',
      CASE WHEN page_data->>'featured_image_id' != '' 
           THEN (page_data->>'featured_image_id')::UUID 
           ELSE NULL END,
      COALESCE(page_data->>'template_name', 'default'),
      COALESCE((page_data->>'is_published')::boolean, true),
      COALESCE((page_data->>'is_in_menu')::boolean, false),
      COALESCE((page_data->>'menu_order')::integer, 0),
      page_data->>'custom_css',
      page_data->>'custom_js',
      COALESCE(page_data->'seo_schema', '{}'::jsonb),
      auth.uid(),
      auth.uid()
    ) RETURNING id INTO page_id;
  END IF;
  
  -- Handle content blocks if provided
  IF json_array_length(content_blocks) > 0 THEN
    -- Delete existing content blocks for this page
    DELETE FROM content_blocks WHERE page_id = page_id;
    
    -- Insert new content blocks
    FOR block_data IN SELECT * FROM json_array_elements(content_blocks)
    LOOP
      INSERT INTO content_blocks (
        page_id, block_type, title, content, settings, sort_order, is_active
      ) VALUES (
        page_id,
        (block_data->>'block_type')::content_block_type,
        block_data->>'title',
        block_data->>'content',
        COALESCE(block_data->'settings', '{}'::jsonb),
        COALESCE((block_data->>'sort_order')::integer, 0),
        COALESCE((block_data->>'is_active')::boolean, true)
      );
    END LOOP;
  END IF;
  
  -- Return the complete page data
  SELECT json_build_object(
    'success', true,
    'page_id', page_id,
    'message', 'Page saved successfully'
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ======================================================================
-- GALLERY MANAGEMENT FUNCTIONS
-- ======================================================================

-- Get gallery with all media
CREATE OR REPLACE FUNCTION get_gallery_with_media(gallery_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'gallery', to_jsonb(g.*),
    'media', COALESCE(media_list.media, '[]'::json)
  ) INTO result
  FROM galleries g
  LEFT JOIN (
    SELECT 
      gm.gallery_id,
      json_agg(
        json_build_object(
          'id', m.id,
          'filename', m.filename,
          'original_filename', m.original_filename,
          'file_url', m.file_url,
          'thumbnail_url', m.thumbnail_url,
          'media_type', m.media_type,
          'width', m.width,
          'height', m.height,
          'alt_text', m.alt_text,
          'caption', COALESCE(gm.caption, m.caption),
          'credits', m.credits,
          'sort_order', gm.sort_order,
          'is_featured', gm.is_featured
        ) ORDER BY gm.sort_order, gm.created_at
      ) as media
    FROM gallery_media gm
    JOIN media m ON gm.media_id = m.id
    GROUP BY gm.gallery_id
  ) media_list ON g.id = media_list.gallery_id
  WHERE g.slug = gallery_slug AND g.is_public = true;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Add media to gallery
CREATE OR REPLACE FUNCTION add_media_to_gallery(
  gallery_uuid UUID,
  media_ids UUID[],
  captions TEXT[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  media_id UUID;
  caption_text TEXT;
  i INTEGER := 1;
  max_order INTEGER;
  result JSON;
BEGIN
  -- Get current max sort order
  SELECT COALESCE(MAX(sort_order), 0) INTO max_order
  FROM gallery_media WHERE gallery_id = gallery_uuid;
  
  -- Add each media item
  FOREACH media_id IN ARRAY media_ids
  LOOP
    caption_text := CASE WHEN captions IS NOT NULL AND i <= array_length(captions, 1)
                        THEN captions[i]
                        ELSE NULL END;
    
    INSERT INTO gallery_media (gallery_id, media_id, caption, sort_order)
    VALUES (gallery_uuid, media_id, caption_text, max_order + i)
    ON CONFLICT (gallery_id, media_id) DO UPDATE SET
      caption = EXCLUDED.caption,
      sort_order = EXCLUDED.sort_order;
    
    i := i + 1;
  END LOOP;
  
  SELECT json_build_object(
    'success', true,
    'added_count', array_length(media_ids, 1),
    'message', 'Media added to gallery successfully'
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ======================================================================
-- MENU MANAGEMENT FUNCTIONS
-- ======================================================================

-- Get menu with all items in hierarchical structure
CREATE OR REPLACE FUNCTION get_menu_with_items(menu_location TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH RECURSIVE menu_tree AS (
    -- Base case: root menu items
    SELECT 
      mi.id,
      mi.menu_id,
      mi.parent_id,
      mi.title,
      mi.url,
      mi.page_id,
      mi.icon,
      mi.css_class,
      mi.target,
      mi.sort_order,
      mi.is_active,
      0 as level,
      ARRAY[mi.sort_order] as path
    FROM menu_items mi
    JOIN menus m ON mi.menu_id = m.id
    WHERE m.location = menu_location 
    AND mi.parent_id IS NULL
    AND mi.is_active = true
    AND m.is_active = true
    
    UNION ALL
    
    -- Recursive case: child menu items
    SELECT 
      mi.id,
      mi.menu_id,
      mi.parent_id,
      mi.title,
      mi.url,
      mi.page_id,
      mi.icon,
      mi.css_class,
      mi.target,
      mi.sort_order,
      mi.is_active,
      mt.level + 1,
      mt.path || mi.sort_order
    FROM menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
    WHERE mi.is_active = true
  )
  SELECT json_build_object(
    'menu', to_jsonb(m.*),
    'items', COALESCE(
      json_agg(
        json_build_object(
          'id', mt.id,
          'parent_id', mt.parent_id,
          'title', mt.title,
          'url', COALESCE(mt.url, '/pages/' || p.slug),
          'icon', mt.icon,
          'css_class', mt.css_class,
          'target', mt.target,
          'sort_order', mt.sort_order,
          'level', mt.level,
          'page', CASE WHEN p.id IS NOT NULL THEN 
            json_build_object('id', p.id, 'title', p.title, 'slug', p.slug)
            ELSE NULL END
        ) ORDER BY mt.path
      ), '[]'::json
    )
  ) INTO result
  FROM menus m
  LEFT JOIN menu_tree mt ON m.id = mt.menu_id
  LEFT JOIN pages p ON mt.page_id = p.id
  WHERE m.location = menu_location 
  AND m.is_active = true
  GROUP BY m.id, m.name, m.location, m.settings, m.is_active, m.created_at, m.updated_at;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- ======================================================================
-- CONTACT FORM FUNCTIONS
-- ======================================================================

-- Get contact form with fields
CREATE OR REPLACE FUNCTION get_contact_form_with_fields(form_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'form', to_jsonb(cf.*),
    'fields', COALESCE(
      json_agg(
        json_build_object(
          'id', ff.id,
          'field_type', ff.field_type,
          'name', ff.name,
          'label', ff.label,
          'placeholder', ff.placeholder,
          'help_text', ff.help_text,
          'is_required', ff.is_required,
          'validation_rules', ff.validation_rules,
          'options', ff.options,
          'sort_order', ff.sort_order
        ) ORDER BY ff.sort_order
      ), '[]'::json
    )
  ) INTO result
  FROM contact_forms cf
  LEFT JOIN form_fields ff ON cf.id = ff.form_id AND ff.is_active = true
  WHERE cf.name = form_name AND cf.is_active = true
  GROUP BY cf.id, cf.name, cf.title, cf.description, cf.success_message, 
           cf.email_recipients, cf.settings, cf.is_active, cf.created_at, cf.updated_at;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Submit contact form
CREATE OR REPLACE FUNCTION submit_contact_form(
  form_name TEXT,
  form_data JSON,
  user_ip INET DEFAULT NULL,
  user_agent_string TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  form_record RECORD;
  field_record RECORD;
  validation_errors TEXT[] := '{}';
  field_value TEXT;
  result JSON;
  submission_id UUID;
BEGIN
  -- Get form
  SELECT * INTO form_record FROM contact_forms WHERE name = form_name AND is_active = true;
  
  IF form_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Form not found');
  END IF;
  
  -- Validate required fields
  FOR field_record IN 
    SELECT * FROM form_fields 
    WHERE form_id = form_record.id AND is_active = true AND is_required = true
  LOOP
    field_value := form_data->>field_record.name;
    
    IF field_value IS NULL OR field_value = '' THEN
      validation_errors := validation_errors || (field_record.label || ' is required');
    END IF;
  END LOOP;
  
  -- Return validation errors if any
  IF array_length(validation_errors, 1) > 0 THEN
    RETURN json_build_object(
      'success', false, 
      'errors', array_to_json(validation_errors)
    );
  END IF;
  
  -- Insert form submission
  INSERT INTO form_submissions (form_id, data, ip_address, user_agent, user_id)
  VALUES (
    form_record.id,
    form_data::jsonb,
    user_ip,
    user_agent_string,
    auth.uid()
  ) RETURNING id INTO submission_id;
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'message', form_record.success_message,
    'submission_id', submission_id
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ======================================================================
-- CONTENT SEARCH FUNCTIONS
-- ======================================================================

-- Advanced search across all content types
CREATE OR REPLACE FUNCTION search_cms_content(
  search_query TEXT,
  content_types TEXT[] DEFAULT ARRAY['page', 'article', 'business'],
  limit_results INT DEFAULT 20,
  offset_results INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_count INT;
BEGIN
  -- Get total count for pagination
  WITH search_results AS (
    -- Pages
    SELECT 
      'page' as content_type,
      p.id,
      p.title,
      p.content as description,
      '/pages/' || p.slug as url,
      p.created_at,
      ts_rank(to_tsvector('english', p.title || ' ' || COALESCE(p.content, '')), plainto_tsquery('english', search_query)) as rank
    FROM pages p
    WHERE 'page' = ANY(content_types)
    AND p.is_published = true
    AND to_tsvector('english', p.title || ' ' || COALESCE(p.content, '')) @@ plainto_tsquery('english', search_query)
    
    UNION ALL
    
    -- Articles (if exists in schema)
    SELECT 
      'article' as content_type,
      a.id,
      a.title,
      a.excerpt as description,
      '/articles/' || a.slug as url,
      a.created_at,
      ts_rank(to_tsvector('english', a.title || ' ' || a.content), plainto_tsquery('english', search_query)) as rank
    FROM articles a
    WHERE 'article' = ANY(content_types)
    AND a.status = 'published'
    AND a.deleted_at IS NULL
    AND to_tsvector('english', a.title || ' ' || a.content) @@ plainto_tsquery('english', search_query)
    
    UNION ALL
    
    -- Businesses (if exists in schema)
    SELECT 
      'business' as content_type,
      b.id,
      b.name as title,
      b.description,
      '/businesses/' || COALESCE(b.slug, b.id::text) as url,
      b.created_at,
      ts_rank(to_tsvector('english', b.name || ' ' || COALESCE(b.description, '')), plainto_tsquery('english', search_query)) as rank
    FROM businesses b
    WHERE 'business' = ANY(content_types)
    AND to_tsvector('english', b.name || ' ' || COALESCE(b.description, '')) @@ plainto_tsquery('english', search_query)
  )
  SELECT COUNT(*) INTO total_count FROM search_results;
  
  -- Get paginated results
  WITH search_results AS (
    -- Same union query as above
    SELECT 
      'page' as content_type,
      p.id,
      p.title,
      LEFT(p.content, 200) as description,
      '/pages/' || p.slug as url,
      p.created_at,
      ts_rank(to_tsvector('english', p.title || ' ' || COALESCE(p.content, '')), plainto_tsquery('english', search_query)) as rank
    FROM pages p
    WHERE 'page' = ANY(content_types)
    AND p.is_published = true
    AND to_tsvector('english', p.title || ' ' || COALESCE(p.content, '')) @@ plainto_tsquery('english', search_query)
    
    UNION ALL
    
    SELECT 
      'article' as content_type,
      a.id,
      a.title,
      a.excerpt as description,
      '/articles/' || a.slug as url,
      a.created_at,
      ts_rank(to_tsvector('english', a.title || ' ' || a.content), plainto_tsquery('english', search_query)) as rank
    FROM articles a
    WHERE 'article' = ANY(content_types)
    AND a.status = 'published'
    AND a.deleted_at IS NULL
    AND to_tsvector('english', a.title || ' ' || a.content) @@ plainto_tsquery('english', search_query)
    
    UNION ALL
    
    SELECT 
      'business' as content_type,
      b.id,
      b.name as title,
      b.description,
      '/businesses/' || COALESCE(b.slug, b.id::text) as url,
      b.created_at,
      ts_rank(to_tsvector('english', b.name || ' ' || COALESCE(b.description, '')), plainto_tsquery('english', search_query)) as rank
    FROM businesses b
    WHERE 'business' = ANY(content_types)
    AND to_tsvector('english', b.name || ' ' || COALESCE(b.description, '')) @@ plainto_tsquery('english', search_query)
    
    ORDER BY rank DESC, created_at DESC
    LIMIT limit_results OFFSET offset_results
  )
  SELECT json_build_object(
    'results', json_agg(
      json_build_object(
        'type', content_type,
        'id', id,
        'title', title,
        'description', description,
        'url', url,
        'created_at', created_at,
        'relevance', rank
      )
    ),
    'total', total_count,
    'page', (offset_results / limit_results) + 1,
    'per_page', limit_results,
    'total_pages', CEIL(total_count::float / limit_results)
  ) INTO result
  FROM search_results;
  
  RETURN COALESCE(result, '{"results": [], "total": 0, "page": 1, "per_page": 20, "total_pages": 0}'::json);
END;
$$;

-- ======================================================================
-- ADMIN DASHBOARD FUNCTIONS
-- ======================================================================

-- Get CMS dashboard statistics
CREATE OR REPLACE FUNCTION get_cms_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
  SELECT json_build_object(
    -- Content stats
    'pages', json_build_object(
      'total', (SELECT COUNT(*) FROM pages),
      'published', (SELECT COUNT(*) FROM pages WHERE is_published = true),
      'drafts', (SELECT COUNT(*) FROM pages WHERE is_published = false),
      'this_month', (SELECT COUNT(*) FROM pages WHERE created_at >= current_month_start)
    ),
    
    -- Gallery stats
    'galleries', json_build_object(
      'total', (SELECT COUNT(*) FROM galleries),
      'public', (SELECT COUNT(*) FROM galleries WHERE is_public = true),
      'total_media', (SELECT COUNT(*) FROM gallery_media)
    ),
    
    -- Form stats
    'forms', json_build_object(
      'total', (SELECT COUNT(*) FROM contact_forms WHERE is_active = true),
      'submissions_total', (SELECT COUNT(*) FROM form_submissions),
      'submissions_unread', (SELECT COUNT(*) FROM form_submissions WHERE is_read = false),
      'submissions_this_month', (SELECT COUNT(*) FROM form_submissions WHERE created_at >= current_month_start)
    ),
    
    -- Menu stats
    'menus', json_build_object(
      'total', (SELECT COUNT(*) FROM menus WHERE is_active = true),
      'total_items', (SELECT COUNT(*) FROM menu_items WHERE is_active = true)
    ),
    
    -- Team stats
    'team', json_build_object(
      'total_members', (SELECT COUNT(*) FROM team_members WHERE is_active = true),
      'featured_members', (SELECT COUNT(*) FROM team_members WHERE is_featured = true)
    ),
    
    -- Content blocks stats
    'content_blocks', json_build_object(
      'total', (SELECT COUNT(*) FROM content_blocks WHERE is_active = true),
      'by_type', (
        SELECT json_object_agg(block_type, count)
        FROM (
          SELECT block_type, COUNT(*) as count
          FROM content_blocks
          WHERE is_active = true
          GROUP BY block_type
        ) block_counts
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Get recent CMS activity
CREATE OR REPLACE FUNCTION get_cms_recent_activity(activity_limit INT DEFAULT 15)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH recent_cms_activity AS (
    -- Recent pages
    SELECT 
      'page' as type,
      p.id,
      p.title,
      'created' as action,
      COALESCE(pr.full_name, pr.email) as user_name,
      p.created_at as timestamp,
      '/admin/pages/' || p.id as href
    FROM pages p
    LEFT JOIN profiles pr ON p.created_by = pr.id
    ORDER BY p.created_at DESC
    LIMIT activity_limit / 3
    
    UNION ALL
    
    -- Recent form submissions
    SELECT 
      'form_submission' as type,
      fs.id,
      'Form: ' || cf.name as title,
      'submitted' as action,
      COALESCE(pr.full_name, 'Anonymous') as user_name,
      fs.created_at as timestamp,
      '/admin/forms/' || cf.id || '/submissions' as href
    FROM form_submissions fs
    JOIN contact_forms cf ON fs.form_id = cf.id
    LEFT JOIN profiles pr ON fs.user_id = pr.id
    ORDER BY fs.created_at DESC
    LIMIT activity_limit / 3
    
    UNION ALL
    
    -- Recent galleries
    SELECT 
      'gallery' as type,
      g.id,
      'Gallery: ' || g.name as title,
      'created' as action,
      COALESCE(pr.full_name, pr.email) as user_name,
      g.created_at as timestamp,
      '/admin/galleries/' || g.id as href
    FROM galleries g
    LEFT JOIN profiles pr ON g.created_by = pr.id
    ORDER BY g.created_at DESC
    LIMIT activity_limit / 3
    
    ORDER BY timestamp DESC
    LIMIT activity_limit
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'type', type,
      'title', title,
      'action', action,
      'user', user_name,
      'timestamp', timestamp,
      'href', href
    )
  ) INTO result
  FROM recent_cms_activity;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ======================================================================
-- MAINTENANCE AND CLEANUP FUNCTIONS
-- ======================================================================

-- Clean up unused media files
CREATE OR REPLACE FUNCTION cleanup_unused_cms_media()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_count INT := 0;
  result JSON;
BEGIN
  WITH unused_media AS (
    SELECT m.id FROM media m
    WHERE m.created_at < NOW() - INTERVAL '30 days'
    AND m.id NOT IN (
      -- Featured images in pages
      SELECT featured_image_id FROM pages WHERE featured_image_id IS NOT NULL
      UNION ALL
      -- Media in galleries
      SELECT media_id FROM gallery_media
      UNION ALL
      -- Media in content blocks
      SELECT media_id FROM content_block_media
      UNION ALL
      -- Team member images
      SELECT image_id FROM team_members WHERE image_id IS NOT NULL
      UNION ALL
      -- Testimonial images
      SELECT image_id FROM testimonials WHERE image_id IS NOT NULL
      UNION ALL
      -- Article featured images (if exists)
      SELECT featured_media_id FROM articles WHERE featured_media_id IS NOT NULL
      UNION ALL
      -- Business logos and cover images (if exists)
      SELECT logo_id FROM businesses WHERE logo_id IS NOT NULL
      UNION ALL
      SELECT cover_image_id FROM businesses WHERE cover_image_id IS NOT NULL
    )
  )
  DELETE FROM media WHERE id IN (SELECT id FROM unused_media);
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  SELECT json_build_object(
    'cleaned_media_files', cleaned_count,
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Optimize content performance
CREATE OR REPLACE FUNCTION optimize_cms_content()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Update page view counts and other metrics
  -- This would integrate with analytics data
  
  -- Clean up old form submissions (older than 1 year)
  DELETE FROM form_submissions 
  WHERE created_at < NOW() - INTERVAL '1 year'
  AND is_read = true;
  
  -- Update gallery media counts
  -- Update team member counts
  -- etc.
  
  SELECT json_build_object(
    'success', true,
    'message', 'CMS content optimization completed',
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;