-- Enhanced CMS Database Schema - FIXED DEPENDENCIES
-- Complete content management system with editable everything

-- ======================================================================
-- FIRST: EXTEND EXISTING ENUMS AND ADD NEW COLUMNS TO EXISTING TABLES
-- ======================================================================

-- Extend user_role enum to support new roles
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'author';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'subscriber';  
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'premium_subscriber';

-- Extend article_status enum for enhanced statuses
ALTER TYPE article_status ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE article_status ADD VALUE IF NOT EXISTS 'featured';

-- Extend ad_status enum for enhanced statuses  
ALTER TYPE ad_status ADD VALUE IF NOT EXISTS 'pending_approval';

-- Enhance profiles table with new CMS fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Enhance articles table with new CMS fields
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'article',
ADD COLUMN IF NOT EXISTS featured_media_id UUID,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_breaking_news BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_coords POINT,
ADD COLUMN IF NOT EXISTS read_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Enhance businesses table with new CMS fields
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS long_description TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS coordinates POINT,
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS logo_id UUID,
ADD COLUMN IF NOT EXISTS cover_image_id UUID;

-- ======================================================================
-- MEDIA SYSTEM (CREATED FIRST - NO DEPENDENCIES)
-- ======================================================================

-- Media files table
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  mime_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  credits TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES public.profiles(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- GALLERY SYSTEM
-- ======================================================================

-- Galleries for organizing media
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  is_public BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery media relationships
CREATE TABLE IF NOT EXISTS public.gallery_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID REFERENCES public.galleries(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- FLEXIBLE PAGE MANAGEMENT SYSTEM
-- ======================================================================

-- Page types for different content structures
DO $$ BEGIN
    CREATE TYPE page_type AS ENUM ('static', 'home', 'about', 'contact', 'privacy', 'terms', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_block_type AS ENUM ('text', 'image', 'gallery', 'video', 'form', 'map', 'team', 'testimonials', 'faq', 'html');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE form_field_type AS ENUM ('text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'file', 'date');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Main pages table - every page is editable
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  page_type page_type DEFAULT 'custom',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  content TEXT, -- Rich text content
  featured_image_id UUID REFERENCES public.media(id),
  template_name TEXT DEFAULT 'default', -- Template to use for rendering
  is_published BOOLEAN DEFAULT true,
  is_in_menu BOOLEAN DEFAULT false,
  menu_order INTEGER DEFAULT 0,
  parent_page_id UUID REFERENCES public.pages(id), -- For page hierarchy
  custom_css TEXT,
  custom_js TEXT,
  seo_schema JSONB DEFAULT '{}', -- JSON-LD schema
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content blocks system - flexible content areas
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type content_block_type NOT NULL,
  title TEXT,
  content TEXT, -- Rich text, HTML, or JSON data
  settings JSONB DEFAULT '{}', -- Block-specific settings
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content block media relationships (for galleries in content blocks)
CREATE TABLE IF NOT EXISTS public.content_block_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_block_id UUID REFERENCES public.content_blocks(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- NAVIGATION MENU SYSTEM
-- ======================================================================

-- Editable navigation menus
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL, -- 'header', 'footer', sidebar', 'mobile'
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items with flexible structure
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.menu_items(id), -- For dropdown menus
  title TEXT NOT NULL,
  url TEXT,
  page_id UUID REFERENCES public.pages(id), -- Link to internal page
  icon TEXT, -- Icon class name
  css_class TEXT,
  target TEXT DEFAULT '_self', -- '_blank', '_self', etc.
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- CONTACT FORMS SYSTEM
-- ======================================================================

-- Editable contact forms
CREATE TABLE IF NOT EXISTS public.contact_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  success_message TEXT DEFAULT 'Thank you for your message. We will get back to you soon.',
  email_recipients TEXT[], -- Where to send form submissions
  settings JSONB DEFAULT '{}', -- Form styling, validation rules
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form fields configuration
CREATE TABLE IF NOT EXISTS public.form_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public.contact_forms(id) ON DELETE CASCADE,
  field_type form_field_type NOT NULL,
  name TEXT NOT NULL, -- Field name/ID
  label TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,
  is_required BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}', -- Min length, max length, regex, etc.
  options JSONB DEFAULT '[]', -- For select, radio, checkbox fields
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form submissions storage
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public.contact_forms(id),
  data JSONB NOT NULL, -- Form field data
  ip_address INET,
  user_agent TEXT,
  user_id UUID REFERENCES public.profiles(id), -- If user was logged in
  is_read BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- TEAM MEMBERS SYSTEM
-- ======================================================================

-- Team members for About Us page
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  image_id UUID REFERENCES public.media(id),
  social_links JSONB DEFAULT '{}',
  department TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- TESTIMONIALS SYSTEM
-- ======================================================================

-- Customer testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT, -- Job title or company
  content TEXT NOT NULL,
  image_id UUID REFERENCES public.media(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- FAQ SYSTEM
-- ======================================================================

-- Frequently Asked Questions
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- LOCATION MANAGEMENT
-- ======================================================================

-- Office locations for contact page
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  coordinates POINT,
  phone TEXT,
  email TEXT,
  hours JSONB DEFAULT '{}', -- Business hours
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================================================
-- ENHANCED SITE SETTINGS
-- ======================================================================

-- Site settings table for global configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing tables that might be referenced
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,  
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.article_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extended site settings for complete customization
INSERT INTO public.site_settings (key, value, description) VALUES
-- Basic Site Info
('site_name', '"The Riverside Herald"', 'Main site name'),
('site_tagline', '"Your Local News Source"', 'Site tagline/description'),
('site_description', '"Local news, business directory, and community updates"', 'Site meta description'),
('site_keywords', '["local news", "community", "business directory"]', 'SEO keywords'),
('site_logo_id', 'null', 'Site logo media ID'),
('site_favicon_id', 'null', 'Site favicon media ID'),

-- Contact Information
('contact_email', '"editor@riversideherald.com"', 'Main contact email'),
('contact_phone', '"+1 (555) 123-4567"', 'Main contact phone'),
('contact_address', '"123 Main Street, Riverside, CA 12345"', 'Main office address'),

-- Social Media Links
('social_facebook', '""', 'Facebook page URL'),
('social_twitter', '""', 'Twitter profile URL'),
('social_instagram', '""', 'Instagram profile URL'),
('social_linkedin', '""', 'LinkedIn profile URL'),
('social_youtube', '""', 'YouTube channel URL'),

-- Homepage Customization
('homepage_hero_title', '"Stay Informed with Local News"', 'Hero section title'),
('homepage_hero_subtitle', '"Your trusted source for community news and updates"', 'Hero section subtitle'),
('homepage_hero_image_id', 'null', 'Hero section background image'),
('homepage_featured_categories', '[]', 'Featured category IDs for homepage'),

-- Email Settings
('smtp_host', '""', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_username', '""', 'SMTP username'),
('from_email', '"noreply@riversideherald.com"', 'Default from email'),
('from_name', '"The Riverside Herald"', 'Default from name'),

-- Analytics and Tracking
('google_analytics_id', '""', 'Google Analytics tracking ID'),
('facebook_pixel_id', '""', 'Facebook Pixel ID'),
('google_tag_manager_id', '""', 'Google Tag Manager ID'),

-- Feature Toggles
('enable_comments', 'true', 'Enable comments on articles'),
('enable_newsletter', 'true', 'Enable newsletter functionality'),
('enable_business_directory', 'true', 'Enable business directory'),
('enable_subscriptions', 'true', 'Enable paid subscriptions'),
('enable_user_registration', 'true', 'Allow new user registration'),

-- Content Settings
('articles_per_page', '12', 'Number of articles per page'),
('excerpt_length', '150', 'Article excerpt length in characters'),
('enable_article_galleries', 'true', 'Enable image galleries in articles'),
('auto_publish_comments', 'false', 'Auto-publish comments without moderation'),

-- Subscription Settings
('free_article_limit', '5', 'Free articles per month for non-subscribers'),
('trial_period_days', '7', 'Free trial period in days'),
('subscription_currency', '"USD"', 'Subscription currency'),

-- Footer Content
('footer_about', '"The Riverside Herald is your trusted source for local news, community updates, and business directory services."', 'Footer about text'),
('footer_copyright', '"© 2024 The Riverside Herald. All rights reserved."', 'Footer copyright text'),

-- Custom CSS/JS
('custom_css', '""', 'Custom CSS code'),
('custom_js', '""', 'Custom JavaScript code'),
('custom_head_html', '""', 'Custom HTML for head section');

-- ======================================================================
-- DEFAULT PAGES SETUP
-- ======================================================================

-- Insert default pages that every site needs
INSERT INTO public.pages (title, slug, page_type, content, is_published, is_in_menu, menu_order) VALUES
('Home', 'home', 'home', '<h1>Welcome to The Riverside Herald</h1><p>Your trusted source for local news and community updates.</p>', true, true, 1),
('About Us', 'about', 'about', '<h1>About The Riverside Herald</h1><p>Learn more about our mission and team.</p>', true, true, 2),
('Contact Us', 'contact', 'contact', '<h1>Contact Us</h1><p>Get in touch with our editorial team.</p>', true, true, 3),
('Privacy Policy', 'privacy-policy', 'privacy', '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>', true, false, 0),
('Terms of Service', 'terms-of-service', 'terms', '<h1>Terms of Service</h1><p>Terms and conditions for using our website.</p>', true, false, 0);

-- ======================================================================
-- DEFAULT NAVIGATION MENUS
-- ======================================================================

-- Insert default menus
INSERT INTO public.menus (name, location, is_active) VALUES
('Header Menu', 'header', true),
('Footer Menu', 'footer', true),
('Mobile Menu', 'mobile', true);

-- Get menu IDs for menu items
-- (In real implementation, you'd use the actual UUIDs from the insert above)

-- ======================================================================
-- DEFAULT CONTACT FORM
-- ======================================================================

-- Insert default contact form
INSERT INTO public.contact_forms (name, title, description, email_recipients) VALUES
('General Contact', 'Contact Us', 'Send us a message and we''ll get back to you as soon as possible.', ARRAY['editor@riversideherald.com']);

-- Get the contact form ID for fields
-- (In real implementation, you'd use the actual UUID from the insert above)

-- ======================================================================
-- ENHANCED INDEXES FOR PERFORMANCE
-- ======================================================================

-- Page system indexes
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_type_published ON public.pages(page_type, is_published);
CREATE INDEX idx_pages_menu ON public.pages(is_in_menu, menu_order);
CREATE INDEX idx_pages_parent ON public.pages(parent_page_id);

-- Content blocks indexes
CREATE INDEX idx_content_blocks_page ON public.content_blocks(page_id, sort_order);
CREATE INDEX idx_content_blocks_type ON public.content_blocks(block_type);

-- Gallery indexes
CREATE INDEX idx_galleries_slug ON public.galleries(slug);
CREATE INDEX idx_galleries_public ON public.galleries(is_public);
CREATE INDEX idx_gallery_media_gallery ON public.gallery_media(gallery_id, sort_order);

-- Menu indexes
CREATE INDEX idx_menus_location ON public.menus(location, is_active);
CREATE INDEX idx_menu_items_menu ON public.menu_items(menu_id, sort_order);
CREATE INDEX idx_menu_items_parent ON public.menu_items(parent_id);

-- Form indexes
CREATE INDEX idx_form_submissions_form ON public.form_submissions(form_id, created_at DESC);
CREATE INDEX idx_form_submissions_read ON public.form_submissions(is_read);

-- Team members indexes
CREATE INDEX idx_team_members_active ON public.team_members(is_active, sort_order);
CREATE INDEX idx_team_members_featured ON public.team_members(is_featured);

-- FAQ indexes
CREATE INDEX idx_faqs_category ON public.faqs(category, sort_order);
CREATE INDEX idx_faqs_active ON public.faqs(is_active);

-- Location indexes
CREATE INDEX idx_locations_active ON public.locations(is_active);
CREATE INDEX idx_locations_primary ON public.locations(is_primary);

-- ======================================================================
-- FULL-TEXT SEARCH INDEXES
-- ======================================================================

-- Search indexes for content discovery
CREATE INDEX idx_pages_search ON public.pages USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '')));
CREATE INDEX idx_content_blocks_search ON public.content_blocks USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')));
CREATE INDEX idx_faqs_search ON public.faqs USING GIN(to_tsvector('english', question || ' ' || answer));
CREATE INDEX idx_team_members_search ON public.team_members USING GIN(to_tsvector('english', name || ' ' || COALESCE(bio, '')));

-- ======================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ======================================================================

-- Update timestamps for pages
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON public.content_blocks FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON public.galleries FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_contact_forms_updated_at BEFORE UPDATE ON public.contact_forms FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();