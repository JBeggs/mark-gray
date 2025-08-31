import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Calendar, Clock, User, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Articles | The Riverside Herald',
  description: 'Browse all news articles from The Riverside Herald. Stay informed with our comprehensive coverage of local news, business, sports, and community events.',
}

// Helper function to format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

async function getArticles() {
  const supabase = await createClient()
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image_url,
      published_at,
      content,
      views,
      likes,
      author:profiles!author_id(
        full_name,
        avatar_url
      ),
      category:categories(
        name,
        slug,
        color
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return articles || []
}

async function getCategories() {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, color')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories || []
}

export default async function ArticlesPage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getCategories()
  ])

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              All Articles
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stay informed with our comprehensive coverage of local news, business, sports, and community events.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="border-b border-gray-200 py-6">
        <div className="container-wide">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/articles"
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              All Articles
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: `${category.color}20`,
                  color: category.color
                }}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container-wide py-12">
        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="md:flex">
                {/* Featured Image */}
                <div className="md:w-1/2 relative h-64 md:h-80">
                  {featuredArticle.featured_image_url ? (
                    <Image
                      src={featuredArticle.featured_image_url}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">
                        {featuredArticle.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Category Badge */}
                  {featuredArticle.category && (
                    <div className="absolute top-4 left-4">
                      <span
                        className="px-3 py-1 text-sm font-semibold text-white rounded-full"
                        style={{ backgroundColor: (featuredArticle.category as any)?.color || '#3B82F6' }}
                      >
                        {(featuredArticle.category as any)?.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <Link href={`/articles/${featuredArticle.slug}`}>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                      {featuredArticle.title}
                    </h3>
                  </Link>

                  {featuredArticle.excerpt && (
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                    {/* Author */}
                    <div className="flex items-center space-x-2">
                      {(featuredArticle.author as any)?.avatar_url ? (
                        <Image
                          src={(featuredArticle.author as any).avatar_url}
                          alt={(featuredArticle.author as any).full_name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>{(featuredArticle.author as any)?.full_name || 'Staff Writer'}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featuredArticle.published_at)}</span>
                    </div>

                    {/* Reading Time */}
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{calculateReadingTime(featuredArticle.content)} min read</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span>{featuredArticle.views?.toLocaleString() || 0} views</span>
                    <span>{featuredArticle.likes || 0} likes</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* Other Articles Grid */}
        {otherArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.map((article) => {
                const readingTime = calculateReadingTime(article.content)
                const publishedDate = formatDate(article.published_at)

                return (
                  <article
                    key={article.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <Link href={`/articles/${article.slug}`}>
                      {/* Article Image */}
                      <div className="relative h-48 overflow-hidden">
                        {article.featured_image_url ? (
                          <Image
                            src={article.featured_image_url}
                            alt={article.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">
                              {article.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        {/* Category Badge */}
                        {article.category && (
                          <div className="absolute top-4 left-4">
                            <span
                              className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                              style={{ backgroundColor: (article.category as any)?.color || '#3B82F6' }}
                            >
                              {(article.category as any)?.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Article Content */}
                      <div className="p-6">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        {article.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            {/* Author */}
                            <span>{(article.author as any)?.full_name || 'Staff Writer'}</span>
                            
                            {/* Date */}
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{publishedDate}</span>
                            </div>
                          </div>

                          {/* Reading Time */}
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{readingTime} min</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            {article.views?.toLocaleString() || 0} views • {article.likes || 0} likes
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Articles Found</h3>
            <p className="text-gray-600 mb-8">
              There are no published articles at the moment. Check back later!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}