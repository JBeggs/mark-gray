import { createClient, createSupabaseBuildClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Helper function to safely parse JSON content
function tryParseJSON(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

async function getPageData(slug: string) {
  const supabase = await createClient()
  
  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  
  if (error || !page) {
    return null
  }
  
  return page
}

// Build-time version that doesn't use cookies
async function getPageDataBuildTime(slug: string) {
  const supabase = createSupabaseBuildClient()
  
  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  
  if (error || !page) {
    return null
  }
  
  return page
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageDataBuildTime(slug) // Use build-time version
  
  if (!page) {
    return {
      title: 'Page Not Found'
    }
  }
  
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || '',
    keywords: page.meta_keywords || [],
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPageData(slug)
  
  if (!page) {
    notFound()
  }
  
  return (
    <div className="container-wide py-8">
      <article className="max-w-4xl mx-auto">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {page.title}
          </h1>
          
          {page.meta_description && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {page.meta_description}
            </p>
          )}
        </header>

        {/* Page Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Newsletter-specific enhancements */}
        {page.slug === 'newsletter' && (
          <div className="mt-12 bg-blue-50 rounded-xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Ready to Subscribe?
              </h3>
              <p className="text-blue-700 mb-6">
                Join thousands of Riverside residents staying informed with our newsletter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Subscribe
                </button>
              </div>
              <p className="text-sm text-blue-600 mt-3">
                Free forever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        )}

        {/* Contact-specific enhancements */}
        {page.slug === 'contact' && (
          <div className="mt-12 bg-gray-50 rounded-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Quick Contact
              </h3>
              <p className="text-gray-600">
                Need to reach us immediately? Use these quick contact options:
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg border">
                <div className="text-3xl mb-3">📞</div>
                <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-700">
                  (555) 123-4567
                </a>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border">
                <div className="text-3xl mb-3">📧</div>
                <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
                <a href="mailto:info@riversideherald.com" className="text-blue-600 hover:text-blue-700">
                  info@riversideherald.com
                </a>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border">
                <div className="text-3xl mb-3">📍</div>
                <h4 className="font-semibold text-gray-900 mb-2">Visit Us</h4>
                <p className="text-gray-600 text-sm">
                  123 Main Street<br />
                  Riverside, CA 92501
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page metadata */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <p>Last updated: {new Date(page.updated_at).toLocaleDateString()}</p>
          </div>
        </footer>
      </article>
    </div>
  )
}

// Generate static params for known pages
export async function generateStaticParams() {
  const supabase = createSupabaseBuildClient() // Use build client (no cookies)
  
  const { data: pages } = await supabase
    .from('pages')
    .select('slug')
    .eq('is_published', true)
    .neq('slug', 'home') // Exclude home page as it has its own route
  
  if (!pages) return []
  
  return pages.map((page) => ({
    slug: page.slug,
  }))
}