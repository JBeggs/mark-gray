#!/usr/bin/env tsx

/**
 * Clear Articles Script
 * 
 * This script clears ONLY articles from the database.
 * It preserves:
 * - User profiles and authentication
 * - Businesses and advertisements
 * - Categories and settings
 * 
 * Use this when you want to clear just articles.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

async function clearArticles() {
  console.log('📰 CLEARING ARTICLES...')
  console.log('✨ Preserving businesses, users, and configuration')
  
  try {
    console.log('\n📊 Step 1: Clearing article-related data...')
    
    // Clear article-related tables first (dependencies)
    const articleRelatedTables = ['article_media', 'article_tags']
    for (const table of articleRelatedTables) {
      try {
        const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01')
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ⚠️  Could not clear ${table}:`, error.message)
        } else if (!error) {
          console.log(`   ✅ Cleared ${table}`)
        }
      } catch (e) {
        // Table doesn't exist, ignore
      }
    }
    
    console.log('\n📰 Step 2: Clearing articles...')
    
    // Clear articles
    const { error: articlesError } = await supabase.from('articles').delete().gte('created_at', '1970-01-01')
    if (articlesError && !articlesError.message.includes('does not exist')) throw articlesError
    console.log('   ✅ Cleared articles')
    
    console.log('\n🎉 ARTICLES CLEARED!')
    console.log('')
    console.log('🧹 CLEARED:')
    console.log('   ✅ All articles and article media')
    console.log('   ✅ Article tags and relationships')
    console.log('')
    console.log('✨ PRESERVED:')
    console.log('   🏢 Businesses and advertisements')
    console.log('   👥 User profiles and authentication')
    console.log('   🏷️  Categories and tags')
    console.log('   ⚙️  Site settings and configuration')
    console.log('')
    console.log('🚀 Ready to add fresh articles!')
    
  } catch (error) {
    console.error('❌ Error clearing articles:', error)
    console.log('')
    console.log('💡 This might happen if:')
    console.log('   - Tables don\'t exist yet (database not set up)')
    console.log('   - Database connection issues')
    console.log('   - Permission problems with service role key')
    console.log('   - Some data has foreign key constraints')
    process.exit(1)
  }
}

// Execute the clear operation
clearArticles().then(() => {
  console.log('📰 Articles cleared!')
  process.exit(0)
})