#!/usr/bin/env tsx

/**
 * RSS Feed Processor
 * Fetches RSS feeds and converts them to articles in the database
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'
import * as cheerio from 'cheerio'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const parser = new Parser({
  customFields: {
    feed: ['language', 'copyright', 'image'],
    item: ['media:content', 'media:thumbnail', 'enclosure', 'description', 'content:encoded']
  }
})

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window
const purify = DOMPurify(window)

interface RSSSource {
  id: string
  name: string
  feed_url: string
  website_url: string
  category_id: string
  auto_publish: boolean
  default_author_id: string
  content_language: string
  fetch_frequency_hours: number
}

interface ProcessedArticle {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image_url?: string
  published_at: Date
  author_id: string
  category_id: string
  status: 'draft' | 'published'
  tags: string[]
  external_url?: string
  rss_data: {
    guid: string
    link: string
    pub_date: string
    source_name: string
  }
}

/**
 * Clean and sanitize HTML content
 */
function cleanContent(html: string): string {
  if (!html) return ''
  
  // Parse with cheerio for better HTML handling
  const $ = cheerio.load(html)
  
  // Remove unwanted elements
  $('script, style, iframe, object, embed, form, input, button').remove()
  $('div[class*="ad"], div[id*="ad"], .advertisement, .ads').remove()
  $('[style*="display: none"], [style*="visibility: hidden"]').remove()
  
  // Clean up tracking pixels and social media widgets
  $('img[width="1"], img[height="1"], img[src*="pixel"], img[src*="beacon"]').remove()
  $('div[class*="social"], div[class*="share"], div[class*="follow"]').remove()
  
  // Get cleaned HTML
  let cleaned = $.html()
  
  // Sanitize with DOMPurify
  cleaned = purify.sanitize(cleaned, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
    ALLOW_DATA_ATTR: false
  })
  
  return cleaned.trim()
}

/**
 * Extract excerpt from content
 */
function extractExcerpt(content: string, maxLength: number = 200): string {
  const $ = cheerio.load(content)
  const text = $.text().trim()
  
  if (text.length <= maxLength) return text
  
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

/**
 * Create URL-friendly slug
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length
}

/**
 * Extract image from RSS item
 */
function extractImage(item: any): string | undefined {
  // Try media:content
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url
  }
  
  // Try media:thumbnail
  if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url
  }
  
  // Try enclosure
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url
  }
  
  // Try to find image in content
  if (item.content || item['content:encoded']) {
    const content = item.content || item['content:encoded']
    const $ = cheerio.load(content)
    const firstImg = $('img').first().attr('src')
    if (firstImg && firstImg.startsWith('http')) {
      return firstImg
    }
  }
  
  // Try to find image in description
  if (item.description) {
    const $ = cheerio.load(item.description)
    const firstImg = $('img').first().attr('src')
    if (firstImg && firstImg.startsWith('http')) {
      return firstImg
    }
  }
  
  return undefined
}

/**
 * Extract tags from content and categories
 */
function extractTags(item: any): string[] {
  const tags: Set<string> = new Set()
  
  // Add categories as tags
  if (item.categories) {
    item.categories.forEach((cat: string) => {
      if (cat && cat.trim()) {
        tags.add(cat.trim().toLowerCase())
      }
    })
  }
  
  // Extract keywords from title and content
  const text = `${item.title || ''} ${item.description || ''}`
  const keywords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []
  
  keywords.forEach(keyword => {
    if (keyword.length > 3 && keyword.length < 20) {
      tags.add(keyword.toLowerCase())
    }
  })
  
  return Array.from(tags).slice(0, 10) // Limit to 10 tags
}

/**
 * Process RSS item into article format
 */
async function processRSSItem(item: any, source: RSSSource): Promise<ProcessedArticle | null> {
  try {
    if (!item.title || !item.link) {
      console.warn('⚠️  Skipping item without title or link')
      return null
    }
    
    // Get content - prefer full content over description
    const rawContent = item['content:encoded'] || item.content || item.description || ''
    const cleanedContent = cleanContent(rawContent)
    
    if (!cleanedContent || cleanedContent.length < 100) {
      console.warn('⚠️  Skipping item with insufficient content:', item.title)
      return null
    }
    
    const title = item.title.trim()
    const slug = createSlug(title)
    const excerpt = extractExcerpt(cleanedContent)
    const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
    const featuredImage = extractImage(item)
    const tags = extractTags(item)
    
    // Dynamic category assignment based on content and source keywords
    let categoryId = source.category_id
    
    // If source allows auto-categorization or has no fixed category, find best match
    if (!categoryId || source.use_auto_categorization) {
      try {
        const { data: dynamicCategory } = await supabase
          .rpc('find_best_category_for_content', {
            content_title: title,
            content_description: excerpt || item.description || '',
            feed_keywords: source.category_keywords || null
          })
        
        if (dynamicCategory) {
          categoryId = dynamicCategory
          console.log(`   🎯 Auto-categorized "${title}" based on content analysis`)
        }
      } catch (error) {
        console.warn('⚠️  Failed to auto-categorize, using source category:', error)
      }
    }
    
    return {
      title,
      slug,
      excerpt,
      content: cleanedContent,
      featured_image_url: featuredImage,
      published_at: publishedAt,
      author_id: source.default_author_id,
      category_id: categoryId,
      status: source.auto_publish ? 'published' : 'draft',
      tags,
      external_url: item.link,
      rss_data: {
        guid: item.guid || item.link,
        link: item.link,
        pub_date: item.pubDate || new Date().toISOString(),
        source_name: source.name
      }
    }
  } catch (error) {
    console.error('❌ Error processing RSS item:', error)
    return null
  }
}

/**
 * Check if article already exists
 */
async function articleExists(guid: string, link: string, sourceId: string): Promise<boolean> {
  const { data } = await supabase
    .from('rss_article_tracking')
    .select('id')
    .eq('rss_source_id', sourceId)
    .or(`original_guid.eq.${guid},original_link.eq.${link}`)
    .limit(1)
  
  return data && data.length > 0
}

/**
 * Create article and tracking record
 */
async function createArticle(article: ProcessedArticle, sourceId: string): Promise<boolean> {
  try {
    // Ensure unique slug
    let finalSlug = article.slug
    let counter = 1
    
    while (true) {
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', finalSlug)
        .limit(1)
      
      if (!existing || existing.length === 0) break
      
      finalSlug = `${article.slug}-${counter}`
      counter++
    }
    
    // Create article
    const { data: newArticle, error: articleError } = await supabase
      .from('articles')
      .insert({
        title: article.title,
        slug: finalSlug,
        excerpt: article.excerpt,
        content: article.content,
        featured_image_url: article.featured_image_url,
        published_at: article.published_at.toISOString(),
        author_id: article.author_id,
        category_id: article.category_id,
        status: article.status,
        metadata: {
          source: 'rss',
          external_url: article.external_url,
          rss_source: article.rss_data.source_name,
          imported_at: new Date().toISOString()
        }
      })
      .select('id')
      .single()
    
    if (articleError) {
      console.error('❌ Error creating article:', articleError)
      return false
    }
    
    // Create tracking record
    const { error: trackingError } = await supabase
      .from('rss_article_tracking')
      .insert({
        rss_source_id: sourceId,
        article_id: newArticle.id,
        original_guid: article.rss_data.guid,
        original_link: article.rss_data.link,
        original_pub_date: article.rss_data.pub_date
      })
    
    if (trackingError) {
      console.error('❌ Error creating tracking record:', trackingError)
      // Don't fail the whole operation for tracking errors
    }
    
    // Add tags if any
    if (article.tags.length > 0) {
      const tagInserts = article.tags.map(tagName => ({
        name: tagName,
        slug: createSlug(tagName)
      }))
      
      // Insert tags (ignore duplicates)
      await supabase
        .from('tags')
        .upsert(tagInserts, { onConflict: 'slug' })
      
      // Link article to tags
      const { data: tagData } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', article.tags)
      
      if (tagData) {
        const articleTags = tagData.map(tag => ({
          article_id: newArticle.id,
          tag_id: tag.id
        }))
        
        await supabase
          .from('article_tags')
          .insert(articleTags)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Error creating article:', error)
    return false
  }
}

/**
 * Process a single RSS source
 */
async function processRSSSource(source: RSSSource): Promise<{ success: boolean, newArticles: number, errors: string[] }> {
  const logId = crypto.randomUUID()
  const startTime = Date.now()
  const errors: string[] = []
  let newArticles = 0
  
  console.log(`\n📡 Processing RSS source: ${source.name}`)
  console.log(`   URL: ${source.feed_url}`)
  
  // Start fetch log
  await supabase
    .from('rss_fetch_logs')
    .insert({
      id: logId,
      rss_source_id: source.id,
      status: 'running'
    })
  
  try {
    // Parse RSS feed
    const feed = await parser.parseURL(source.feed_url)
    console.log(`   📄 Found ${feed.items.length} items in feed`)
    
    // Update source metadata
    await supabase
      .from('rss_sources')
      .update({
        feed_title: feed.title,
        feed_description: feed.description,
        feed_language: feed.language,
        feed_copyright: feed.copyright,
        feed_image_url: feed.image?.url,
        last_fetched_at: new Date().toISOString()
      })
      .eq('id', source.id)
    
    // Process each item
    for (const item of feed.items) {
      try {
        // Check if already exists
        const guid = item.guid || item.link
        if (await articleExists(guid, item.link, source.id)) {
          console.log(`   ⏭️  Skipping existing article: ${item.title}`)
          continue
        }
        
        // Process item
        const article = await processRSSItem(item, source)
        if (!article) continue
        
        // Create article
        if (await createArticle(article, source.id)) {
          newArticles++
          console.log(`   ✅ Created article: ${article.title}`)
        } else {
          errors.push(`Failed to create article: ${item.title}`)
        }
        
        // Rate limiting - be nice to the RSS source
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        const errorMsg = `Error processing item "${item.title}": ${error}`
        console.error(`   ❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }
    
    // Update successful fetch time
    await supabase
      .from('rss_sources')
      .update({
        last_successful_fetch_at: new Date().toISOString(),
        total_articles_imported: source.total_articles_imported + newArticles,
        last_error: null
      })
      .eq('id', source.id)
    
    // Complete fetch log
    await supabase
      .from('rss_fetch_logs')
      .update({
        fetch_completed_at: new Date().toISOString(),
        status: errors.length === 0 ? 'success' : 'partial',
        items_found: feed.items.length,
        items_new: newArticles,
        error_message: errors.length > 0 ? errors.join('; ') : null,
        fetch_duration_ms: Date.now() - startTime
      })
      .eq('id', logId)
    
    console.log(`   📊 Result: ${newArticles} new articles, ${errors.length} errors`)
    
    return { success: true, newArticles, errors }
    
  } catch (error) {
    const errorMsg = `Failed to fetch RSS feed: ${error}`
    console.error(`   ❌ ${errorMsg}`)
    errors.push(errorMsg)
    
    // Update error status
    await supabase
      .from('rss_sources')
      .update({
        last_error: errorMsg,
        last_fetched_at: new Date().toISOString()
      })
      .eq('id', source.id)
    
    // Complete fetch log with error
    await supabase
      .from('rss_fetch_logs')
      .update({
        fetch_completed_at: new Date().toISOString(),
        status: 'error',
        error_message: errorMsg,
        fetch_duration_ms: Date.now() - startTime
      })
      .eq('id', logId)
    
    return { success: false, newArticles: 0, errors }
  }
}

/**
 * Get due RSS sources
 */
async function getDueRSSSources(): Promise<RSSSource[]> {
  const { data, error } = await supabase
    .rpc('get_due_rss_sources')
  
  if (error) {
    console.error('❌ Error getting due RSS sources:', error)
    return []
  }
  
  // Get full source details
  const sourceIds = data.map((item: any) => item.id)
  if (sourceIds.length === 0) return []
  
  const { data: sources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('*')
    .in('id', sourceIds)
  
  if (sourcesError) {
    console.error('❌ Error getting RSS source details:', sourcesError)
    return []
  }
  
  return sources || []
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting RSS Feed Processor...')
  
  const sources = await getDueRSSSources()
  
  if (sources.length === 0) {
    console.log('✅ No RSS sources due for fetching at this time')
    return
  }
  
  console.log(`📡 Found ${sources.length} RSS sources due for fetching`)
  
  let totalNew = 0
  let totalErrors = 0
  
  for (const source of sources) {
    const result = await processRSSSource(source)
    totalNew += result.newArticles
    totalErrors += result.errors.length
    
    // Brief pause between sources
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n🎉 RSS Processing Complete!')
  console.log(`📊 Summary: ${totalNew} new articles created, ${totalErrors} errors encountered`)
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}