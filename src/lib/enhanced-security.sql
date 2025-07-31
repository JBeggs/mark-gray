-- Enhanced Row Level Security (RLS) Policies
-- Comprehensive security for modern news platform

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ======================================================================
-- PROFILES POLICIES
-- ======================================================================

-- Anyone can view basic profile info
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ======================================================================
-- AUTHOR PROFILES POLICIES
-- ======================================================================

-- Anyone can view author profiles
CREATE POLICY "Anyone can view author profiles" ON public.author_profiles FOR SELECT USING (true);

-- Authors can manage their own profile, admins can manage all
CREATE POLICY "Authors can manage own profile" ON public.author_profiles FOR ALL 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- SUBSCRIPTION PLANS POLICIES
-- ======================================================================

-- Anyone can view active subscription plans
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT 
USING (is_active = true);

-- Only admins can manage subscription plans
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ======================================================================
-- USER SUBSCRIPTIONS POLICIES
-- ======================================================================

-- Users can view their own subscriptions, admins can view all
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Users can manage their own subscriptions
CREATE POLICY "Users can manage own subscriptions" ON public.user_subscriptions FOR ALL 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ======================================================================
-- PAYMENTS POLICIES
-- ======================================================================

-- Users can view their own payments, admins can view all
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Only system can insert payments (via service role)
CREATE POLICY "System can insert payments" ON public.payments FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ======================================================================
-- CATEGORIES POLICIES
-- ======================================================================

-- Anyone can view categories
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- Admins and editors can manage categories
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- TAGS POLICIES
-- ======================================================================

-- Anyone can view tags
CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT USING (true);

-- Authors, editors, and admins can create tags
CREATE POLICY "Content creators can manage tags" ON public.tags FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'author')
  )
);

-- ======================================================================
-- MEDIA POLICIES
-- ======================================================================

-- Anyone can view public media
CREATE POLICY "Anyone can view public media" ON public.media FOR SELECT 
USING (
  is_public = true OR 
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media" ON public.media FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Users can manage their own media, admins can manage all
CREATE POLICY "Users can manage own media" ON public.media FOR UPDATE 
USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- ARTICLES POLICIES
-- ======================================================================

-- Anyone can view published articles
-- Subscribers can view premium content if they have active subscription
-- Authors can view their own drafts
-- Admins/editors can view all
CREATE POLICY "Complex article visibility" ON public.articles FOR SELECT 
USING (
  (status = 'published' AND is_premium = false) OR
  (status = 'published' AND is_premium = true AND 
    EXISTS (
      SELECT 1 FROM public.user_subscriptions us 
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = auth.uid() 
      AND us.status = 'active' 
      AND (sp.max_articles_per_month IS NULL OR us.articles_read_this_month < sp.max_articles_per_month)
    )
  ) OR
  author_id = auth.uid() OR
  auth.uid() = ANY(co_authors) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Authors can manage their own articles, editors/admins can manage all
CREATE POLICY "Authors can manage own articles" ON public.articles FOR ALL 
USING (
  author_id = auth.uid() OR
  auth.uid() = ANY(co_authors) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- ARTICLE TAGS POLICIES
-- ======================================================================

-- Anyone can view article tags (follows article visibility)
CREATE POLICY "Article tags follow article visibility" ON public.article_tags FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.articles a 
    WHERE a.id = article_id 
    AND (
      (a.status = 'published' AND a.is_premium = false) OR
      (a.status = 'published' AND a.is_premium = true AND 
        EXISTS (
          SELECT 1 FROM public.user_subscriptions us 
          JOIN public.subscription_plans sp ON us.plan_id = sp.id
          WHERE us.user_id = auth.uid() 
          AND us.status = 'active'
        )
      ) OR
      a.author_id = auth.uid() OR
      auth.uid() = ANY(a.co_authors) OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
);

-- Content creators can manage article tags
CREATE POLICY "Content creators can manage article tags" ON public.article_tags FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.articles a 
    WHERE a.id = article_id 
    AND (
      a.author_id = auth.uid() OR
      auth.uid() = ANY(a.co_authors) OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
      )
    )
  )
);

-- ======================================================================
-- BUSINESSES POLICIES
-- ======================================================================

-- Anyone can view verified businesses
CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT USING (true);

-- Business owners can manage their own business, admins can manage all
CREATE POLICY "Owners can manage own business" ON public.businesses FOR ALL 
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ======================================================================
-- BUSINESS REVIEWS POLICIES
-- ======================================================================

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view reviews" ON public.business_reviews FOR SELECT 
USING (is_verified = true);

-- Users can create reviews, but only one per business
CREATE POLICY "Users can create reviews" ON public.business_reviews FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.business_reviews FOR UPDATE 
USING (user_id = auth.uid());

-- ======================================================================
-- ADVERTISEMENTS POLICIES
-- ======================================================================

-- Anyone can view active ads
CREATE POLICY "Anyone can view active ads" ON public.advertisements FOR SELECT 
USING (
  status = 'active' OR
  EXISTS (
    SELECT 1 FROM public.businesses b 
    WHERE b.id = business_id AND b.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Business owners can manage their ads, admins can manage all
CREATE POLICY "Business owners can manage ads" ON public.advertisements FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b 
    WHERE b.id = business_id AND b.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ======================================================================
-- COMMENTS POLICIES
-- ======================================================================

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments" ON public.comments FOR SELECT 
USING (
  is_approved = true OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Authenticated users can create comments
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- NEWSLETTER POLICIES
-- ======================================================================

-- Only system can manage newsletter subscribers (privacy)
CREATE POLICY "System manages newsletter" ON public.newsletter_subscribers FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Admins and editors can manage campaigns
CREATE POLICY "Admins can manage campaigns" ON public.newsletter_campaigns FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- NOTIFICATIONS POLICIES
-- ======================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.push_notifications FOR SELECT 
USING (
  user_id = auth.uid() OR 
  user_id IS NULL OR -- Broadcast notifications
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.push_notifications FOR UPDATE 
USING (user_id = auth.uid());

-- System and admins can create notifications
CREATE POLICY "System can create notifications" ON public.push_notifications FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- USER INTERACTIONS POLICIES
-- ======================================================================

-- Users can view their own interactions, admins can view all
CREATE POLICY "Users can view own interactions" ON public.user_article_interactions FOR SELECT 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Users can manage their own interactions
CREATE POLICY "Users can manage own interactions" ON public.user_article_interactions FOR ALL 
USING (user_id = auth.uid());

-- ======================================================================
-- ADMIN-ONLY POLICIES
-- ======================================================================

-- Only admins can manage redirects
CREATE POLICY "Admins can manage redirects" ON public.redirects FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Only admins can view/manage site settings
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Analytics events - system can insert, admins can view all
CREATE POLICY "System can track analytics" ON public.analytics_events FOR INSERT 
WITH CHECK (true); -- Allow anonymous tracking

CREATE POLICY "Admins can view analytics" ON public.analytics_events FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ======================================================================
-- STORAGE POLICIES
-- ======================================================================

-- Enhanced storage policies for new buckets
CREATE POLICY "Anyone can view public article media" ON storage.objects FOR SELECT 
USING (bucket_id = 'article-media');

CREATE POLICY "Anyone can view public business media" ON storage.objects FOR SELECT 
USING (bucket_id = 'business-media');

CREATE POLICY "Authenticated users can upload article media" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'article-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload business media" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'business-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can manage own uploads" ON storage.objects FOR UPDATE 
USING (
  auth.uid()::text = (storage.foldername(name))[1] OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- ======================================================================
-- SECURITY FUNCTIONS
-- ======================================================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = user_uuid 
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$;

-- Function to check premium content access
CREATE OR REPLACE FUNCTION can_access_premium_content(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Admins and editors always have access
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid AND role IN ('admin', 'editor')
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check active subscription with article limits
  SELECT us.*, sp.max_articles_per_month
  INTO subscription_record
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
  AND us.status = 'active'
  AND (us.current_period_end IS NULL OR us.current_period_end > NOW());
  
  IF subscription_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check article limit
  IF subscription_record.max_articles_per_month IS NOT NULL 
     AND subscription_record.articles_read_this_month >= subscription_record.max_articles_per_month THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to increment article read count for subscription limits
CREATE OR REPLACE FUNCTION increment_article_read_count(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_subscriptions 
  SET articles_read_this_month = articles_read_this_month + 1
  WHERE user_id = user_uuid 
  AND status = 'active';
END;
$$;