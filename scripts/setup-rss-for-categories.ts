#!/usr/bin/env tsx

/**
 * Dynamic RSS Setup Script
 * Analyzes your existing categories and suggests/sets up RSS feeds
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

interface CategorySuggestion {
  category_name: string
  category_id: string
  suggested_feeds: Array<{name: string, url: string}>
}

/**
 * Get all existing categories
 */
async function getExistingCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .order('name')
  
  if (error) {
    console.error('❌ Error fetching categories:', error)
    return []
  }
  
  return categories || []
}

/**
 * Get RSS feed suggestions for categories
 */
async function getRSSFeedSuggestions() {
  const { data: suggestions, error } = await supabase
    .rpc('suggest_rss_sources_for_categories')
  
  if (error) {
    console.error('❌ Error getting RSS suggestions:', error)
    return []
  }
  
  return suggestions || []
}

/**
 * Parse suggested feeds from JSONB format
 */
function parseSuggestedFeeds(suggestedFeeds: any): Array<{name: string, url: string}> {
  if (!suggestedFeeds || !Array.isArray(suggestedFeeds)) return []
  
  return suggestedFeeds.map(feed => {
    if (typeof feed === 'string') {
      const parts = feed.split('|')
      return {
        name: parts[0] || feed,
        url: parts[1] || ''
      }
    }
    return { name: feed.toString(), url: '' }
  }).filter(feed => feed.url && feed.url.startsWith('http'))
}

/**
 * Create RSS source
 */
async function createRSSSource(
  name: string, 
  feedUrl: string, 
  categoryId: string, 
  categoryName: string,
  keywords: string[] = []
) {
  try {
    // Get a default author (admin or editor)
    const { data: defaultAuthor } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'editor'])
      .limit(1)
      .single()
    
    const { data, error } = await supabase
      .from('rss_sources')
      .insert({
        name,
        description: `${name} RSS feed for ${categoryName} category`,
        feed_url: feedUrl,
        category_id: categoryId,
        status: 'active',
        fetch_frequency_hours: 2,
        auto_publish: false, // Start with drafts
        default_author_id: defaultAuthor?.id,
        content_language: 'en',
        category_keywords: keywords,
        use_auto_categorization: true
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log(`   ⚠️  RSS source already exists: ${name}`)
        return null
      }
      throw error
    }
    
    console.log(`   ✅ Created RSS source: ${name}`)
    return data
  } catch (error) {
    console.error(`   ❌ Failed to create RSS source ${name}:`, error)
    return null
  }
}

/**
 * Setup RSS feeds based on category analysis
 */
async function setupRSSFeeds() {
  console.log('🔍 Analyzing your existing categories...')
  
  const categories = await getExistingCategories()
  
  if (categories.length === 0) {
    console.log('❌ No categories found. Please create some categories in your database first.')
    return
  }
  
  console.log(`📊 Found ${categories.length} categories:`)
  categories.forEach(cat => {
    console.log(`   • ${cat.name} (${cat.slug})`)
  })
  
  console.log('\n🤖 Getting RSS feed suggestions...')
  const suggestions = await getRSSFeedSuggestions()
  
  let totalCreated = 0
  
  for (const suggestion of suggestions) {
    console.log(`\n📰 Category: ${suggestion.category_name}`)
    
    const feeds = parseSuggestedFeeds(suggestion.suggested_feeds)
    
    if (feeds.length === 0) {
      console.log('   ℹ️  No automatic RSS suggestions for this category')
      console.log(`   💡 Search for "${suggestion.category_name} RSS feed" to find relevant sources`)
      continue
    }
    
    console.log(`   🎯 Found ${feeds.length} suggested RSS feeds`)
    
    for (const feed of feeds) {
      const keywords = [suggestion.category_name.toLowerCase()]
      const created = await createRSSSource(
        feed.name,
        feed.url,
        suggestion.category_id,
        suggestion.category_name,
        keywords
      )
      
      if (created) {
        totalCreated++
      }
      
      // Be nice to APIs
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log(`\n🎉 RSS Setup Complete!`)
  console.log(`📊 Created ${totalCreated} new RSS sources`)
  
  if (totalCreated > 0) {
    console.log(`\n🚀 Next steps:`)
    console.log(`   1. Run: npm run rss-fetch`)
    console.log(`   2. Check your articles - they should be categorized automatically!`)
    console.log(`   3. Enable auto-publish for sources you trust:`)
    console.log(`      UPDATE rss_sources SET auto_publish = true WHERE name = 'BBC Business';`)
  }
}

/**
 * Show current RSS status
 */
async function showRSSStatus() {
  const { data: sources } = await supabase
    .from('rss_sources')
    .select(`
      id,
      name,
      status,
      auto_publish,
      total_articles_imported,
      category:categories(name)
    `)
    .order('name')
  
  if (!sources || sources.length === 0) {
    console.log('📭 No RSS sources configured yet')
    return
  }
  
  console.log(`\n📊 Current RSS Sources (${sources.length} total):`)
  console.log('┌─────────────────────────────────┬──────────────┬────────────┬────────────┬─────────────┐')
  console.log('│ Name                            │ Category     │ Status     │ Auto-Pub   │ Articles    │')
  console.log('├─────────────────────────────────┼──────────────┼────────────┼────────────┼─────────────┤')
  
  sources.forEach(source => {
    const name = source.name.padEnd(31).substring(0, 31)
    const category = (source.category?.name || 'None').padEnd(12).substring(0, 12)
    const status = source.status.padEnd(10).substring(0, 10)
    const autoPub = (source.auto_publish ? 'Yes' : 'No').padEnd(10).substring(0, 10)
    const articles = source.total_articles_imported.toString().padStart(9)
    
    console.log(`│ ${name} │ ${category} │ ${status} │ ${autoPub} │ ${articles}   │`)
  })
  
  console.log('└─────────────────────────────────┴──────────────┴────────────┴────────────┴─────────────┘')
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--status') || args.includes('-s')) {
    await showRSSStatus()
    return
  }
  
  console.log('🚀 Dynamic RSS Feed Setup')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  await setupRSSFeeds()
  await showRSSStatus()
  
  console.log('\n💡 Pro Tips:')
  console.log('   • RSS feeds will auto-categorize based on content analysis')
  console.log('   • Add your own feeds with: INSERT INTO rss_sources (name, feed_url, ...)')
  console.log('   • Monitor with: npm run rss-fetch')
  console.log('   • View status with: tsx scripts/setup-rss-for-categories.ts --status')
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}