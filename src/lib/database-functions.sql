-- Optimized function to get admin statistics in a single query
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalArticles', (SELECT COUNT(*) FROM articles),
    'publishedArticles', (SELECT COUNT(*) FROM articles WHERE status = 'published'),
    'totalUsers', (SELECT COUNT(*) FROM profiles),
    'totalBusinesses', (SELECT COUNT(*) FROM businesses),
    'totalAds', (SELECT COUNT(*) FROM advertisements),
    'activeAds', (SELECT COUNT(*) FROM advertisements WHERE status = 'active')
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get recent activity efficiently
CREATE OR REPLACE FUNCTION get_recent_activity(activity_limit INT DEFAULT 15)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH recent_articles AS (
    SELECT 
      'article' as type,
      a.id,
      a.title,
      CASE WHEN a.status = 'published' THEN 'published' ELSE 'created' END as action,
      p.full_name as user_name,
      a.created_at as timestamp,
      '/articles/' || a.slug as href
    FROM articles a
    JOIN profiles p ON a.author_id = p.id
    ORDER BY a.created_at DESC
    LIMIT activity_limit / 3
  ),
  recent_users AS (
    SELECT 
      'user' as type,
      p.id,
      COALESCE(p.full_name, p.email) as title,
      'registered' as action,
      NULL as user_name,
      p.created_at as timestamp,
      NULL as href
    FROM profiles p
    ORDER BY p.created_at DESC
    LIMIT activity_limit / 3
  ),
  recent_businesses AS (
    SELECT 
      'business' as type,
      b.id,
      b.name as title,
      'registered' as action,
      NULL as user_name,
      b.created_at as timestamp,
      '/businesses/' || b.id as href
    FROM businesses b
    ORDER BY b.created_at DESC
    LIMIT activity_limit / 3
  ),
  combined_activity AS (
    SELECT * FROM recent_articles
    UNION ALL
    SELECT * FROM recent_users
    UNION ALL
    SELECT * FROM recent_businesses
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
  FROM combined_activity;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Function to increment article views atomically
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles 
  SET views = views + 1 
  WHERE id = article_id;
END;
$$;

-- Function to track ad impressions and clicks efficiently
CREATE OR REPLACE FUNCTION track_ad_interaction(
  ad_id UUID,
  interaction_type TEXT -- 'impression' or 'click'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF interaction_type = 'impression' THEN
    UPDATE advertisements 
    SET impressions = impressions + 1 
    WHERE id = ad_id;
  ELSIF interaction_type = 'click' THEN
    UPDATE advertisements 
    SET clicks = clicks + 1 
    WHERE id = ad_id;
  END IF;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_author_created ON articles(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_advertisements_position_status ON advertisements(position, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role IN ('admin', 'editor');
CREATE INDEX IF NOT EXISTS idx_audio_recordings_user_created ON audio_recordings(user_id, created_at DESC); 