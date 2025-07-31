import { createClient, createSupabaseBuildClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Calendar, Clock, User, Tag, Share2, Edit3 } from 'lucide-react'
import ArticleEditor from '@/components/articles/ArticleEditor'
import ShareButtons from '@/components/articles/ShareButtons'
import RelatedArticles from '@/components/articles/RelatedArticles'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

// Helper function to safely parse JSON content
function tryParseJSON(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

// Helper function to format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

async function getArticleData(slug: string) {
  const supabase = await createClient()
  
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      subtitle,
      excerpt,
      content,
      featured_image_url,
      published_at,
      views,
      likes,
      shares,
      read_time_minutes,
      status,
      seo_title,
      seo_description,
      location_name,
      metadata,
      created_at,
      updated_at,
      author:profiles!author_id(
        id,
        full_name,
        bio,
        avatar_url,
        role
      ),
      category:categories(
        id,
        name,
        slug,
        color
      ),
      tags:article_tags(
        tag:tags(
          id,
          name,
          slug
        )
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  
  if (error || !article) {
    return null
  }

  // Increment view count
  await supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)
  
  return article
}

// Build-time version for generateMetadata
async function getArticleDataBuildTime(slug: string) {
  const supabase = createSupabaseBuildClient()
  
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      subtitle,
      excerpt,
      seo_title,
      seo_description,
      featured_image_url,
      published_at,
      author:profiles!author_id(full_name),
      category:categories(name)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  
  if (error || !article) {
    return null
  }
  
  return article
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleDataBuildTime((await params).slug)
  
  if (!article) {
    return {
      title: 'Article Not Found'
    }
  }
  
  return {
    title: article.seo_title || `${article.title} | The Riverside Herald`,
    description: article.seo_description || article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author?.full_name || 'The Riverside Herald'],
      images: article.featured_image_url ? [article.featured_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
      images: article.featured_image_url ? [article.featured_image_url] : [],
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleData((await params).slug)
  
  if (!article) {
    notFound()
  }

  const readingTime = article.read_time_minutes || calculateReadingTime(article.content)
  const publishedDate = formatDate(article.published_at)
  
  return (
    <>
      <article className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative">
          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="relative h-96 md:h-[500px] overflow-hidden">
              <Image
                src={article.featured_image_url}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}
          
          {/* Article Header */}
          <div className="relative">
            <div className="container-wide py-8 md:py-12">
              <div className="max-w-4xl mx-auto">
                {/* Category Badge */}
                {article.category && (
                  <Link
                    href={`/category/${article.category.slug}`}
                    className="inline-block px-3 py-1 text-sm font-semibold rounded-full text-white mb-6"
                    style={{ backgroundColor: article.category.color }}
                  >
                    {article.category.name}
                  </Link>
                )}
                
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                  {article.title}
                </h1>
                
                {/* Subtitle */}
                {article.subtitle && (
                  <h2 className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-6">
                    {article.subtitle}
                  </h2>
                )}
                
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    {article.author?.avatar_url ? (
                      <Image
                        src={article.author.avatar_url}
                        alt={article.author.full_name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {article.author?.full_name || 'The Riverside Herald'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {article.author?.role === 'editor' ? 'Editor' : 'Staff Writer'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{publishedDate}</span>
                  </div>
                  
                  {/* Reading Time */}
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} min read</span>
                  </div>
                  
                  {/* Location */}
                  {article.location_name && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">📍</span>
                      <span>{article.location_name}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
                  <div className="flex items-center space-x-6">
                    {/* Stats */}
                    <span className="text-sm text-gray-500">
                      {article.views?.toLocaleString() || 0} views
                    </span>
                    <span className="text-sm text-gray-500">
                      {article.likes || 0} likes
                    </span>
                    <span className="text-sm text-gray-500">
                      {article.shares || 0} shares
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Share Button */}
                    <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    
                    {/* Edit Button - Only visible to admins and authors */}
                    <ArticleEditor article={article} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Article Content */}
        <div className="container-wide py-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              {/* Lead paragraph styling */}
              {article.excerpt && (
                <p className="lead text-xl text-gray-700 leading-relaxed mb-8 font-medium border-l-4 border-blue-500 pl-6 italic">
                  {article.excerpt}
                </p>
              )}
              
              {/* Main Content */}
              <div 
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="article-content"
              />
            </div>
            
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map(({ tag }) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Author Bio */}
            {article.author?.bio && (
              <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-start space-x-4">
                  {article.author.avatar_url ? (
                    <Image
                      src={article.author.avatar_url}
                      alt={article.author.full_name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About {article.author.full_name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {article.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
      
      {/* Share Buttons */}
      <ShareButtons 
        title={article.title}
        url={`/articles/${article.slug}`}
      />
      
      {/* Related Articles */}
      <RelatedArticles 
        currentArticleId={article.id}
        categoryId={article.category?.id}
      />
    </>
  )
}

// Generate static params for articles
export async function generateStaticParams() {
  const supabase = createSupabaseBuildClient()
  
  const { data: articles } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .limit(100) // Limit for build performance
  
  if (!articles) return []
  
  return articles.map((article) => ({
    slug: article.slug,
  }))
}