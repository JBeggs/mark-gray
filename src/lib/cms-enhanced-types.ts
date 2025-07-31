// Complete CMS TypeScript Types
// Every piece of content is editable in the admin panel

export type PageType = 'static' | 'home' | 'about' | 'contact' | 'privacy' | 'terms' | 'custom'
export type ContentBlockType = 'text' | 'image' | 'gallery' | 'video' | 'form' | 'map' | 'team' | 'testimonials' | 'faq' | 'html'
export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date'

// ======================================================================
// PAGE MANAGEMENT SYSTEM
// ======================================================================

export interface Page {
  id: string
  title: string
  slug: string
  page_type: PageType
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  content?: string
  featured_image_id?: string
  template_name: string
  is_published: boolean
  is_in_menu: boolean
  menu_order: number
  parent_page_id?: string
  custom_css?: string
  custom_js?: string
  seo_schema: Record<string, any>
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
  
  // Relations
  featured_image?: Media
  parent_page?: Page
  child_pages?: Page[]
  content_blocks?: ContentBlock[]
  creator?: Profile
  updater?: Profile
}

export interface ContentBlock {
  id: string
  page_id: string
  block_type: ContentBlockType
  title?: string
  content?: string
  settings: Record<string, any>
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Relations
  page?: Page
  media?: ContentBlockMedia[]
}

export interface Gallery {
  id: string
  name: string
  description?: string
  slug?: string
  is_public: boolean
  settings: Record<string, any>
  created_by?: string
  created_at: string
  updated_at: string
  
  // Relations
  creator?: Profile
  media?: GalleryMedia[]
}

export interface GalleryMedia {
  id: string
  gallery_id: string
  media_id: string
  caption?: string
  sort_order: number
  is_featured: boolean
  created_at: string
  
  // Relations
  gallery?: Gallery
  media?: Media
}

export interface ContentBlockMedia {
  id: string
  content_block_id: string
  media_id: string
  caption?: string
  sort_order: number
  is_featured: boolean
  created_at: string
  
  // Relations
  content_block?: ContentBlock
  media?: Media
}

// ======================================================================
// NAVIGATION SYSTEM
// ======================================================================

export interface Menu {
  id: string
  name: string
  location: string
  settings: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Relations
  items?: MenuItem[]
}

export interface MenuItem {
  id: string
  menu_id: string
  parent_id?: string
  title: string
  url?: string
  page_id?: string
  icon?: string
  css_class?: string
  target: string
  sort_order: number
  is_active: boolean
  created_at: string
  
  // Relations
  menu?: Menu
  parent?: MenuItem
  children?: MenuItem[]
  page?: Page
}

// ======================================================================
// CONTACT FORMS SYSTEM
// ======================================================================

export interface ContactForm {
  id: string
  name: string
  title?: string
  description?: string
  success_message: string
  email_recipients: string[]
  settings: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Relations
  fields?: FormField[]
  submissions?: FormSubmission[]
}

export interface FormField {
  id: string
  form_id: string
  field_type: FormFieldType
  name: string
  label: string
  placeholder?: string
  help_text?: string
  is_required: boolean
  validation_rules: Record<string, any>
  options: any[]
  sort_order: number
  is_active: boolean
  created_at: string
  
  // Relations
  form?: ContactForm
}

export interface FormSubmission {
  id: string
  form_id: string
  data: Record<string, any>
  ip_address?: string
  user_agent?: string
  user_id?: string
  is_read: boolean
  is_spam: boolean
  created_at: string
  
  // Relations
  form?: ContactForm
  user?: Profile
}

// ======================================================================
// TEAM MEMBERS SYSTEM
// ======================================================================

export interface TeamMember {
  id: string
  name: string
  title?: string
  bio?: string
  email?: string
  phone?: string
  image_id?: string
  social_links: Record<string, string>
  department?: string
  sort_order: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  
  // Relations
  image?: Media
}

// ======================================================================
// TESTIMONIALS SYSTEM
// ======================================================================

export interface Testimonial {
  id: string
  name: string
  title?: string
  content: string
  image_id?: string
  rating?: number
  is_featured: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  
  // Relations
  image?: Media
}

// ======================================================================
// FAQ SYSTEM
// ======================================================================

export interface FAQ {
  id: string
  question: string
  answer: string
  category?: string
  sort_order: number
  is_active: boolean
  view_count: number
  created_at: string
  updated_at: string
}

// ======================================================================
// LOCATION MANAGEMENT
// ======================================================================

export interface Location {
  id: string
  name: string
  address: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  coordinates?: [number, number]
  phone?: string
  email?: string
  hours: Record<string, any>
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// ======================================================================
// ENHANCED SITE SETTINGS
// ======================================================================

export interface ExtendedSiteSettings {
  // Basic Site Info
  site_name: string
  site_tagline: string
  site_description: string
  site_keywords: string[]
  site_logo_id?: string
  site_favicon_id?: string
  
  // Contact Information
  contact_email: string
  contact_phone: string
  contact_address: string
  
  // Social Media
  social_facebook: string
  social_twitter: string
  social_instagram: string
  social_linkedin: string
  social_youtube: string
  
  // Homepage Customization
  homepage_hero_title: string
  homepage_hero_subtitle: string
  homepage_hero_image_id?: string
  homepage_featured_categories: string[]
  
  // Email Settings
  smtp_host: string
  smtp_port: number
  smtp_username: string
  from_email: string
  from_name: string
  
  // Analytics
  google_analytics_id: string
  facebook_pixel_id: string
  google_tag_manager_id: string
  
  // Feature Toggles
  enable_comments: boolean
  enable_newsletter: boolean
  enable_business_directory: boolean
  enable_subscriptions: boolean
  enable_user_registration: boolean
  
  // Content Settings
  articles_per_page: number
  excerpt_length: number
  enable_article_galleries: boolean
  auto_publish_comments: boolean
  
  // Subscription Settings
  free_article_limit: number
  trial_period_days: number
  subscription_currency: string
  
  // Footer Content
  footer_about: string
  footer_copyright: string
  
  // Custom Code
  custom_css: string
  custom_js: string
  custom_head_html: string
}

// ======================================================================
// CMS ADMIN INTERFACES
// ======================================================================

// Page editor interface
export interface PageEditor {
  page: Page
  content_blocks: ContentBlock[]
  available_templates: Template[]
  seo_analysis: SEOAnalysis
  preview_url: string
}

export interface Template {
  name: string
  display_name: string
  description: string
  thumbnail_url?: string
  content_areas: ContentArea[]
}

export interface ContentArea {
  name: string
  type: ContentBlockType[]
  required: boolean
  max_blocks?: number
}

export interface SEOAnalysis {
  title_length: number
  description_length: number
  keywords_density: Record<string, number>
  readability_score: number
  suggestions: string[]
}

// Content block editor
export interface ContentBlockEditor {
  block: ContentBlock
  available_media: Media[]
  available_galleries: Gallery[]
  settings_schema: any // JSON schema for block settings
}

// Menu editor interface
export interface MenuEditor {
  menu: Menu
  items: MenuItem[]
  available_pages: Page[]
  drag_drop_enabled: boolean
}

// Form builder interface
export interface FormBuilder {
  form: ContactForm
  fields: FormField[]
  field_types: FormFieldTypeConfig[]
  validation_rules: ValidationRule[]
}

export interface FormFieldTypeConfig {
  type: FormFieldType
  label: string
  icon: string
  has_options: boolean
  validation_options: string[]
}

export interface ValidationRule {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'regex'
  default_value?: any
}

// Gallery manager interface
export interface GalleryManager {
  gallery: Gallery
  media: GalleryMedia[]
  available_media: Media[]
  display_settings: GalleryDisplaySettings
}

export interface GalleryDisplaySettings {
  layout: 'grid' | 'carousel' | 'masonry' | 'slider'
  columns: number
  spacing: number
  show_captions: boolean
  lightbox_enabled: boolean
  autoplay: boolean
  autoplay_delay: number
}

// Site settings interface
export interface SiteSettingsManager {
  general: GeneralSettings
  contact: ContactSettings
  social: SocialSettings
  homepage: HomepageSettings
  email: EmailSettings
  analytics: AnalyticsSettings
  features: FeatureSettings
  content: ContentSettings
  subscriptions: SubscriptionSettings
  appearance: AppearanceSettings
  advanced: AdvancedSettings
}

export interface GeneralSettings {
  site_name: string
  site_tagline: string
  site_description: string
  site_keywords: string[]
  site_logo: Media | null
  site_favicon: Media | null
  timezone: string
  language: string
}

export interface ContactSettings {
  contact_email: string
  contact_phone: string
  contact_address: string
  locations: Location[]
  contact_forms: ContactForm[]
}

export interface SocialSettings {
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
  tiktok: string
  pinterest: string
}

export interface HomepageSettings {
  hero_title: string
  hero_subtitle: string
  hero_image: Media | null
  featured_categories: string[]
  layout_style: 'modern' | 'classic' | 'magazine'
  show_breaking_news: boolean
  show_trending: boolean
}

export interface EmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  from_email: string
  from_name: string
  reply_to_email: string
}

export interface AnalyticsSettings {
  google_analytics_id: string
  facebook_pixel_id: string
  google_tag_manager_id: string
  hotjar_id: string
  enable_internal_analytics: boolean
}

export interface FeatureSettings {
  enable_comments: boolean
  enable_newsletter: boolean
  enable_business_directory: boolean
  enable_subscriptions: boolean
  enable_user_registration: boolean
  enable_social_login: boolean
  enable_push_notifications: boolean
}

export interface ContentSettings {
  articles_per_page: number
  excerpt_length: number
  enable_article_galleries: boolean
  auto_publish_comments: boolean
  enable_article_likes: boolean
  enable_article_sharing: boolean
  enable_related_articles: boolean
}

export interface SubscriptionSettings {
  free_article_limit: number
  trial_period_days: number
  subscription_currency: string
  stripe_publishable_key: string
  enable_free_trial: boolean
  paywall_style: 'soft' | 'hard' | 'freemium'
}

export interface AppearanceSettings {
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  custom_css: string
  logo_position: 'left' | 'center' | 'right'
  header_style: 'default' | 'minimal' | 'bold'
}

export interface AdvancedSettings {
  custom_js: string
  custom_head_html: string
  robots_txt: string
  htaccess_rules: string
  maintenance_mode: boolean
  debug_mode: boolean
}

// ======================================================================
// API INTERFACES
// ======================================================================

export interface CMSApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total?: number
    page?: number
    per_page?: number
    total_pages?: number
  }
}

export interface PageCreateRequest {
  title: string
  slug: string
  page_type: PageType
  content?: string
  meta_title?: string
  meta_description?: string
  is_published?: boolean
  template_name?: string
}

export interface PageUpdateRequest extends Partial<PageCreateRequest> {
  content_blocks?: ContentBlockCreateRequest[]
}

export interface ContentBlockCreateRequest {
  block_type: ContentBlockType
  title?: string
  content?: string
  settings?: Record<string, any>
  sort_order?: number
  media_ids?: string[]
}

export interface MenuCreateRequest {
  name: string
  location: string
  items: MenuItemCreateRequest[]
}

export interface MenuItemCreateRequest {
  title: string
  url?: string
  page_id?: string
  parent_id?: string
  sort_order?: number
}

export interface ContactFormCreateRequest {
  name: string
  title?: string
  description?: string
  email_recipients: string[]
  fields: FormFieldCreateRequest[]
}

export interface FormFieldCreateRequest {
  field_type: FormFieldType
  name: string
  label: string
  is_required?: boolean
  validation_rules?: Record<string, any>
  options?: any[]
}

// ======================================================================
// SEARCH AND FILTERING
// ======================================================================

export interface CMSSearchFilters {
  content_type?: 'page' | 'block' | 'media' | 'form' | 'team' | 'faq'
  search_query?: string
  page_type?: PageType[]
  is_published?: boolean
  created_by?: string[]
  date_from?: string
  date_to?: string
  tags?: string[]
}

export interface CMSSearchResult {
  id: string
  type: 'page' | 'block' | 'media' | 'form' | 'team' | 'faq'
  title: string
  excerpt?: string
  url: string
  thumbnail?: string
  created_at: string
  relevance_score?: number
}

// ======================================================================
// WORKFLOW AND PERMISSIONS
// ======================================================================

export interface CMSPermission {
  resource: string // 'pages', 'media', 'forms', etc.
  action: 'create' | 'read' | 'update' | 'delete' | 'publish'
  granted: boolean
}

export interface CMSWorkflow {
  id: string
  name: string
  steps: WorkflowStep[]
  is_active: boolean
}

export interface WorkflowStep {
  id: string
  name: string
  required_role: UserRole
  actions: string[]
  auto_approve?: boolean
}

// ======================================================================
// ANALYTICS AND REPORTING
// ======================================================================

export interface CMSAnalytics {
  pages: PageAnalytics[]
  forms: FormAnalytics[]
  media: MediaAnalytics
  search: SearchAnalytics
}

export interface PageAnalytics {
  page_id: string
  title: string
  views: number
  unique_views: number
  bounce_rate: number
  avg_time_on_page: number
  conversion_rate?: number
}

export interface FormAnalytics {
  form_id: string
  name: string
  submissions: number
  completion_rate: number
  spam_rate: number
  conversion_rate?: number
}

export interface MediaAnalytics {
  total_files: number
  total_size: number
  most_used: Media[]
  least_used: Media[]
  storage_usage_by_type: Record<MediaType, number>
}

export interface SearchAnalytics {
  top_queries: Array<{ query: string; count: number }>
  no_results_queries: string[]
  click_through_rate: number
}