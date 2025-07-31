// Enhanced TypeScript types for modern news business platform

export type UserRole = 'user' | 'admin' | 'editor' | 'author' | 'subscriber' | 'premium_subscriber'
export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'featured'
export type AdStatus = 'active' | 'paused' | 'expired' | 'pending_approval'
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial' | 'past_due'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type NotificationType = 'breaking_news' | 'new_article' | 'comment_reply' | 'subscription_reminder'
export type ContentType = 'article' | 'gallery' | 'video' | 'podcast' | 'live_blog'
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'embed'

// Enhanced Profile interface
export interface Profile {
  id: string
  email: string
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  role: UserRole
  is_verified: boolean
  social_links: Record<string, string>
  preferences: Record<string, any>
  last_seen_at?: string
  created_at: string
  updated_at: string
}

// Author profile for content creators
export interface AuthorProfile {
  id: string
  user_id: string
  display_name: string
  title?: string
  expertise_areas: string[]
  bio_long?: string
  contact_email?: string
  social_twitter?: string
  social_linkedin?: string
  social_instagram?: string
  profile_image_url?: string
  byline_image_url?: string
  is_featured: boolean
  article_count: number
  created_at: string
  updated_at: string
  // Relations
  user?: Profile
}

// Subscription management
export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price_monthly?: number
  price_yearly?: number
  features: string[]
  max_articles_per_month?: number
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  stripe_subscription_id?: string
  stripe_customer_id?: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end: boolean
  articles_read_this_month: number
  trial_ends_at?: string
  created_at: string
  updated_at: string
  // Relations
  user?: Profile
  plan?: SubscriptionPlan
}

export interface Payment {
  id: string
  user_id: string
  subscription_id?: string
  stripe_payment_intent_id?: string
  amount: number
  currency: string
  status: PaymentStatus
  description?: string
  created_at: string
  // Relations
  user?: Profile
  subscription?: UserSubscription
}

// Enhanced Category with hierarchy
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  parent_id?: string
  seo_title?: string
  seo_description?: string
  is_featured: boolean
  article_count: number
  sort_order: number
  created_at: string
  updated_at: string
  // Relations
  parent?: Category
  subcategories?: Category[]
}

// Tag system
export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  usage_count: number
  created_at: string
}

// Media/Gallery system
export interface Media {
  id: string
  filename: string
  original_filename: string
  file_url: string
  thumbnail_url?: string
  media_type: MediaType
  mime_type: string
  file_size?: number
  width?: number
  height?: number
  duration?: number
  alt_text?: string
  caption?: string
  credits?: string
  metadata: Record<string, any>
  uploaded_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
  // Relations
  uploader?: Profile
}

// Enhanced Article with rich features
export interface Article {
  id: string
  title: string
  slug: string
  subtitle?: string
  excerpt?: string
  content: string
  content_type: ContentType
  featured_media_id?: string
  author_id: string
  co_authors?: string[]
  category_id?: string
  status: ArticleStatus
  is_premium: boolean
  is_breaking_news: boolean
  is_trending: boolean
  
  // SEO & Social
  seo_title?: string
  seo_description?: string
  social_image_id?: string
  
  // Analytics
  views: number
  likes: number
  shares: number
  read_time_minutes?: number
  
  // Scheduling
  published_at?: string
  scheduled_for?: string
  
  // Geo-tagging
  location_name?: string
  location_coords?: [number, number]
  
  // Versioning
  version: number
  parent_version_id?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  deleted_at?: string
  
  // Relations
  author?: Profile
  co_author_profiles?: Profile[]
  category?: Category
  tags?: Tag[]
  featured_media?: Media
  social_image?: Media
  gallery?: ArticleMedia[]
  comments?: Comment[]
}

export interface ArticleMedia {
  id: string
  article_id: string
  media_id: string
  sort_order: number
  is_featured: boolean
  caption_override?: string
  created_at: string
  // Relations
  media?: Media
}

// Enhanced Business with rich features
export interface Business {
  id: string
  name: string
  slug?: string
  description?: string
  long_description?: string
  industry?: string
  website_url?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  coordinates?: [number, number]
  logo_id?: string
  cover_image_id?: string
  owner_id: string
  
  // Business details
  business_hours: Record<string, any>
  social_links: Record<string, string>
  services: string[]
  
  // Verification & ratings
  is_verified: boolean
  rating: number
  review_count: number
  
  // SEO
  seo_title?: string
  seo_description?: string
  
  created_at: string
  updated_at: string
  
  // Relations
  owner?: Profile
  logo?: Media
  cover_image?: Media
  gallery?: BusinessMedia[]
  reviews?: BusinessReview[]
}

export interface BusinessMedia {
  id: string
  business_id: string
  media_id: string
  sort_order: number
  is_featured: boolean
  caption_override?: string
  created_at: string
  // Relations
  media?: Media
}

export interface BusinessReview {
  id: string
  business_id: string
  user_id: string
  rating: number
  title?: string
  content?: string
  is_verified: boolean
  created_at: string
  updated_at: string
  // Relations
  user?: Profile
}

// Enhanced Advertisement
export interface Advertisement {
  id: string
  business_id: string
  title: string
  description?: string
  media_id?: string
  link_url?: string
  
  // Placement & targeting
  position: string
  target_categories?: string[]
  target_tags?: string[]
  
  // Budget & billing
  budget_total?: number
  budget_daily?: number
  cost_per_click?: number
  cost_per_impression?: number
  
  // Performance
  status: AdStatus
  impressions: number
  clicks: number
  conversions: number
  
  // Scheduling
  start_date: string
  end_date?: string
  
  created_at: string
  updated_at: string
  
  // Relations
  business?: Business
  media?: Media
}

// Comments system
export interface Comment {
  id: string
  article_id: string
  user_id?: string
  parent_id?: string
  content: string
  is_approved: boolean
  is_flagged: boolean
  likes: number
  created_at: string
  updated_at: string
  deleted_at?: string
  // Relations
  user?: Profile
  replies?: Comment[]
}

// Newsletter system
export interface NewsletterSubscriber {
  id: string
  email: string
  full_name?: string
  subscribed_at: string
  unsubscribed_at?: string
  preferences: Record<string, any>
  verification_token?: string
  is_verified: boolean
  source?: string
  created_at: string
}

export interface NewsletterCampaign {
  id: string
  subject: string
  content: string
  template_id?: string
  sent_at?: string
  scheduled_for?: string
  recipients_count: number
  opens_count: number
  clicks_count: number
  created_by?: string
  created_at: string
  // Relations
  creator?: Profile
}

// Push notifications
export interface PushNotification {
  id: string
  user_id?: string
  title: string
  body: string
  type: NotificationType
  data: Record<string, any>
  sent_at?: string
  read_at?: string
  created_at: string
  // Relations
  user?: Profile
}

// User analytics
export interface UserArticleInteraction {
  id: string
  user_id: string
  article_id: string
  interaction_type: string
  reading_progress: number
  time_spent_seconds: number
  created_at: string
  // Relations
  user?: Profile
  article?: Article
}

// SEO redirects
export interface Redirect {
  id: string
  from_path: string
  to_path: string
  status_code: number
  is_active: boolean
  created_at: string
}

// Site settings
export interface SiteSetting {
  key: string
  value: any
  description?: string
  updated_by?: string
  updated_at: string
  // Relations
  updater?: Profile
}

// Analytics
export interface AnalyticsEvent {
  id: string
  event_type: string
  entity_type?: string
  entity_id?: string
  user_id?: string
  session_id?: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  properties: Record<string, any>
  created_at: string
  // Relations
  user?: Profile
}

// Legacy types for backward compatibility
export interface AudioRecording {
  id: string
  user_id: string
  audio_url: string
  transcription?: string
  duration_seconds?: number
  created_at: string
  // Relations
  user?: Profile
}

export interface ContentImport {
  id: string
  user_id: string
  filename: string
  file_url: string
  imported_articles: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  updated_at: string
  // Relations
  user?: Profile
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard/Admin types
export interface AdminStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  scheduledArticles: number
  totalUsers: number
  subscriberCount: number
  premiumSubscribers: number
  totalBusinesses: number
  totalAds: number
  activeAds: number
  monthlyRevenue: number
  articlesThisMonth: number
  newUsersThisMonth: number
}

export interface RecentActivity {
  id: string
  type: 'article' | 'user' | 'business' | 'comment' | 'subscription'
  title: string
  action: string
  user?: string
  timestamp: string
  href?: string
}

// Content management types
export interface ContentFilters {
  status?: ArticleStatus[]
  category?: string[]
  author?: string[]
  tags?: string[]
  date_from?: string
  date_to?: string
  search?: string
  is_premium?: boolean
  is_featured?: boolean
}

export interface MediaFilters {
  type?: MediaType[]
  uploaded_by?: string[]
  date_from?: string
  date_to?: string
  search?: string
}

// Subscription & billing types
export interface SubscriptionMetrics {
  active_subscribers: number
  trial_subscribers: number
  canceled_subscribers: number
  monthly_recurring_revenue: number
  churn_rate: number
  average_revenue_per_user: number
}

// SEO & Analytics types
export interface SEOMetrics {
  total_pages: number
  indexed_pages: number
  average_page_speed: number
  bounce_rate: number
  session_duration: number
  organic_traffic: number
}

export interface ArticlePerformance {
  views: number
  unique_views: number
  avg_time_on_page: number
  bounce_rate: number
  social_shares: number
  comments_count: number
  likes_count: number
}

// RSS Feed Management Types
export type RSSSourceStatus = 'active' | 'inactive' | 'error'

export interface RSSSource {
  id: string
  name: string
  description?: string
  feed_url: string
  website_url?: string
  category_id?: string
  status: RSSSourceStatus
  fetch_frequency_hours: number
  last_fetched_at?: string
  last_successful_fetch_at?: string
  last_error?: string
  total_articles_imported: number
  
  // Content processing settings
  auto_publish: boolean
  default_author_id?: string
  content_language: string
  
  // Dynamic categorization settings
  category_keywords?: string[]
  use_auto_categorization?: boolean
  
  // Feed metadata
  feed_title?: string
  feed_description?: string
  feed_language?: string
  feed_copyright?: string
  feed_image_url?: string
  
  created_at: string
  updated_at: string
  created_by?: string
  
  // Relations
  category?: Category
  default_author?: Profile
}

export interface RSSArticleTracking {
  id: string
  rss_source_id: string
  article_id: string
  original_guid?: string
  original_link?: string
  original_pub_date?: string
  fetched_at: string
  
  // Relations
  rss_source?: RSSSource
  article?: Article
}

export interface RSSFetchLog {
  id: string
  rss_source_id: string
  fetch_started_at: string
  fetch_completed_at?: string
  status: 'success' | 'error' | 'partial' | 'running'
  items_found: number
  items_new: number
  items_updated: number
  error_message?: string
  fetch_duration_ms?: number
  
  // Relations
  rss_source?: RSSSource
}

// RSS Management API Types
export interface RSSSourceCreate {
  name: string
  description?: string
  feed_url: string
  website_url?: string
  category_id?: string
  fetch_frequency_hours?: number
  auto_publish?: boolean
  default_author_id?: string
  content_language?: string
  category_keywords?: string[]
  use_auto_categorization?: boolean
}

export interface RSSSourceUpdate extends Partial<RSSSourceCreate> {
  status?: RSSSourceStatus
}

export interface RSSProcessingResult {
  source_id: string
  success: boolean
  new_articles: number
  total_items: number
  errors: string[]
  duration_ms: number
}

export interface RSSManagerStats {
  total_sources: number
  active_sources: number
  inactive_sources: number
  error_sources: number
  total_articles_imported: number
  articles_imported_today: number
  last_successful_fetch?: string
  sources_due_for_fetch: number
}

// RSS Category Keywords for intelligent categorization
export interface RSSCategoryKeywords {
  id: string
  category_id: string
  keywords: string[]
  priority: number
  created_at: string
  
  // Relations
  category?: Category
} 