#!/usr/bin/env tsx

/**
 * Reset Database to Empty Script
 * 
 * This script completely resets the database to empty state by clearing ALL data:
 * - All articles and businesses 
 * - All user profiles and authentication
 * - All categories
 * - All advertisements
 * - All other content data
 * 
 * Use this when you want to start completely fresh.
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

async function resetDatabaseToEmpty() {
  console.log('🔥 RESETTING DATABASE TO COMPLETELY EMPTY STATE...')
  console.log('⚠️  WARNING: This will delete ALL data including users!')
  
  try {
    // Clear in reverse order of dependency to handle foreign key constraints
    console.log('\n📊 Step 1: Clearing dependent data...')
    
    // Clear advertisements (depends on businesses)
    const { error: adsError } = await supabase.from('advertisements').delete().gte('created_at', '1970-01-01')
    if (adsError && !adsError.message.includes('does not exist')) throw adsError
    console.log('   ✅ Cleared advertisements')
    
    // Clear testimonials and team_members (depends on media)
    const mediaDependent = ['testimonials', 'team_members']
    for (const table of mediaDependent) {
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
    
    console.log('\n📰 Step 2: Clearing content data...')
    
    // Clear article-related tables
    const articleTables = ['article_media', 'article_tags', 'articles']
    for (const table of articleTables) {
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
    
    // Clear business-related tables
    const businessTables = ['business_media', 'business_reviews', 'businesses']
    for (const table of businessTables) {
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
    
    // Clear galleries and media
    const mediaTables = ['gallery_media', 'galleries', 'media']
    for (const table of mediaTables) {
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
    
    console.log('\n👥 Step 3: Clearing user data...')
    
    // Get all user IDs before clearing profiles
    const { data: users } = await supabase.from('profiles').select('id')
    const userIds = users?.map(user => user.id) || []
    
    // Clear user-related tables
    const userTables = ['notifications', 'user_sessions', 'content_imports', 'audio_recordings', 'profiles']
    for (const table of userTables) {
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
    
    // Clear auth users (this requires admin access)
    if (userIds.length > 0) {
      console.log(`   🗑️  Removing ${userIds.length} auth users...`)
      for (const userId of userIds) {
        try {
          await supabase.auth.admin.deleteUser(userId)
        } catch (authError) {
          console.log(`   ⚠️  Could not delete auth user ${userId}:`, authError)
        }
      }
      console.log('   ✅ Cleared auth users')
    }
    
    console.log('\n🏷️  Step 4: Clearing categories and configuration...')
    
    // Clear RSS sources and tracking (depends on categories)
    const rssTables = ['rss_article_tracking', 'rss_sources']
    for (const table of rssTables) {
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
    
    // Clear categories and tags
    const categoryTables = ['categories', 'tags']
    for (const table of categoryTables) {
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
    
    // Clear remaining configuration tables
    const configTables = [
      'site_settings',
      'comments',
      'subscription_plans',
      'payment_records'
    ]
    
    for (const table of configTables) {
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
    
    console.log('\n🎉 DATABASE COMPLETELY RESET TO EMPTY STATE!')
    console.log('')
    console.log('🔥 ALL DATA CLEARED:')
    console.log('   ✅ Articles and content')
    console.log('   ✅ Businesses and advertisements') 
    console.log('   ✅ User profiles and authentication')
    console.log('   ✅ Categories and configuration')
    console.log('   ✅ Media and galleries')
    console.log('   ✅ All other data tables')
    console.log('')
    console.log('✨ Your database is now completely empty and ready for fresh setup!')
    console.log('')
    console.log('🚀 Next steps:')
    console.log('   1. Run: npx tsx scripts/add-test-users.ts (to create users)')
    console.log('   2. Set up categories and content as needed')
    
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    console.log('')
    console.log('💡 This might happen if:')
    console.log('   - Tables don\'t exist yet (database not set up)')
    console.log('   - Database connection issues')
    console.log('   - Permission problems with service role key')
    console.log('   - Some data has foreign key constraints')
    process.exit(1)
  }
}

// Execute the reset operation
resetDatabaseToEmpty().then(() => {
  console.log('🔥 Database reset complete!')
  process.exit(0)
})