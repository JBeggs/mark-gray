-- Enhanced CMS Security Policies
-- Row Level Security for complete content management system

-- ======================================================================
-- ENABLE RLS ON ALL CMS TABLES
-- ======================================================================

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_block_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- ======================================================================
-- PAGES POLICIES
-- ======================================================================

-- Anyone can view published pages
CREATE POLICY "Anyone can view published pages" ON public.pages FOR SELECT 
USING (
  is_published = true OR
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'author')
  )
);

-- Editors and admins can manage all pages
CREATE POLICY "Editors can manage pages" ON public.pages FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Authors can create and manage their own pages
CREATE POLICY "Authors can manage own pages" ON public.pages FOR ALL 
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'author')
  )
);

-- ======================================================================
-- CONTENT BLOCKS POLICIES
-- ======================================================================

-- Content blocks follow page visibility
CREATE POLICY "Content blocks follow page visibility" ON public.content_blocks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pages p 
    WHERE p.id = page_id 
    AND (
      p.is_published = true OR
      p.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'author')
      )
    )
  )
);

-- Editors and page creators can manage content blocks
CREATE POLICY "Editors can manage content blocks" ON public.content_blocks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.pages p 
    WHERE p.id = page_id 
    AND (
      p.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pages p 
    WHERE p.id = page_id 
    AND (
      p.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
);

-- ======================================================================
-- GALLERIES POLICIES
-- ======================================================================

-- Anyone can view public galleries
CREATE POLICY "Anyone can view public galleries" ON public.galleries FOR SELECT 
USING (
  is_public = true OR
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Authenticated users can create galleries
CREATE POLICY "Authenticated users can create galleries" ON public.galleries FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'author')
  )
);

-- Users can manage their own galleries, editors can manage all
CREATE POLICY "Users can manage own galleries" ON public.galleries FOR UPDATE 
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Users can delete own galleries" ON public.galleries FOR DELETE 
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- GALLERY MEDIA POLICIES
-- ======================================================================

-- Gallery media follows gallery visibility
CREATE POLICY "Gallery media follows gallery visibility" ON public.gallery_media FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.galleries g 
    WHERE g.id = gallery_id 
    AND (
      g.is_public = true OR
      g.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
);

-- Gallery owners and editors can manage gallery media
CREATE POLICY "Gallery owners can manage gallery media" ON public.gallery_media FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.galleries g 
    WHERE g.id = gallery_id 
    AND (
      g.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.galleries g 
    WHERE g.id = gallery_id 
    AND (
      g.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
);

-- ======================================================================
-- CONTENT BLOCK MEDIA POLICIES
-- ======================================================================

-- Content block media follows content block access
CREATE POLICY "Content block media follows access" ON public.content_block_media FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.content_blocks cb
    JOIN public.pages p ON cb.page_id = p.id
    WHERE cb.id = content_block_id 
    AND (
      p.is_published = true OR
      p.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'author')
      )
    )
  )
);

-- Page creators and editors can manage content block media
CREATE POLICY "Page creators can manage content block media" ON public.content_block_media FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.content_blocks cb
    JOIN public.pages p ON cb.page_id = p.id
    WHERE cb.id = content_block_id 
    AND (
      p.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.content_blocks cb
    JOIN public.pages p ON cb.page_id = p.id
    WHERE cb.id = content_block_id 
    AND (
      p.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
);

-- ======================================================================
-- MENU POLICIES
-- ======================================================================

-- Anyone can view active menus (for navigation)
CREATE POLICY "Anyone can view active menus" ON public.menus FOR SELECT 
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Only admins and editors can manage menus
CREATE POLICY "Admins can manage menus" ON public.menus FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- MENU ITEMS POLICIES
-- ======================================================================

-- Anyone can view active menu items (for navigation)
CREATE POLICY "Anyone can view active menu items" ON public.menu_items FOR SELECT 
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Only admins and editors can manage menu items
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- CONTACT FORMS POLICIES
-- ======================================================================

-- Anyone can view active contact forms (to display them)
CREATE POLICY "Anyone can view active forms" ON public.contact_forms FOR SELECT 
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Only admins and editors can manage contact forms
CREATE POLICY "Admins can manage forms" ON public.contact_forms FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- FORM FIELDS POLICIES
-- ======================================================================

-- Anyone can view active form fields (to render forms)
CREATE POLICY "Anyone can view active form fields" ON public.form_fields FOR SELECT 
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Only admins and editors can manage form fields
CREATE POLICY "Admins can manage form fields" ON public.form_fields FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- FORM SUBMISSIONS POLICIES
-- ======================================================================

-- Only admins and editors can view form submissions
CREATE POLICY "Admins can view form submissions" ON public.form_submissions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Anyone can create form submissions (submit forms)
CREATE POLICY "Anyone can submit forms" ON public.form_submissions FOR INSERT 
WITH CHECK (true);

-- Only admins and editors can update/delete submissions
CREATE POLICY "Admins can manage submissions" ON public.form_submissions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins can delete submissions" ON public.form_submissions FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- TEAM MEMBERS POLICIES
-- ======================================================================

-- Anyone can view active team members
CREATE POLICY "Anyone can view active team members" ON public.team_members FOR SELECT 
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Only admins and editors can manage team members
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- TESTIMONIALS POLICIES
-- ======================================================================

-- Anyone can view active testimonials
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT 
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Only admins and editors can manage testimonials
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- FAQ POLICIES
-- ======================================================================

-- Anyone can view active FAQs
CREATE POLICY "Anyone can view active faqs" ON public.faqs FOR SELECT 
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Only admins and editors can manage FAQs
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- LOCATIONS POLICIES
-- ======================================================================

-- Anyone can view active locations
CREATE POLICY "Anyone can view active locations" ON public.locations FOR SELECT 
USING (
  is_active = true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Only admins and editors can manage locations
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- HELPER FUNCTIONS FOR CMS SECURITY
-- ======================================================================

-- Function to check if user can edit specific page
CREATE OR REPLACE FUNCTION can_edit_page(page_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_record RECORD;
  user_record RECORD;
BEGIN
  -- Get page info
  SELECT * INTO page_record FROM public.pages WHERE id = page_uuid;
  
  IF page_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user info
  SELECT * INTO user_record FROM public.profiles WHERE id = user_uuid;
  
  IF user_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Admins and editors can edit all pages
  IF user_record.role IN ('admin', 'editor') THEN
    RETURN TRUE;
  END IF;
  
  -- Page creators can edit their own pages
  IF page_record.created_by = user_uuid THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to check if user can manage content
CREATE OR REPLACE FUNCTION can_manage_content(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND role IN ('admin', 'editor', 'author')
  );
END;
$$;

-- Function to check if user can manage site settings
CREATE OR REPLACE FUNCTION can_manage_site_settings(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND role IN ('admin', 'editor')
  );
END;
$$;

-- Function to get user's content permissions
CREATE OR REPLACE FUNCTION get_user_content_permissions(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  permissions JSON;
BEGIN
  SELECT * INTO user_record FROM public.profiles WHERE id = user_uuid;
  
  IF user_record.id IS NULL THEN
    RETURN '{"pages": false, "media": false, "forms": false, "menus": false, "settings": false}'::json;
  END IF;
  
  SELECT json_build_object(
    'pages', user_record.role IN ('admin', 'editor', 'author'),
    'media', user_record.role IN ('admin', 'editor', 'author'),
    'forms', user_record.role IN ('admin', 'editor'),
    'menus', user_record.role IN ('admin', 'editor'),
    'settings', user_record.role IN ('admin', 'editor'),
    'team_members', user_record.role IN ('admin', 'editor'),
    'testimonials', user_record.role IN ('admin', 'editor'),
    'faqs', user_record.role IN ('admin', 'editor'),
    'locations', user_record.role IN ('admin', 'editor'),
    'galleries', user_record.role IN ('admin', 'editor', 'author')
  ) INTO permissions;
  
  RETURN permissions;
END;
$$;

-- ======================================================================
-- AUDIT LOGGING FOR CMS ACTIONS
-- ======================================================================

-- Function to log CMS actions
CREATE OR REPLACE FUNCTION log_cms_action(
  action_type TEXT,
  entity_type TEXT,
  entity_id UUID,
  user_uuid UUID,
  details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.analytics_events (
    event_type,
    entity_type,
    entity_id,
    user_id,
    properties
  ) VALUES (
    action_type,
    entity_type,
    entity_id,
    user_uuid,
    details || jsonb_build_object(
      'timestamp', NOW(),
      'source', 'cms'
    )
  );
END;
$$;

-- Trigger function to automatically log page changes
CREATE OR REPLACE FUNCTION trigger_log_page_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_cms_action('page_created', 'page', NEW.id, NEW.created_by, 
      jsonb_build_object('title', NEW.title, 'slug', NEW.slug, 'page_type', NEW.page_type));
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_cms_action('page_updated', 'page', NEW.id, NEW.updated_by,
      jsonb_build_object('title', NEW.title, 'slug', NEW.slug, 'changes', 
        jsonb_build_object(
          'published', CASE WHEN OLD.is_published != NEW.is_published THEN NEW.is_published END
        )
      ));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_cms_action('page_deleted', 'page', OLD.id, auth.uid(),
      jsonb_build_object('title', OLD.title, 'slug', OLD.slug));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER log_page_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.pages
FOR EACH ROW EXECUTE FUNCTION trigger_log_page_changes();

-- Trigger for content blocks
CREATE OR REPLACE FUNCTION trigger_log_content_block_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_cms_action('content_block_created', 'content_block', NEW.id, auth.uid(),
      jsonb_build_object('page_id', NEW.page_id, 'block_type', NEW.block_type));
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_cms_action('content_block_updated', 'content_block', NEW.id, auth.uid(),
      jsonb_build_object('page_id', NEW.page_id, 'block_type', NEW.block_type));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_cms_action('content_block_deleted', 'content_block', OLD.id, auth.uid(),
      jsonb_build_object('page_id', OLD.page_id, 'block_type', OLD.block_type));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_content_block_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.content_blocks
FOR EACH ROW EXECUTE FUNCTION trigger_log_content_block_changes();