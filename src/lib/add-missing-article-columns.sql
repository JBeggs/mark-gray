-- Add missing columns to articles table for RSS feed integration
-- Run this to fix the RSS processor errors

-- Add metadata column for RSS and other integrations
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add external_url for RSS articles to link back to original source
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add some other useful columns that the RSS processor might need
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual'; -- 'manual', 'rss', 'api', etc.

-- Update any existing articles to have default metadata
UPDATE public.articles 
SET metadata = '{}' 
WHERE metadata IS NULL;

-- Create index for metadata queries
CREATE INDEX IF NOT EXISTS idx_articles_metadata ON public.articles USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_articles_source_type ON public.articles(source_type);
CREATE INDEX IF NOT EXISTS idx_articles_external_url ON public.articles(external_url);

-- Add a comment to track the change
COMMENT ON COLUMN public.articles.metadata IS 'JSONB field for storing additional article metadata like RSS source info, import details, etc.';
COMMENT ON COLUMN public.articles.external_url IS 'Original URL for articles imported from external sources like RSS feeds';
COMMENT ON COLUMN public.articles.source_type IS 'Indicates how the article was created: manual, rss, api, etc.';