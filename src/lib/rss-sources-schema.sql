-- RSS Sources and Feed Management Schema
-- Add this to your existing database schema

-- RSS Source types
DO $$ BEGIN
    CREATE TYPE rss_source_status AS ENUM ('active', 'inactive', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RSS Sources table
CREATE TABLE IF NOT EXISTS public.rss_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    feed_url TEXT NOT NULL UNIQUE,
    website_url TEXT,
    category_id UUID REFERENCES public.categories(id),
    status rss_source_status DEFAULT 'active',
    fetch_frequency_hours INTEGER DEFAULT 2, -- How often to fetch (in hours)
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    last_successful_fetch_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    total_articles_imported INTEGER DEFAULT 0,
    
    -- Content processing settings
    auto_publish BOOLEAN DEFAULT false, -- Auto-publish or keep as draft
    default_author_id UUID REFERENCES public.profiles(id),
    content_language VARCHAR(10) DEFAULT 'en',
    
    -- Feed metadata
    feed_title TEXT,
    feed_description TEXT,
    feed_language VARCHAR(10),
    feed_copyright TEXT,
    feed_image_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- RSS Articles tracking (to prevent duplicates)
CREATE TABLE IF NOT EXISTS public.rss_article_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rss_source_id UUID REFERENCES public.rss_sources(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    original_guid TEXT, -- RSS item GUID
    original_link TEXT, -- RSS item link
    original_pub_date TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(rss_source_id, original_guid),
    UNIQUE(rss_source_id, original_link)
);

-- RSS fetch logs
CREATE TABLE IF NOT EXISTS public.rss_fetch_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rss_source_id UUID REFERENCES public.rss_sources(id) ON DELETE CASCADE,
    fetch_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fetch_completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20), -- 'success', 'error', 'partial'
    items_found INTEGER DEFAULT 0,
    items_new INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    error_message TEXT,
    fetch_duration_ms INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rss_sources_status ON public.rss_sources(status);
CREATE INDEX IF NOT EXISTS idx_rss_sources_category ON public.rss_sources(category_id);
CREATE INDEX IF NOT EXISTS idx_rss_sources_last_fetched ON public.rss_sources(last_fetched_at);
CREATE INDEX IF NOT EXISTS idx_rss_article_tracking_source ON public.rss_article_tracking(rss_source_id);
CREATE INDEX IF NOT EXISTS idx_rss_article_tracking_guid ON public.rss_article_tracking(original_guid);
CREATE INDEX IF NOT EXISTS idx_rss_fetch_logs_source ON public.rss_fetch_logs(rss_source_id);
CREATE INDEX IF NOT EXISTS idx_rss_fetch_logs_date ON public.rss_fetch_logs(fetch_started_at);

-- RLS Policies
ALTER TABLE public.rss_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_article_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_fetch_logs ENABLE ROW LEVEL SECURITY;

-- Admin and editor can manage RSS sources
CREATE POLICY "Admins can manage RSS sources" ON public.rss_sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Anyone can view active RSS sources
CREATE POLICY "Anyone can view active RSS sources" ON public.rss_sources
    FOR SELECT USING (status = 'active');

-- Tracking and logs are admin/editor only
CREATE POLICY "Admins can manage RSS tracking" ON public.rss_article_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can view RSS logs" ON public.rss_fetch_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Functions for RSS management
CREATE OR REPLACE FUNCTION public.get_due_rss_sources()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    feed_url TEXT,
    fetch_frequency_hours INTEGER,
    last_fetched_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.name,
        rs.feed_url,
        rs.fetch_frequency_hours,
        rs.last_fetched_at
    FROM public.rss_sources rs
    WHERE rs.status = 'active'
    AND (
        rs.last_fetched_at IS NULL 
        OR rs.last_fetched_at < NOW() - INTERVAL '1 hour' * rs.fetch_frequency_hours
    )
    ORDER BY rs.last_fetched_at ASC NULLS FIRST;
END;
$$;

-- RSS sources will be dynamically created based on your categories
-- Use: npm run rss-setup to automatically create RSS feeds for your categories
-- Or manually insert RSS sources that match your specific categories

-- Example manual insertion (adjust category_id to match your categories):
/*
INSERT INTO public.rss_sources (
    name, description, feed_url, website_url, 
    category_id, status, auto_publish, 
    content_language, fetch_frequency_hours,
    category_keywords, use_auto_categorization
) VALUES (
    'Your RSS Source Name',
    'Description of the RSS source',
    'https://example.com/rss.xml',
    'https://example.com',
    (SELECT id FROM public.categories WHERE name = 'Your Category' LIMIT 1),
    'active'::rss_source_status,
    false, -- Keep as drafts initially
    'en',
    2, -- Fetch every 2 hours
    ARRAY['keyword1', 'keyword2'], -- Optional keywords for categorization
    true -- Enable auto-categorization
) ON CONFLICT (feed_url) DO NOTHING;
*/

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_rss_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rss_sources_updated_at
    BEFORE UPDATE ON public.rss_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rss_sources_updated_at();