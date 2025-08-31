import { createClient, createSupabaseBuildClient } from '@/lib/supabase-server'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, TrendingUp } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published_at: string
  is_breaking_news: boolean
  is_trending: boolean
  location_name?: string
  read_time_minutes?: number
  views: number
  featured_media?: {
    file_url: string
    alt_text: string
  }
  author: {
    full_name: string
  }
  category: {
    name: string
    slug: string
  }
}

interface Business {
  id: string
  name: string
  slug: string
  description: string
  industry: string
  city: string
  rating: number
  logo_url?: string
  cover_image_url?: string
}

interface SiteSettings {
  site_name: string
  site_tagline: string
  breaking_news_enabled: boolean
}

async function getHomepageData() {
  try {
    const supabase = createSupabaseBuildClient()

    // Get site settings
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['site_name', 'site_tagline'])

    function tryParseJSON(value: string) {
      try {
        return JSON.parse(value)
      } catch {
        return value // Return as-is if not valid JSON
      }
    }

    const settings = settingsData?.reduce((acc, setting) => ({
      ...acc,
      [setting.key]: tryParseJSON(setting.value)
    }), {} as Record<string, any>) || {}

    // Get articles with basic joins
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id, title, slug, excerpt, published_at, featured_image_url,
        is_breaking_news, is_trending, views, read_time_minutes,
        author:profiles!articles_author_id_fkey(full_name),
        category:categories!articles_category_id_fkey(name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20)

    // Get businesses
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, slug, description, industry, city, rating, logo_url')
      .limit(6)

    // Separate articles by type
    const breakingNews = articles?.find(article => article.is_breaking_news) || null
    const featuredArticles = articles?.filter(article => !article.is_breaking_news).slice(0, 6) || []
    const trendingArticles = articles?.filter(article => article.is_trending).slice(0, 5) || []
    const recentArticles = articles?.slice(0, 8) || []

    return {
      settings,
      breakingNews,
      featuredArticles,
      trendingArticles,
      recentArticles,
      businesses: businesses || []
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      settings: {},
      breakingNews: null,
      featuredArticles: [],
      trendingArticles: [],
      recentArticles: [],
      businesses: []
    }
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getImageUrl(article?: any) {
  // Use actual featured image if available, otherwise fallback to placeholder
  if (article?.featured_image_url) {
    return article.featured_image_url
  }
  
  // Generate a consistent random seed based on article ID for consistent images
  const seed = article?.id ? parseInt(article.id.slice(-6), 16) : Math.floor(Math.random() * 1000)
  return `https://picsum.photos/800/600?random=${seed}`
}

function getBusinessImageUrl(business?: any) {
  // Use actual business logo if available
  if (business?.logo_url) {
    return business.logo_url
  }
  
  // Generate a consistent random seed based on business ID for consistent images
  const seed = business?.id ? parseInt(business.id.slice(-6), 16) : Math.floor(Math.random() * 1000)
  return `https://picsum.photos/300/300?random=${seed}`
}

export default async function HomePage() {
  const { settings, breakingNews, featuredArticles, trendingArticles, recentArticles, businesses } = await getHomepageData()

  const siteName = settings.site_name || 'The Riverside Herald'
  const tagline = settings.site_tagline || 'Your Local News Source'

  return (
    <div className="bg-white">
      {/* Breaking News Banner */}
      {breakingNews && (
        <div className="breaking-news">
          <div className="container-wide">
            <div className="flex items-center space-x-4">
              <span className="breaking-news-text">Breaking News</span>
              <Link href={`/articles/${breakingNews.slug}`} className="hover:underline">
                <span className="font-medium">{breakingNews.title}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h1 className="heading-xl mb-4">{siteName}</h1>
            <p className="text-xl text-neutral-600 mb-8">{tagline}</p>
          </div>

          {/* Featured Articles Grid */}
          {featuredArticles.length > 0 && (
            <div className="news-grid news-grid-main mb-16">
              {/* Main Featured Article */}
              <div className="lg:col-span-2 xl:col-span-2">
                <article className="card-elevated p-6">
                  <div className="relative mb-4">
                    <Image
                      src={getImageUrl(featuredArticles[0])}
                      alt={featuredArticles[0]?.title}
                      width={800}
                      height={400}
                      className="news-image-featured"
                    />
                    {featuredArticles[0]?.category && (
                      <span className="absolute top-4 left-4 tag tag-accent">
                        {(featuredArticles[0].category as any)?.name}
                      </span>
                    )}
                  </div>
                  <h2 className="heading-lg mb-3">
                    <Link href={`/articles/${featuredArticles[0]?.slug}`} className="hover:text-blue-600">
                      {featuredArticles[0]?.title}
                    </Link>
                  </h2>
                  <p className="body-lg mb-4">{featuredArticles[0]?.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <div className="flex items-center space-x-4">
                      <span>By {(featuredArticles[0]?.author as any)?.full_name || 'Staff Writer'}</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {featuredArticles[0]?.read_time_minutes || 5} min read
                      </span>
                    </div>
                    <time>{formatDate(featuredArticles[0]?.published_at)}</time>
                  </div>
                </article>
              </div>

              {/* Side Articles */}
              <div className="lg:col-span-1 xl:col-span-2 space-y-6">
                {featuredArticles.slice(1, 4).map((article) => (
                  <article key={article.id} className="card p-4">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={getImageUrl(article)}
                          alt={article.title}
                          width={120}
                          height={80}
                          className="w-20 h-16 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        {article.category && (
                          <span className="tag tag-primary mb-2">
                            {(article.category as any)?.name}
                          </span>
                        )}
                        <h3 className="heading-xs mb-2">
                          <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                            {article.title}
                          </Link>
                        </h3>
                        <div className="flex items-center text-xs text-neutral-500">
                          <span>{(article.author as any)?.full_name || 'Staff Writer'}</span>
                          <span className="mx-2">•</span>
                          <time>{new Date(article.published_at).toLocaleDateString()}</time>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending & Recent News */}
      <section className="py-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Trending Articles */}
            <div className="lg:col-span-2">
              <div className="section-header">
                <h2 className="section-title">Latest News</h2>
                <Link href="/articles" className="btn btn-secondary">View All</Link>
              </div>
              <div className="news-grid news-grid-secondary">
                {recentArticles.slice(0, 6).map((article) => (
                  <article key={article.id} className="card">
                    <div className="relative">
                      <Image
                        src={getImageUrl(article)}
                        alt={article.title}
                        width={400}
                        height={200}
                        className="news-image"
                      />
                      {article.category && (
                        <span className="absolute top-3 left-3 tag tag-primary">
                          {(article.category as any)?.name}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="heading-xs mb-2">
                        <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="body-sm mb-3 text-neutral-600 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{(article.author as any)?.full_name || 'Staff Writer'}</span>
                        <time>{new Date(article.published_at).toLocaleDateString()}</time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Trending */}
              {trendingArticles.length > 0 && (
                <div>
                  <h3 className="heading-sm mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                    Trending
                  </h3>
                  <div className="space-y-4">
                    {trendingArticles.map((article, index) => (
                      <article key={article.id} className="flex space-x-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm leading-snug mb-1">
                            <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                              {article.title}
                            </Link>
                          </h4>
                          <div className="text-xs text-neutral-500">
                            {(article.views || 0).toLocaleString()} views • {new Date(article.published_at).toLocaleDateString()}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Businesses */}
              {businesses.length > 0 && (
                <div>
                  <h3 className="heading-sm mb-4">Featured Businesses</h3>
                  <div className="space-y-4">
                    {businesses.slice(0, 4).map((business) => (
                      <article key={business.id} className="card p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Image
                              src={getBusinessImageUrl(business)}
                              alt={`${business.name} logo`}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">
                              <Link href={`/businesses/${business.slug}`} className="hover:text-blue-600">
                                {business.name}
                              </Link>
                            </h4>
                            <p className="text-xs text-neutral-600 mb-1">{business.industry}</p>
                            <div className="flex items-center">
                              <div className="flex text-yellow-400">
                                {'★'.repeat(Math.floor(business.rating || 0))}
                              </div>
                              <span className="text-xs text-neutral-500 ml-1">
                                {business.rating} • {business.city}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <Link href="/businesses" className="btn btn-secondary w-full mt-4">
                    View All Businesses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}