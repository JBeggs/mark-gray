#!/usr/bin/env tsx

/**
 * Clear Articles and Businesses Script
 * 
 * This script clears ONLY articles and businesses from the database.
 * It preserves:
 * - User profiles and authentication
 * - Categories
 * - Site settings
 * - Other configuration data
 * 
 * Use this when you want to clear content but keep users and setup.
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

async function clearArticlesAndBusinesses() {
  console.log('🧹 CLEARING ARTICLES AND BUSINESSES...')
  console.log('✨ Preserving users, categories, and configuration')
  
  try {
    // Clear in dependency order to handle foreign key constraints
    console.log('\n📊 Step 1: Clearing advertisements...')
    
    // Clear advertisements (depends on businesses)
    const { error: adsError } = await supabase.from('advertisements').delete().gte('created_at', '1970-01-01')
    if (adsError && !adsError.message.includes('does not exist')) throw adsError
    console.log('   ✅ Cleared advertisements')
    
    console.log('\n📰 Step 2: Clearing articles...')
    
    // Clear article-related tables first
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
    
    // Clear articles
    const { error: articlesError } = await supabase.from('articles').delete().gte('created_at', '1970-01-01')
    if (articlesError && !articlesError.message.includes('does not exist')) throw articlesError
    console.log('   ✅ Cleared articles')
    
    console.log('\n🏢 Step 3: Clearing businesses...')
    
    // Clear business-related tables first
    const businessRelatedTables = ['business_media', 'business_reviews']
    for (const table of businessRelatedTables) {
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
    
    // Clear businesses
    const { error: businessesError } = await supabase.from('businesses').delete().gte('created_at', '1970-01-01')
    if (businessesError && !businessesError.message.includes('does not exist')) throw businessesError
    console.log('   ✅ Cleared businesses')
    
    console.log('\n🎉 ARTICLES AND BUSINESSES CLEARED!')
    console.log('')
    console.log('🧹 CLEARED:')
    console.log('   ✅ All articles and article media')
    console.log('   ✅ All businesses and business data') 
    console.log('   ✅ All advertisements')
    console.log('')
    console.log('✨ PRESERVED:')
    console.log('   👥 User profiles and authentication')
    console.log('   🏷️  Categories and tags')
    console.log('   ⚙️  Site settings and configuration')
    console.log('')
    console.log('🚀 Ready to add fresh articles and businesses!')
    
  } catch (error) {
    console.error('❌ Error clearing articles and businesses:', error)
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
clearArticlesAndBusinesses().then(() => {
  console.log('🧹 Articles and businesses cleared!')
  process.exit(0)
})