#!/usr/bin/env tsx

/**
 * Add News24 Article
 * Scrapes a specific News24 article and adds it to the database
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to fetch and extract article content from News24
async function scrapeNews24Article(url: string) {
  console.log(`🌐 Fetching article from: ${url}`)
  
  try {
    const response = await fetch(url)
    const html = await response.text()
    
    // Extract article information using regex patterns
    // This is a basic scraper - for production you'd want to use a proper HTML parser
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const rawTitle = titleMatch?.[1] || 'News24 Article'
    // Clean up title (remove site name and decode HTML entities)
    const title = rawTitle
      .replace(/\s*\|\s*News24\s*$/i, '')
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()
    
    // Extract meta description for excerpt
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const excerpt = (descMatch?.[1] || '')
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
    
    // Extract main article image
    let featuredImage = ''
    
    // Try multiple patterns for finding the main article image
    const imagePatterns = [
      // Open Graph image
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      // Twitter card image
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      // Article image meta
      /<meta[^>]*property=["']article:image["'][^>]*content=["']([^"']+)["']/i,
      // First img tag in article content
      /<img[^>]*src=["']([^"']+)["'][^>]*>/i
    ]
    
    for (const pattern of imagePatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        featuredImage = match[1]
        // Make sure it's a full URL
        if (featuredImage.startsWith('/')) {
          const urlObj = new URL(url)
          featuredImage = `${urlObj.protocol}//${urlObj.host}${featuredImage}`
        }
        break
      }
    }
    
    console.log(`   📸 Found image: ${featuredImage || 'No image found'}`)
    
    // If no image found, use a fallback
    if (!featuredImage) {
      featuredImage = 'https://picsum.photos/800/600?random=news24'
    }
    
    // Extract article content - look for common News24 content patterns
    let content = ''
    
    // Try to find the article body - News24 uses various patterns
    const bodyPatterns = [
      /<div[^>]*class[^>]*article[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*data-module[^>]*ArticleBody[^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class[^>]*story-content[^>]*>([\s\S]*?)<\/div>/i
    ]
    
    for (const pattern of bodyPatterns) {
      const match = html.match(pattern)
      if (match) {
        content = match[1]
        break
      }
    }
    
    // If no structured content found, try to extract paragraphs
    if (!content) {
      const paragraphs = html.match(/<p[^>]*>.*?<\/p>/gi) || []
      // Filter out navigation, footer, and other non-content paragraphs
      const contentParagraphs = paragraphs.filter(p => {
        const text = p.replace(/<[^>]*>/g, '').trim()
        return text.length > 50 && 
               !text.includes('Sign up') && 
               !text.includes('Subscribe') &&
               !text.includes('Follow us') &&
               !text.includes('News24')
      })
      content = contentParagraphs.slice(0, 10).join('\n\n') // Take first 10 relevant paragraphs
    }
    
    // Clean up HTML content and decode HTML entities
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/<div[^>]*class[^>]*ad[^>]*>[\s\S]*?<\/div>/gi, '') // Remove ads
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) // Decode hex entities
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10))) // Decode decimal entities
      .replace(/&quot;/g, '"') // Decode quotes
      .replace(/&apos;/g, "'") // Decode apostrophes
      .replace(/&lt;/g, '<') // Decode less than
      .replace(/&gt;/g, '>') // Decode greater than
      .replace(/&amp;/g, '&') // Decode ampersands (do this last)
      .trim()
    
    // Extract publish date if available
    const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i)
    const publishDate = dateMatch?.[1] ? new Date(dateMatch[1]).toISOString() : new Date().toISOString()
    
    return {
      title,
      excerpt,
      content,
      publishDate,
      sourceUrl: url,
      featuredImage
    }
    
  } catch (error) {
    console.error('❌ Error scraping article:', error)
    throw error
  }
}

// Function to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .slice(0, 100) // Limit length
}

async function addNews24Article(articleUrl: string) {
  console.log('📰 Adding News24 article...')
  
  try {
    // Get Mark Grey as the article author (admin who can author articles)
    const { data: markGrey } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', 'mark.grey@example.com')
      .single()

    if (!markGrey) {
      console.error('❌ Mark Grey (mark.grey@example.com) not found.')
      console.error('   Please run: npx tsx scripts/add-test-users.ts first')
      return
    }

    console.log(`👤 Using author: ${markGrey.full_name} (${markGrey.email})`)

    // Get a category for news articles
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')

    const newsCategory = categories?.find(cat => 
      cat.name.toLowerCase().includes('news') || 
      cat.name.toLowerCase().includes('local')
    ) || categories?.[0]

    // Scrape the article
    const articleData = await scrapeNews24Article(articleUrl)
    
    const slug = createSlug(articleData.title)
    
    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      console.log('   ℹ️  Article already exists, skipping')
      return
    }

    const article = {
      title: articleData.title,
      slug: slug,
      excerpt: articleData.excerpt,
      content: articleData.content,
      featured_image_url: articleData.featuredImage,
      author_id: markGrey.id,
      category_id: newsCategory?.id || null,
      status: 'published',
      views: 0,
      published_at: articleData.publishDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single()

    if (error) throw error

    console.log('   ✅ Successfully added News24 article!')
    console.log(`   📰 Title: ${article.title}`)
    console.log(`   🔗 Slug: ${article.slug}`)
    console.log(`   📝 Content length: ${article.content.length} characters`)
    console.log(`   📅 Published: ${new Date(articleData.publishDate).toLocaleDateString()}`)
    console.log(`   🖼️  Image: ${article.featured_image_url}`)

  } catch (error) {
    console.error('   ❌ Failed to add News24 article:', error)
  }
}

async function main() {
  const args = process.argv.slice(2) // Get command line arguments
  
  if (args.length === 0) {
    console.log('📰 News24 Article Scraper')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Usage: npx tsx scripts/add-news24-article.ts <URL> [URL2] [URL3]...')
    console.log('')
    console.log('Examples:')
    console.log('  npx tsx scripts/add-news24-article.ts https://www.news24.com/southafrica/news/article1')
    console.log('  npx tsx scripts/add-news24-article.ts https://www.news24.com/article1 https://www.news24.com/article2')
    console.log('')
    console.log('Default (if no URL provided): Uses the debunking article about Durban beach')
    
    // Use default URL if none provided
    args.push('https://www.news24.com/southafrica/debunking/durban-beach-clip-wrongly-shared-as-russian-tsunami-disaster-20250802-0307')
  }
  
  console.log(`🚀 Adding ${args.length} News24 Article${args.length > 1 ? 's' : ''}...`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < args.length; i++) {
    const url = args[i]
    console.log(`\n[${i + 1}/${args.length}] Processing: ${url}`)
    
    try {
      await addNews24Article(url)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to process ${url}:`, error)
      errorCount++
    }
  }
  
  console.log('\n🎉 News24 Article Processing Complete!')
  console.log(`✅ Successfully added: ${successCount} articles`)
  if (errorCount > 0) {
    console.log(`❌ Failed to add: ${errorCount} articles`)
  }
  console.log('\n📍 You can now visit:')
  console.log('   • /articles (to see all articles)')
  console.log('\n📰 Source: News24.com')
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}