-- Enhanced Database Functions for Modern News Platform
-- Comprehensive functions for admin panel and advanced features

-- ======================================================================
-- ADMIN DASHBOARD FUNCTIONS
-- ======================================================================

-- Enhanced admin statistics with detailed metrics
CREATE OR REPLACE FUNCTION get_enhanced_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
BEGIN
  SELECT json_build_object(
    -- Content metrics
    'totalArticles', (SELECT COUNT(*) FROM articles WHERE deleted_at IS NULL),
    'publishedArticles', (SELECT COUNT(*) FROM articles WHERE status = 'published' AND deleted_at IS NULL),
    'draftArticles', (SELECT COUNT(*) FROM articles WHERE status = 'draft' AND deleted_at IS NULL),
    'scheduledArticles', (SELECT COUNT(*) FROM articles WHERE status = 'scheduled' AND deleted_at IS NULL),
    'featuredArticles', (SELECT COUNT(*) FROM articles WHERE status = 'featured' AND deleted_at IS NULL),
    'premiumArticles', (SELECT COUNT(*) FROM articles WHERE is_premium = true AND deleted_at IS NULL),
    'articlesThisMonth', (SELECT COUNT(*) FROM articles WHERE created_at >= current_month_start AND deleted_at IS NULL),
    
    -- User metrics
    'totalUsers', (SELECT COUNT(*) FROM profiles),
    'subscriberCount', (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active'),
    'premiumSubscribers', (
      SELECT COUNT(*) FROM user_subscriptions us 
      JOIN subscription_plans sp ON us.plan_id = sp.id 
      WHERE us.status = 'active' AND sp.price_monthly > 0
    ),
    'trialUsers', (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'trial'),
    'newUsersThisMonth', (SELECT COUNT(*) FROM profiles WHERE created_at >= current_month_start),
    
    -- Business metrics
    'totalBusinesses', (SELECT COUNT(*) FROM businesses),
    'verifiedBusinesses', (SELECT COUNT(*) FROM businesses WHERE is_verified = true),
    'businessesThisMonth', (SELECT COUNT(*) FROM businesses WHERE created_at >= current_month_start),
    
    -- Advertising metrics
    'totalAds', (SELECT COUNT(*) FROM advertisements),
    'activeAds', (SELECT COUNT(*) FROM advertisements WHERE status = 'active'),
    'pendingAds', (SELECT COUNT(*) FROM advertisements WHERE status = 'pending_approval'),
    
    -- Revenue metrics (requires actual payment integration)
    'monthlyRevenue', (
      SELECT COALESCE(SUM(amount), 0) FROM payments 
      WHERE status = 'completed' AND created_at >= current_month_start
    ),
    'lastMonthRevenue', (
      SELECT COALESCE(SUM(amount), 0) FROM payments 
      WHERE status = 'completed' 
      AND created_at >= last_month_start 
      AND created_at < current_month_start
    ),
    
    -- Engagement metrics
    'totalComments', (SELECT COUNT(*) FROM comments WHERE deleted_at IS NULL),
    'approvedComments', (SELECT COUNT(*) FROM comments WHERE is_approved = true AND deleted_at IS NULL),
    'pendingComments', (SELECT COUNT(*) FROM comments WHERE is_approved = false AND deleted_at IS NULL),
    'newsletterSubscribers', (SELECT COUNT(*) FROM newsletter_subscribers WHERE unsubscribed_at IS NULL),
    
    -- Media metrics
    'totalMedia', (SELECT COUNT(*) FROM media),
    'mediaThisMonth', (SELECT COUNT(*) FROM media WHERE created_at >= current_month_start),
    
    -- Performance metrics
    'totalViews', (SELECT COALESCE(SUM(views), 0) FROM articles),
    'totalLikes', (SELECT COALESCE(SUM(likes), 0) FROM articles),
    'totalShares', (SELECT COALESCE(SUM(shares), 0) FROM articles),
    'averageReadTime', (SELECT COALESCE(AVG(read_time_minutes), 0) FROM articles WHERE read_time_minutes > 0)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Get comprehensive recent activity
CREATE OR REPLACE FUNCTION get_enhanced_recent_activity(activity_limit INT DEFAULT 20)
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
      CASE 
        WHEN a.status = 'published' THEN 'published'
        WHEN a.status = 'scheduled' THEN 'scheduled'
        ELSE 'created'
      END as action,
      COALESCE(ap.display_name, p.full_name, p.email) as user_name,
      a.created_at as timestamp,
      '/admin/articles/' || a.id as href,
      json_build_object(
        'status', a.status,
        'is_premium', a.is_premium,
        'views', a.views
      ) as metadata
    FROM articles a
    JOIN profiles p ON a.author_id = p.id
    LEFT JOIN author_profiles ap ON ap.user_id = p.id
    WHERE a.deleted_at IS NULL
    ORDER BY a.created_at DESC
    LIMIT activity_limit / 4
  ),
  recent_users AS (
    SELECT 
      'user' as type,
      p.id,
      COALESCE(p.full_name, p.email) as title,
      'registered' as action,
      NULL as user_name,
      p.created_at as timestamp,
      '/admin/users/' || p.id as href,
      json_build_object(
        'role', p.role,
        'is_verified', p.is_verified
      ) as metadata
    FROM profiles p
    ORDER BY p.created_at DESC
    LIMIT activity_limit / 4
  ),
  recent_businesses AS (
    SELECT 
      'business' as type,
      b.id,
      b.name as title,
      'registered' as action,
      COALESCE(p.full_name, p.email) as user_name,
      b.created_at as timestamp,
      '/admin/businesses/' || b.id as href,
      json_build_object(
        'is_verified', b.is_verified,
        'rating', b.rating
      ) as metadata
    FROM businesses b
    JOIN profiles p ON b.owner_id = p.id
    ORDER BY b.created_at DESC
    LIMIT activity_limit / 4
  ),
  recent_subscriptions AS (
    SELECT 
      'subscription' as type,
      us.id,
      'New subscription: ' || sp.name as title,
      'subscribed' as action,
      COALESCE(p.full_name, p.email) as user_name,
      us.created_at as timestamp,
      '/admin/subscriptions/' || us.id as href,
      json_build_object(
        'plan', sp.name,
        'status', us.status
      ) as metadata
    FROM user_subscriptions us
    JOIN profiles p ON us.user_id = p.id
    JOIN subscription_plans sp ON us.plan_id = sp.id
    ORDER BY us.created_at DESC
    LIMIT activity_limit / 4
  ),
  combined_activity AS (
    SELECT * FROM recent_articles
    UNION ALL
    SELECT * FROM recent_users
    UNION ALL
    SELECT * FROM recent_businesses
    UNION ALL
    SELECT * FROM recent_subscriptions
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
      'href', href,
      'metadata', metadata
    )
  ) INTO result
  FROM combined_activity;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ======================================================================
-- CONTENT MANAGEMENT FUNCTIONS
-- ======================================================================

-- Advanced article search with filters
CREATE OR REPLACE FUNCTION search_articles(
  search_query TEXT DEFAULT NULL,
  status_filter TEXT[] DEFAULT NULL,
  category_filter UUID[] DEFAULT NULL,
  author_filter UUID[] DEFAULT NULL,
  tag_filter UUID[] DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  is_premium_filter BOOLEAN DEFAULT NULL,
  is_featured_filter BOOLEAN DEFAULT NULL,
  page_num INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INT;
  result JSON;
  offset_val INT := (page_num - 1) * page_size;
BEGIN
  -- Build the main query with filters
  WITH filtered_articles AS (
    SELECT DISTINCT a.*
    FROM articles a
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN profiles p ON a.author_id = p.id
    LEFT JOIN author_profiles ap ON p.id = ap.user_id
    WHERE a.deleted_at IS NULL
    AND (search_query IS NULL OR 
         to_tsvector('english', a.title || ' ' || a.content) @@ plainto_tsquery('english', search_query))
    AND (status_filter IS NULL OR a.status = ANY(status_filter::article_status[]))
    AND (category_filter IS NULL OR a.category_id = ANY(category_filter))
    AND (author_filter IS NULL OR a.author_id = ANY(author_filter))
    AND (tag_filter IS NULL OR at.tag_id = ANY(tag_filter))
    AND (date_from IS NULL OR a.created_at::date >= date_from)
    AND (date_to IS NULL OR a.created_at::date <= date_to)
    AND (is_premium_filter IS NULL OR a.is_premium = is_premium_filter)
    AND (is_featured_filter IS NULL OR (a.status = 'featured') = is_featured_filter)
  ),
  article_with_relations AS (
    SELECT 
      fa.*,
      json_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email,
        'display_name', ap.display_name
      ) as author,
      json_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug,
        'color', c.color
      ) as category,
      COALESCE(
        json_agg(
          json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
        ) FILTER (WHERE t.id IS NOT NULL), 
        '[]'::json
      ) as tags
    FROM filtered_articles fa
    JOIN profiles p ON fa.author_id = p.id
    LEFT JOIN author_profiles ap ON p.id = ap.user_id
    LEFT JOIN categories c ON fa.category_id = c.id
    LEFT JOIN article_tags at ON fa.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    GROUP BY fa.id, fa.title, fa.slug, fa.excerpt, fa.content, fa.content_type, 
             fa.featured_media_id, fa.author_id, fa.co_authors, fa.category_id, 
             fa.status, fa.is_premium, fa.is_breaking_news, fa.is_trending,
             fa.views, fa.likes, fa.shares, fa.read_time_minutes,
             fa.published_at, fa.scheduled_for, fa.created_at, fa.updated_at,
             p.id, p.full_name, p.email, ap.display_name,
             c.id, c.name, c.slug, c.color
    ORDER BY fa.created_at DESC
    LIMIT page_size OFFSET offset_val
  )
  SELECT 
    json_build_object(
      'data', json_agg(awr.*),
      'total', (SELECT COUNT(*) FROM filtered_articles),
      'page', page_num,
      'per_page', page_size,
      'total_pages', CEIL((SELECT COUNT(*) FROM filtered_articles)::float / page_size)
    )
  INTO result
  FROM article_with_relations awr;
  
  RETURN COALESCE(result, '{"data": [], "total": 0, "page": 1, "per_page": 20, "total_pages": 0}'::json);
END;
$$;

-- Function to duplicate article (for versioning)
CREATE OR REPLACE FUNCTION duplicate_article(original_article_id UUID, user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_article_id UUID;
  original_article RECORD;
  new_slug TEXT;
BEGIN
  -- Get original article
  SELECT * INTO original_article FROM articles WHERE id = original_article_id;
  
  IF original_article.id IS NULL THEN
    RAISE EXCEPTION 'Article not found';
  END IF;
  
  -- Generate new slug
  new_slug := original_article.slug || '-v' || (original_article.version + 1);
  
  -- Create new article
  INSERT INTO articles (
    title, slug, subtitle, excerpt, content, content_type,
    featured_media_id, author_id, co_authors, category_id,
    status, is_premium, is_breaking_news, is_trending,
    seo_title, seo_description, social_image_id,
    location_name, location_coords,
    version, parent_version_id
  ) VALUES (
    original_article.title || ' (Copy)',
    new_slug,
    original_article.subtitle,
    original_article.excerpt,
    original_article.content,
    original_article.content_type,
    original_article.featured_media_id,
    user_id,
    original_article.co_authors,
    original_article.category_id,
    'draft',
    original_article.is_premium,
    original_article.is_breaking_news,
    original_article.is_trending,
    original_article.seo_title,
    original_article.seo_description,
    original_article.social_image_id,
    original_article.location_name,
    original_article.location_coords,
    original_article.version + 1,
    original_article_id
  ) RETURNING id INTO new_article_id;
  
  -- Copy tags
  INSERT INTO article_tags (article_id, tag_id)
  SELECT new_article_id, tag_id
  FROM article_tags
  WHERE article_id = original_article_id;
  
  -- Copy media
  INSERT INTO article_media (article_id, media_id, sort_order, is_featured, caption_override)
  SELECT new_article_id, media_id, sort_order, is_featured, caption_override
  FROM article_media
  WHERE article_id = original_article_id;
  
  RETURN new_article_id;
END;
$$;

-- ======================================================================
-- SUBSCRIPTION & BILLING FUNCTIONS
-- ======================================================================

-- Get subscription metrics
CREATE OR REPLACE FUNCTION get_subscription_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
BEGIN
  SELECT json_build_object(
    'active_subscribers', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE status = 'active'
    ),
    'trial_subscribers', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE status = 'trial'
    ),
    'canceled_subscribers', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE status = 'canceled'
    ),
    'expired_subscribers', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE status = 'expired'
    ),
    'monthly_recurring_revenue', (
      SELECT COALESCE(SUM(sp.price_monthly), 0)
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.status = 'active'
    ),
    'yearly_recurring_revenue', (
      SELECT COALESCE(SUM(sp.price_yearly), 0)
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.status = 'active'
    ),
    'new_subscriptions_this_month', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE created_at >= current_month_start
    ),
    'churned_this_month', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE status = 'canceled' 
      AND updated_at >= current_month_start
    ),
    'conversion_rate', (
      SELECT CASE 
        WHEN trial_count > 0 THEN 
          ROUND((converted_count::float / trial_count::float) * 100, 2)
        ELSE 0 
      END
      FROM (
        SELECT 
          COUNT(*) FILTER (WHERE status = 'trial') as trial_count,
          COUNT(*) FILTER (WHERE status = 'active' AND created_at >= current_month_start) as converted_count
        FROM user_subscriptions
      ) conversion_calc
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Process subscription upgrade/downgrade
CREATE OR REPLACE FUNCTION change_subscription_plan(
  subscription_id UUID,
  new_plan_id UUID,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_plan RECORD;
  new_plan RECORD;
  subscription RECORD;
  result JSON;
BEGIN
  -- Get current subscription
  SELECT us.*, sp.name as current_plan_name
  INTO subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.id = subscription_id;
  
  IF subscription.id IS NULL THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  -- Get new plan
  SELECT * INTO new_plan FROM subscription_plans WHERE id = new_plan_id;
  
  IF new_plan.id IS NULL THEN
    RAISE EXCEPTION 'New plan not found';
  END IF;
  
  -- Update subscription
  UPDATE user_subscriptions 
  SET 
    plan_id = new_plan_id,
    updated_at = NOW(),
    articles_read_this_month = 0 -- Reset article count on plan change
  WHERE id = subscription_id;
  
  -- Return result
  SELECT json_build_object(
    'success', true,
    'message', 'Plan changed from ' || subscription.current_plan_name || ' to ' || new_plan.name,
    'old_plan', subscription.current_plan_name,
    'new_plan', new_plan.name,
    'effective_date', effective_date
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ======================================================================
-- ANALYTICS FUNCTIONS
-- ======================================================================

-- Track article view with analytics
CREATE OR REPLACE FUNCTION track_article_view(
  article_uuid UUID,
  user_uuid UUID DEFAULT NULL,
  session_id TEXT DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  referrer TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Increment article views
  UPDATE articles 
  SET views = views + 1 
  WHERE id = article_uuid;
  
  -- Track interaction if user is logged in
  IF user_uuid IS NOT NULL THEN
    INSERT INTO user_article_interactions (user_id, article_id, interaction_type, created_at)
    VALUES (user_uuid, article_uuid, 'view', NOW())
    ON CONFLICT (user_id, article_id, interaction_type) 
    DO UPDATE SET created_at = NOW();
    
    -- Increment subscription article count if premium article
    IF EXISTS (SELECT 1 FROM articles WHERE id = article_uuid AND is_premium = true) THEN
      PERFORM increment_article_read_count(user_uuid);
    END IF;
  END IF;
  
  -- Track analytics event
  INSERT INTO analytics_events (
    event_type, entity_type, entity_id, user_id, session_id, 
    ip_address, user_agent, referrer
  ) VALUES (
    'article_view', 'article', article_uuid, user_uuid, session_id,
    ip_address, user_agent, referrer
  );
END;
$$;

-- Get article performance metrics
CREATE OR REPLACE FUNCTION get_article_performance(
  article_uuid UUID,
  date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  date_to DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'views', a.views,
    'likes', a.likes,
    'shares', a.shares,
    'comments', (SELECT COUNT(*) FROM comments WHERE article_id = article_uuid AND deleted_at IS NULL),
    'unique_viewers', (
      SELECT COUNT(DISTINCT user_id) 
      FROM user_article_interactions 
      WHERE article_id = article_uuid 
      AND interaction_type = 'view'
      AND created_at::date BETWEEN date_from AND date_to
    ),
    'avg_read_time', (
      SELECT AVG(time_spent_seconds) 
      FROM user_article_interactions 
      WHERE article_id = article_uuid 
      AND interaction_type = 'view'
      AND time_spent_seconds > 0
      AND created_at::date BETWEEN date_from AND date_to
    ),
    'completion_rate', (
      SELECT 
        CASE 
          WHEN total_views > 0 THEN 
            ROUND((completed_reads::float / total_views::float) * 100, 2)
          ELSE 0 
        END
      FROM (
        SELECT 
          COUNT(*) as total_views,
          COUNT(*) FILTER (WHERE reading_progress >= 0.8) as completed_reads
        FROM user_article_interactions 
        WHERE article_id = article_uuid 
        AND interaction_type = 'view'
        AND created_at::date BETWEEN date_from AND date_to
      ) completion_calc
    ),
    'daily_views', (
      SELECT json_object_agg(view_date, view_count)
      FROM (
        SELECT 
          ae.created_at::date as view_date,
          COUNT(*) as view_count
        FROM analytics_events ae
        WHERE ae.entity_id = article_uuid
        AND ae.event_type = 'article_view'
        AND ae.created_at::date BETWEEN date_from AND date_to
        GROUP BY ae.created_at::date
        ORDER BY view_date
      ) daily_stats
    )
  ) INTO result
  FROM articles a
  WHERE a.id = article_uuid;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- ======================================================================
-- SEARCH AND RECOMMENDATION FUNCTIONS
-- ======================================================================

-- Advanced search across all content
CREATE OR REPLACE FUNCTION global_search(
  search_query TEXT,
  content_types TEXT[] DEFAULT ARRAY['article', 'business'],
  limit_results INT DEFAULT 50
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH search_results AS (
    -- Articles
    SELECT 
      'article' as type,
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
    
    -- Businesses
    SELECT 
      'business' as type,
      b.id,
      b.name as title,
      b.description,
      '/businesses/' || b.slug as url,
      b.created_at,
      ts_rank(to_tsvector('english', b.name || ' ' || COALESCE(b.description, '')), plainto_tsquery('english', search_query)) as rank
    FROM businesses b
    WHERE 'business' = ANY(content_types)
    AND to_tsvector('english', b.name || ' ' || COALESCE(b.description, '')) @@ plainto_tsquery('english', search_query)
    
    ORDER BY rank DESC, created_at DESC
    LIMIT limit_results
  )
  SELECT json_agg(
    json_build_object(
      'type', type,
      'id', id,
      'title', title,
      'description', description,
      'url', url,
      'created_at', created_at,
      'relevance', rank
    )
  ) INTO result
  FROM search_results;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Get recommended articles for user
CREATE OR REPLACE FUNCTION get_recommended_articles(
  user_uuid UUID,
  limit_results INT DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Simple recommendation based on user's reading history and preferences
  WITH user_categories AS (
    SELECT DISTINCT a.category_id
    FROM user_article_interactions uai
    JOIN articles a ON uai.article_id = a.id
    WHERE uai.user_id = user_uuid
    AND uai.interaction_type = 'view'
    AND uai.reading_progress > 0.5
    ORDER BY uai.created_at DESC
    LIMIT 5
  ),
  recommended AS (
    SELECT DISTINCT
      a.id,
      a.title,
      a.slug,
      a.excerpt,
      a.featured_media_id,
      a.created_at,
      a.views,
      json_build_object('id', c.id, 'name', c.name, 'color', c.color) as category
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published'
    AND a.deleted_at IS NULL
    AND a.category_id IN (SELECT category_id FROM user_categories)
    AND a.id NOT IN (
      SELECT article_id FROM user_article_interactions 
      WHERE user_id = user_uuid AND interaction_type = 'view'
    )
    ORDER BY a.views DESC, a.created_at DESC
    LIMIT limit_results
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'title', title,
      'slug', slug,
      'excerpt', excerpt,
      'featured_media_id', featured_media_id,
      'created_at', created_at,
      'views', views,
      'category', category
    )
  ) INTO result
  FROM recommended;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ======================================================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- ======================================================================

-- Clean up expired sessions and old analytics
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_analytics INT;
  cleaned_subscriptions INT;
  result JSON;
BEGIN
  -- Clean analytics older than 2 years
  DELETE FROM analytics_events 
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS cleaned_analytics = ROW_COUNT;
  
  -- Mark expired subscriptions
  UPDATE user_subscriptions 
  SET status = 'expired' 
  WHERE status = 'active' 
  AND current_period_end < NOW();
  GET DIAGNOSTICS cleaned_subscriptions = ROW_COUNT;
  
  -- Reset monthly article counts at month start
  IF EXTRACT(day FROM NOW()) = 1 THEN
    UPDATE user_subscriptions 
    SET articles_read_this_month = 0
    WHERE status = 'active';
  END IF;
  
  SELECT json_build_object(
    'cleaned_analytics', cleaned_analytics,
    'expired_subscriptions', cleaned_subscriptions,
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Update category article counts
CREATE OR REPLACE FUNCTION update_category_counts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE categories 
  SET article_count = (
    SELECT COUNT(*) 
    FROM articles 
    WHERE category_id = categories.id 
    AND status = 'published' 
    AND deleted_at IS NULL
  );
END;
$$;

-- Update tag usage counts
CREATE OR REPLACE FUNCTION update_tag_counts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tags 
  SET usage_count = (
    SELECT COUNT(*) 
    FROM article_tags at
    JOIN articles a ON at.article_id = a.id
    WHERE at.tag_id = tags.id 
    AND a.status = 'published' 
    AND a.deleted_at IS NULL
  );
END;
$$;

-- ======================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ======================================================================

-- Trigger to update category counts when articles change
CREATE OR REPLACE FUNCTION trigger_update_category_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old category if it changed
  IF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
    UPDATE categories 
    SET article_count = (
      SELECT COUNT(*) 
      FROM articles 
      WHERE category_id = OLD.category_id 
      AND status = 'published' 
      AND deleted_at IS NULL
    )
    WHERE id = OLD.category_id;
  END IF;
  
  -- Update new category
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    UPDATE categories 
    SET article_count = (
      SELECT COUNT(*) 
      FROM articles 
      WHERE category_id = NEW.category_id 
      AND status = 'published' 
      AND deleted_at IS NULL
    )
    WHERE id = NEW.category_id;
  END IF;
  
  -- Update old category on delete
  IF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET article_count = (
      SELECT COUNT(*) 
      FROM articles 
      WHERE category_id = OLD.category_id 
      AND status = 'published' 
      AND deleted_at IS NULL
    )
    WHERE id = OLD.category_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON articles
FOR EACH ROW EXECUTE FUNCTION trigger_update_category_count();

-- Trigger to update author article counts
CREATE OR REPLACE FUNCTION trigger_update_author_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    UPDATE author_profiles 
    SET article_count = (
      SELECT COUNT(*) 
      FROM articles 
      WHERE author_id = NEW.author_id 
      AND status = 'published' 
      AND deleted_at IS NULL
    )
    WHERE user_id = NEW.author_id;
  END IF;
  
  IF TG_OP IN ('DELETE', 'UPDATE') THEN
    UPDATE author_profiles 
    SET article_count = (
      SELECT COUNT(*) 
      FROM articles 
      WHERE author_id = OLD.author_id 
      AND status = 'published' 
      AND deleted_at IS NULL
    )
    WHERE user_id = OLD.author_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_author_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON articles
FOR EACH ROW EXECUTE FUNCTION trigger_update_author_count();