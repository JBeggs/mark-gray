import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock } from 'lucide-react'

interface RelatedArticlesProps {
  currentArticleId: string
  categoryId?: string
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

async function getRelatedArticles(currentArticleId: string, categoryId?: string) {
  const supabase = createClient()
  
  let query = supabase
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
      author:profiles!author_id(
        full_name
      ),
      category:categories(
        name,
        color
      )
    `)
    .eq('status', 'published')
    .neq('id', currentArticleId)
    .order('published_at', { ascending: false })
    .limit(3)

  // If we have a category, prioritize articles from the same category
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data: articles, error } = await query

  if (error || !articles || articles.length === 0) {
    // Fallback: get any recent articles if no category matches found
    const { data: fallbackArticles } = await supabase
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
        author:profiles!author_id(
          full_name
        ),
        category:categories(
          name,
          color
        )
      `)
      .eq('status', 'published')
      .neq('id', currentArticleId)
      .order('published_at', { ascending: false })
      .limit(3)

    return fallbackArticles || []
  }

  return articles
}

export default async function RelatedArticles({ currentArticleId, categoryId }: RelatedArticlesProps) {
  const relatedArticles = await getRelatedArticles(currentArticleId, categoryId)

  if (relatedArticles.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container-wide">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Related Articles
            </h2>
            <p className="text-lg text-gray-600">
              Continue reading with these related stories
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedArticles.map((article) => {
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
                            style={{ backgroundColor: article.category.color }}
                          >
                            {article.category.name}
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
                          <span>{article.author?.full_name || 'Staff Writer'}</span>
                          
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

                      {/* Views */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {article.views?.toLocaleString() || 0} views
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>

          {/* View More Articles */}
          <div className="text-center mt-12">
            <Link
              href="/articles"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}