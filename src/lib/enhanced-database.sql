-- Enhanced Database Schema for Modern News Business
-- Uses latest PostgreSQL features and best practices

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'editor', 'author', 'subscriber', 'premium_subscriber');
CREATE TYPE article_status AS ENUM ('draft', 'scheduled', 'published', 'archived', 'featured');
CREATE TYPE ad_status AS ENUM ('active', 'paused', 'expired', 'pending_approval');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'trial', 'past_due');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('breaking_news', 'new_article', 'comment_reply', 'subscription_reminder');
CREATE TYPE content_type AS ENUM ('article', 'gallery', 'video', 'podcast', 'live_blog');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'document', 'embed');

-- Enhanced Users/Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  social_links JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Author profiles (extended info for content creators)
CREATE TABLE public.author_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  title TEXT, -- "Senior Reporter", "Sports Editor", etc.
  expertise_areas TEXT[], -- ["politics", "sports", "local-news"]
  bio_long TEXT,
  contact_email TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_instagram TEXT,
  profile_image_url TEXT,
  byline_image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '[]', -- ["unlimited_articles", "ad_free", "newsletter"]
  max_articles_per_month INTEGER, -- NULL for unlimited
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status subscription_status DEFAULT 'trial',
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  articles_read_this_month INTEGER DEFAULT 0,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced categories with hierarchy support
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT, -- Icon name for UI
  parent_id UUID REFERENCES public.categories(id), -- For subcategories
  seo_title TEXT,
  seo_description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  article_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags for flexible content organization
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media/Gallery system
CREATE TABLE public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type media_type NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  width INTEGER, -- for images/videos
  height INTEGER, -- for images/videos
  duration INTEGER, -- for audio/video in seconds
  alt_text TEXT,
  caption TEXT,
  credits TEXT, -- Photo credit, source
  metadata JSONB DEFAULT '{}', -- EXIF data, etc.
  uploaded_by UUID REFERENCES public.profiles(id),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Articles table
CREATE TABLE public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  content_type content_type DEFAULT 'article',
  featured_media_id UUID REFERENCES public.media(id),
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  co_authors UUID[], -- Additional authors
  category_id UUID REFERENCES public.categories(id),
  status article_status DEFAULT 'draft',
  is_premium BOOLEAN DEFAULT FALSE, -- Requires subscription
  is_breaking_news BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  
  -- SEO & Social
  seo_title TEXT,
  seo_description TEXT,
  social_image_id UUID REFERENCES public.media(id),
  
  -- Analytics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  read_time_minutes INTEGER,
  
  -- Scheduling
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  -- Geo-tagging
  location_name TEXT,
  location_coords POINT,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES public.articles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft deletes
);

-- Article-Tag many-to-many relationship
CREATE TABLE public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

-- Article gallery (multiple images per article)
CREATE TABLE public.article_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  caption_override TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Businesses table
CREATE TABLE public.businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  long_description TEXT,
  industry TEXT,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  coordinates POINT,
  logo_id UUID REFERENCES public.media(id),
  cover_image_id UUID REFERENCES public.media(id),
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  -- Business details
  business_hours JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  services TEXT[],
  
  -- Verification & ratings
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business gallery
CREATE TABLE public.business_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  caption_override TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business reviews
CREATE TABLE public.business_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, user_id) -- One review per user per business
);

-- Enhanced Advertisements
CREATE TABLE public.advertisements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_id UUID REFERENCES public.media(id),
  link_url TEXT,
  
  -- Placement & targeting
  position TEXT NOT NULL, -- 'header', 'sidebar', 'content', 'footer', 'inline'
  target_categories UUID[], -- Category IDs to target
  target_tags UUID[], -- Tag IDs to target
  
  -- Budget & billing
  budget_total DECIMAL(10,2),
  budget_daily DECIMAL(10,2),
  cost_per_click DECIMAL(6,4),
  cost_per_impression DECIMAL(6,4),
  
  -- Performance
  status ad_status DEFAULT 'pending_approval',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments system
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.comments(id), -- For nested comments
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}', -- Which newsletters they want
  verification_token TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  source TEXT, -- How they subscribed: "website", "article", "popup"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter campaigns
CREATE TABLE public.newsletter_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  recipients_count INTEGER DEFAULT 0,
  opens_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notifications
CREATE TABLE public.push_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id), -- NULL for broadcast
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type notification_type DEFAULT 'new_article',
  data JSONB DEFAULT '{}', -- Additional data like article_id
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reading history and analytics
CREATE TABLE public.user_article_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'share', 'complete_read'
  reading_progress DECIMAL(3,2) DEFAULT 0, -- 0.0 to 1.0
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id, interaction_type)
);

-- SEO redirects
CREATE TABLE public.redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings/configuration
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics tracking
CREATE TABLE public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'share', etc.
  entity_type TEXT, -- 'article', 'business', 'ad'
  entity_id UUID,
  user_id UUID REFERENCES public.profiles(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);

CREATE INDEX idx_articles_status_published ON public.articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_author ON public.articles(author_id, created_at DESC);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_premium ON public.articles(is_premium) WHERE is_premium = true;
CREATE INDEX idx_articles_breaking ON public.articles(is_breaking_news) WHERE is_breaking_news = true;
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_scheduled ON public.articles(scheduled_for) WHERE scheduled_for IS NOT NULL;

CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_businesses_location ON public.businesses USING GIST(coordinates);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);

CREATE INDEX idx_media_type ON public.media(media_type);
CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);

CREATE INDEX idx_comments_article ON public.comments(article_id, created_at DESC);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_approved ON public.comments(is_approved) WHERE is_approved = true;

CREATE INDEX idx_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.user_subscriptions(status);

CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_entity ON public.analytics_events(entity_type, entity_id);

-- Full-text search indexes
CREATE INDEX idx_articles_search ON public.articles USING GIN(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_businesses_search ON public.businesses USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, max_articles_per_month) VALUES
('Free', 'Basic access to local news', 0, 0, '["5_articles_per_month", "email_newsletter"]', 5),
('Premium', 'Full access to all content', 9.99, 99.99, '["unlimited_articles", "ad_free", "premium_newsletter", "early_access"]', NULL),
('Supporter', 'Support local journalism', 19.99, 199.99, '["unlimited_articles", "ad_free", "premium_newsletter", "early_access", "exclusive_events"]', NULL);

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', '"The Riverside Herald"', 'Main site name'),
('site_tagline', '"Your Local News Source"', 'Site tagline/description'),
('contact_email', '"editor@riversideherald.com"', 'Main contact email'),
('social_links', '{"twitter": "", "facebook": "", "instagram": ""}', 'Social media links'),
('analytics_enabled', 'true', 'Enable analytics tracking'),
('comments_enabled', 'true', 'Enable comments on articles'),
('newsletter_enabled', 'true', 'Enable newsletter functionality'),
('paywall_enabled', 'true', 'Enable subscription paywall');