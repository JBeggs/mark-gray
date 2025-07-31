-- Fix RSS system to work dynamically with any categories
-- Remove hardcoded category references and make it flexible

-- First, clear any existing RSS sources with hardcoded category references
DELETE FROM public.rss_sources WHERE feed_url LIKE '%bbci.co.uk%' OR feed_url LIKE '%reuters%' OR feed_url LIKE '%techcrunch%';

-- Add a flexible category mapping system
CREATE TABLE IF NOT EXISTS public.rss_category_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    keywords TEXT[] NOT NULL, -- Array of keywords to match against RSS feed content
    priority INTEGER DEFAULT 1, -- Higher priority wins if multiple matches
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add intelligent category assignment to RSS sources
ALTER TABLE public.rss_sources 
ADD COLUMN IF NOT EXISTS category_keywords TEXT[], -- Keywords to help auto-assign categories
ADD COLUMN IF NOT EXISTS use_auto_categorization BOOLEAN DEFAULT true; -- Whether to auto-assign categories

-- Create a function to find best category for an RSS item
CREATE OR REPLACE FUNCTION public.find_best_category_for_content(
    content_title TEXT,
    content_description TEXT,
    feed_keywords TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    best_category_id UUID;
    keyword_match_score INTEGER := 0;
    current_score INTEGER;
    category_record RECORD;
BEGIN
    -- If no content provided, return null
    IF content_title IS NULL AND content_description IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Combine title and description for analysis
    content_title := COALESCE(content_title, '');
    content_description := COALESCE(content_description, '');
    
    -- Look for keyword matches in category mappings
    FOR category_record IN 
        SELECT 
            rck.category_id,
            rck.keywords,
            rck.priority,
            c.name
        FROM public.rss_category_keywords rck
        JOIN public.categories c ON c.id = rck.category_id
        ORDER BY rck.priority DESC
    LOOP
        current_score := 0;
        
        -- Check how many keywords match
        FOR i IN 1..array_length(category_record.keywords, 1) LOOP
            IF (content_title || ' ' || content_description) ILIKE '%' || category_record.keywords[i] || '%' THEN
                current_score := current_score + category_record.priority;
            END IF;
        END LOOP;
        
        -- Also check feed keywords if provided
        IF feed_keywords IS NOT NULL THEN
            FOR i IN 1..array_length(feed_keywords, 1) LOOP
                FOR j IN 1..array_length(category_record.keywords, 1) LOOP
                    IF feed_keywords[i] ILIKE '%' || category_record.keywords[j] || '%' THEN
                        current_score := current_score + (category_record.priority * 2); -- Feed keywords get double weight
                    END IF;
                END LOOP;
            END LOOP;
        END IF;
        
        -- Update best match if this score is higher
        IF current_score > keyword_match_score THEN
            keyword_match_score := current_score;
            best_category_id := category_record.category_id;
        END IF;
    END LOOP;
    
    -- If no keyword matches, try to match against category names directly
    IF best_category_id IS NULL THEN
        SELECT c.id INTO best_category_id
        FROM public.categories c
        WHERE (content_title || ' ' || content_description) ILIKE '%' || c.name || '%'
        ORDER BY LENGTH(c.name) DESC
        LIMIT 1;
    END IF;
    
    RETURN best_category_id;
END;
$$;

-- Create a function to suggest RSS sources based on existing categories
CREATE OR REPLACE FUNCTION public.suggest_rss_sources_for_categories()
RETURNS TABLE (
    category_name TEXT,
    category_id UUID,
    suggested_feeds JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.name as category_name,
        c.id as category_id,
        CASE 
            WHEN c.name ILIKE '%business%' OR c.name ILIKE '%economic%' OR c.name ILIKE '%finance%' THEN 
                '["BBC Business|http://feeds.bbci.co.uk/news/business/rss.xml", "Reuters Business|https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best"]'::jsonb
            WHEN c.name ILIKE '%tech%' OR c.name ILIKE '%technology%' OR c.name ILIKE '%digital%' THEN 
                '["BBC Technology|http://feeds.bbci.co.uk/news/technology/rss.xml", "TechCrunch|https://techcrunch.com/feed/"]'::jsonb
            WHEN c.name ILIKE '%science%' OR c.name ILIKE '%research%' THEN 
                '["BBC Science|http://feeds.bbci.co.uk/news/science_and_environment/rss.xml", "Scientific American|https://rss.sciam.com/ScientificAmerican-Global"]'::jsonb
            WHEN c.name ILIKE '%health%' OR c.name ILIKE '%medical%' THEN 
                '["BBC Health|http://feeds.bbci.co.uk/news/health/rss.xml", "Reuters Health|https://www.reutersagency.com/feed/?best-topics=health&post_type=best"]'::jsonb
            WHEN c.name ILIKE '%world%' OR c.name ILIKE '%international%' OR c.name ILIKE '%global%' THEN 
                '["Reuters World|https://www.reutersagency.com/feed/?best-topics=international-news&post_type=best", "BBC World|http://feeds.bbci.co.uk/news/world/rss.xml"]'::jsonb
            WHEN c.name ILIKE '%local%' OR c.name ILIKE '%community%' THEN 
                '["Add your local news RSS feeds here"]'::jsonb
            WHEN c.name ILIKE '%sport%' OR c.name ILIKE '%athletic%' THEN 
                '["BBC Sport|http://feeds.bbci.co.uk/sport/rss.xml", "ESPN|https://www.espn.com/espn/rss/news"]'::jsonb
            WHEN c.name ILIKE '%politic%' OR c.name ILIKE '%government%' THEN 
                '["BBC Politics|http://feeds.bbci.co.uk/news/politics/rss.xml", "Reuters Politics|https://www.reutersagency.com/feed/?best-topics=political-news&post_type=best"]'::jsonb
            ELSE 
                '["Search for RSS feeds matching: ' || c.name || '"]'::jsonb
        END as suggested_feeds
    FROM public.categories c
    ORDER BY c.name;
END;
$$;

-- RLS Policies for new tables
ALTER TABLE public.rss_category_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage RSS category keywords" ON public.rss_category_keywords
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rss_category_keywords_category ON public.rss_category_keywords(category_id);
CREATE INDEX IF NOT EXISTS idx_rss_category_keywords_keywords ON public.rss_category_keywords USING GIN (keywords);

-- Create sample keyword mappings based on existing categories
-- This will work with whatever categories you have
INSERT INTO public.rss_category_keywords (category_id, keywords, priority)
SELECT 
    c.id,
    CASE 
        WHEN c.name ILIKE '%business%' OR c.name ILIKE '%economic%' OR c.name ILIKE '%finance%' THEN 
            ARRAY['business', 'economy', 'finance', 'market', 'stock', 'trade', 'company', 'corporate', 'startup', 'investment']
        WHEN c.name ILIKE '%tech%' OR c.name ILIKE '%technology%' OR c.name ILIKE '%digital%' THEN 
            ARRAY['technology', 'tech', 'digital', 'software', 'hardware', 'AI', 'artificial intelligence', 'computer', 'internet', 'cybersecurity']
        WHEN c.name ILIKE '%science%' OR c.name ILIKE '%research%' THEN 
            ARRAY['science', 'research', 'study', 'discovery', 'experiment', 'laboratory', 'scientific', 'biology', 'chemistry', 'physics']
        WHEN c.name ILIKE '%health%' OR c.name ILIKE '%medical%' THEN 
            ARRAY['health', 'medical', 'medicine', 'hospital', 'doctor', 'patient', 'treatment', 'disease', 'wellness', 'healthcare']
        WHEN c.name ILIKE '%world%' OR c.name ILIKE '%international%' OR c.name ILIKE '%global%' THEN 
            ARRAY['world', 'international', 'global', 'foreign', 'country', 'nation', 'diplomatic', 'embassy', 'war', 'peace']
        WHEN c.name ILIKE '%local%' OR c.name ILIKE '%community%' THEN 
            ARRAY['local', 'community', 'neighborhood', 'city', 'town', 'municipal', 'resident', 'council', 'mayor']
        WHEN c.name ILIKE '%sport%' OR c.name ILIKE '%athletic%' THEN 
            ARRAY['sport', 'sports', 'athletic', 'game', 'team', 'player', 'match', 'tournament', 'championship', 'league']
        WHEN c.name ILIKE '%politic%' OR c.name ILIKE '%government%' THEN 
            ARRAY['politics', 'political', 'government', 'election', 'vote', 'candidate', 'senator', 'congress', 'parliament', 'minister']
        WHEN c.name ILIKE '%event%' OR c.name ILIKE '%entertainment%' THEN 
            ARRAY['event', 'entertainment', 'concert', 'festival', 'show', 'performance', 'music', 'art', 'culture', 'celebrity']
        ELSE 
            ARRAY[LOWER(c.name)]
    END as keywords,
    10 as priority
FROM public.categories c
ON CONFLICT DO NOTHING;

-- Update the RSS sources schema to remove hardcoded inserts
COMMENT ON TABLE public.rss_sources IS 'RSS feed sources - dynamically works with any categories in the database';
COMMENT ON FUNCTION public.find_best_category_for_content IS 'Intelligently assigns categories to RSS content based on keywords and content analysis';
COMMENT ON FUNCTION public.suggest_rss_sources_for_categories IS 'Suggests RSS feeds based on existing categories in the database';