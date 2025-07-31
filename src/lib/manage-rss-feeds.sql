-- RSS Feed Management Queries
-- Use these to manage your RSS feeds directly in the database

-- ================================================================
-- VIEW ALL RSS SOURCES
-- ================================================================
SELECT 
    rs.id,
    rs.name,
    rs.feed_url,
    rs.status,
    rs.fetch_frequency_hours,
    rs.auto_publish,
    rs.total_articles_imported,
    rs.last_fetched_at,
    rs.last_successful_fetch_at,
    c.name as category_name,
    p.full_name as default_author_name
FROM public.rss_sources rs
LEFT JOIN public.categories c ON rs.category_id = c.id
LEFT JOIN public.profiles p ON rs.default_author_id = p.id
ORDER BY rs.name;

-- ================================================================
-- ADD NEW RSS FEEDS
-- ================================================================

-- Example: Add CNN Technology feed
INSERT INTO public.rss_sources (
    name, 
    description, 
    feed_url, 
    website_url, 
    category_id, 
    status, 
    fetch_frequency_hours, 
    auto_publish,
    content_language
) VALUES (
    'CNN Technology',
    'CNN Technology News RSS Feed',
    'http://rss.cnn.com/rss/edition_technology.rss',
    'https://www.cnn.com/business/tech',
    (SELECT id FROM public.categories WHERE name = 'Technology' LIMIT 1),
    'active',
    2, -- Fetch every 2 hours
    false, -- Keep as drafts initially
    'en'
);

-- Example: Add local news feed (replace with your local news source)
INSERT INTO public.rss_sources (
    name, 
    description, 
    feed_url, 
    website_url, 
    category_id, 
    status, 
    fetch_frequency_hours, 
    auto_publish,
    content_language
) VALUES (
    'Local News Station',
    'Local news RSS feed',
    'https://yourlocalnews.com/rss.xml', -- Replace with actual URL
    'https://yourlocalnews.com',
    (SELECT id FROM public.categories WHERE name = 'Local' LIMIT 1),
    'active',
    1, -- Fetch every hour for local news
    true, -- Auto-publish local news
    'en'
);

-- ================================================================
-- ENABLE/DISABLE RSS SOURCES
-- ================================================================

-- Disable a specific source
UPDATE public.rss_sources 
SET status = 'inactive' 
WHERE name = 'TechCrunch';

-- Enable a specific source
UPDATE public.rss_sources 
SET status = 'active' 
WHERE name = 'TechCrunch';

-- Disable all sources temporarily
UPDATE public.rss_sources 
SET status = 'inactive';

-- Enable all sources
UPDATE public.rss_sources 
SET status = 'active';

-- ================================================================
-- MODIFY RSS FEED SETTINGS
-- ================================================================

-- Change fetch frequency (make BBC Business fetch every hour)
UPDATE public.rss_sources 
SET fetch_frequency_hours = 1 
WHERE name = 'BBC Business';

-- Enable auto-publishing for all Business feeds
UPDATE public.rss_sources 
SET auto_publish = true 
WHERE category_id = (SELECT id FROM public.categories WHERE name = 'Business');

-- Change default author for all RSS articles
UPDATE public.rss_sources 
SET default_author_id = (
    SELECT id FROM public.profiles 
    WHERE role = 'editor' 
    LIMIT 1
);

-- ================================================================
-- CATEGORY-BASED MANAGEMENT
-- ================================================================

-- See all feeds by category
SELECT 
    c.name as category,
    COUNT(rs.id) as feed_count,
    COUNT(CASE WHEN rs.status = 'active' THEN 1 END) as active_feeds,
    AVG(rs.fetch_frequency_hours) as avg_fetch_hours,
    SUM(rs.total_articles_imported) as total_articles
FROM public.categories c
LEFT JOIN public.rss_sources rs ON c.id = rs.category_id
GROUP BY c.id, c.name
ORDER BY feed_count DESC;

-- Enable all Science feeds to auto-publish
UPDATE public.rss_sources 
SET auto_publish = true 
WHERE category_id = (SELECT id FROM public.categories WHERE name = 'Science');

-- Make all Health feeds fetch more frequently (every 3 hours)
UPDATE public.rss_sources 
SET fetch_frequency_hours = 3 
WHERE category_id = (SELECT id FROM public.categories WHERE name = 'Health');

-- ================================================================
-- PERFORMANCE & MONITORING
-- ================================================================

-- See which feeds are due for fetching
SELECT * FROM public.get_due_rss_sources();

-- View recent fetch logs
SELECT 
    rs.name,
    rfl.fetch_started_at,
    rfl.status,
    rfl.items_found,
    rfl.items_new,
    rfl.error_message,
    rfl.fetch_duration_ms
FROM public.rss_fetch_logs rfl
JOIN public.rss_sources rs ON rfl.rss_source_id = rs.id
ORDER BY rfl.fetch_started_at DESC
LIMIT 20;

-- Find feeds with errors
SELECT 
    rs.name,
    rs.last_error,
    rs.last_fetched_at,
    rs.last_successful_fetch_at
FROM public.rss_sources rs
WHERE rs.status = 'error' OR rs.last_error IS NOT NULL;

-- ================================================================
-- BULK OPERATIONS
-- ================================================================

-- Add multiple feeds at once
INSERT INTO public.rss_sources (name, description, feed_url, website_url, category_id, status, fetch_frequency_hours, auto_publish, content_language) 
VALUES 
    ('Associated Press News', 'AP Breaking News', 'https://feeds.ap.org/ApNewsBreakingNews', 'https://apnews.com/', (SELECT id FROM categories WHERE name = 'World'), 'active', 1, true, 'en'),
    ('Guardian Science', 'The Guardian Science News', 'https://www.theguardian.com/science/rss', 'https://www.theguardian.com/science', (SELECT id FROM categories WHERE name = 'Science'), 'active', 4, false, 'en'),
    ('Forbes Technology', 'Forbes Tech News', 'https://www.forbes.com/innovation/feed2/', 'https://www.forbes.com/innovation/', (SELECT id FROM categories WHERE name = 'Technology'), 'active', 3, false, 'en')
ON CONFLICT (feed_url) DO NOTHING;

-- Reset all fetch timestamps (force refetch all)
UPDATE public.rss_sources 
SET last_fetched_at = NULL, last_successful_fetch_at = NULL, last_error = NULL;

-- ================================================================
-- CLEANUP
-- ================================================================

-- Remove inactive feeds that haven't been used
DELETE FROM public.rss_sources 
WHERE status = 'inactive' 
AND total_articles_imported = 0 
AND created_at < NOW() - INTERVAL '30 days';

-- Clear old fetch logs (keep last 100 per source)
DELETE FROM public.rss_fetch_logs 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY rss_source_id ORDER BY fetch_started_at DESC) as rn
        FROM public.rss_fetch_logs
    ) ranked 
    WHERE rn <= 100
);