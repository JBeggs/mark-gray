#!/usr/bin/env tsx

/**
 * Clear Database Script for Modern News Platform
 * 
 * This script clears all data from the Supabase database tables in the correct order
 * to handle foreign key constraints. This is useful for development and testing.
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

async function clearDatabase() {
  console.log('🗑️  CLEARING DATABASE...')
  
  try {
    // Clear tables in reverse order of dependency to handle foreign key constraints
    
    console.log('   Clearing CMS content...')
    
    // Clear content block media relationships
    await supabase.from('content_block_media').delete().gt('id', '0')
    console.log('   ✅ Cleared content_block_media')
    
    // Clear gallery media relationships  
    await supabase.from('gallery_media').delete().gt('id', '0')
    console.log('   ✅ Cleared gallery_media')
    
    // Clear article media relationships
    await supabase.from('article_media').delete().gt('id', '0')
    console.log('   ✅ Cleared article_media')
    
    // Clear business media relationships
    await supabase.from('business_media').delete().gt('id', '0')
    console.log('   ✅ Cleared business_media')
    
    // Clear content blocks
    await supabase.from('content_blocks').delete().gt('id', '0')
    console.log('   ✅ Cleared content_blocks')
    
    // Clear galleries
    await supabase.from('galleries').delete().gt('id', '0')
    console.log('   ✅ Cleared galleries')
    
    // Clear menu items
    await supabase.from('menu_items').delete().gt('id', '0')
    console.log('   ✅ Cleared menu_items')
    
    // Clear menus
    await supabase.from('menus').delete().gt('id', '0')
    console.log('   ✅ Cleared menus')
    
    // Clear form submissions
    await supabase.from('form_submissions').delete().gt('id', '0')
    console.log('   ✅ Cleared form_submissions')
    
    // Clear form fields
    await supabase.from('form_fields').delete().gt('id', '0')
    console.log('   ✅ Cleared form_fields')
    
    // Clear contact forms
    await supabase.from('contact_forms').delete().gt('id', '0')
    console.log('   ✅ Cleared contact_forms')
    
    // Clear pages
    await supabase.from('pages').delete().gt('id', '0')
    console.log('   ✅ Cleared pages')
    
    // Clear FAQs
    await supabase.from('faqs').delete().gt('id', '0')
    console.log('   ✅ Cleared faqs')
    
    // Clear testimonials
    await supabase.from('testimonials').delete().gt('id', '0')
    console.log('   ✅ Cleared testimonials')
    
    // Clear team members
    await supabase.from('team_members').delete().gt('id', '0')
    console.log('   ✅ Cleared team_members')
    
    // Clear locations
    await supabase.from('locations').delete().gt('id', '0')
    console.log('   ✅ Cleared locations')
    
    console.log('   Clearing business and article data...')
    
    // Clear business reviews
    await supabase.from('business_reviews').delete().gt('id', '0')
    console.log('   ✅ Cleared business_reviews')
    
    // Clear article tags
    await supabase.from('article_tags').delete().gt('article_id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✅ Cleared article_tags')
    
    // Clear user article interactions
    await supabase.from('user_article_interactions').delete().gt('id', '0')
    console.log('   ✅ Cleared user_article_interactions')
    
    // Clear comments
    await supabase.from('comments').delete().gt('id', '0')
    console.log('   ✅ Cleared comments')
    
    // Clear push notifications
    await supabase.from('push_notifications').delete().gt('id', '0')
    console.log('   ✅ Cleared push_notifications')
    
    // Clear newsletter campaigns
    await supabase.from('newsletter_campaigns').delete().gt('id', '0')
    console.log('   ✅ Cleared newsletter_campaigns')
    
    // Clear newsletter subscribers
    await supabase.from('newsletter_subscribers').delete().gt('id', '0')
    console.log('   ✅ Cleared newsletter_subscribers')
    
    // Clear advertisements
    await supabase.from('advertisements').delete().gt('id', '0')
    console.log('   ✅ Cleared advertisements')
    
    // Clear articles
    await supabase.from('articles').delete().gt('id', '0')
    console.log('   ✅ Cleared articles')
    
    // Clear businesses
    await supabase.from('businesses').delete().gt('id', '0')
    console.log('   ✅ Cleared businesses')
    
    console.log('   Clearing subscription and payment data...')
    
    // Clear payments
    await supabase.from('payments').delete().gt('id', '0')
    console.log('   ✅ Cleared payments')
    
    // Clear user subscriptions
    await supabase.from('user_subscriptions').delete().gt('id', '0')
    console.log('   ✅ Cleared user_subscriptions')
    
    console.log('   Clearing user data...')
    
    // Clear author profiles
    await supabase.from('author_profiles').delete().gt('id', '0')
    console.log('   ✅ Cleared author_profiles')
    
    // Clear content imports
    await supabase.from('content_imports').delete().gt('id', '0')
    console.log('   ✅ Cleared content_imports')
    
    // Clear audio recordings
    await supabase.from('audio_recordings').delete().gt('id', '0')
    console.log('   ✅ Cleared audio_recordings')
    
    // Clear analytics events
    await supabase.from('analytics_events').delete().gt('id', '0')
    console.log('   ✅ Cleared analytics_events')
    
    // Clear media files
    await supabase.from('media').delete().gt('id', '0')
    console.log('   ✅ Cleared media')
    
    // Clear tags
    await supabase.from('tags').delete().gt('id', '0')
    console.log('   ✅ Cleared tags')
    
    // Clear profiles (but keep auth.users - those need to be cleared manually from Supabase dashboard if needed)
    await supabase.from('profiles').delete().gt('id', '0')
    console.log('   ✅ Cleared profiles')
    
    // Note: We don't clear categories, subscription_plans, site_settings, or redirects 
    // as these are typically seed data that should persist
    
    console.log('🎉 DATABASE CLEARED SUCCESSFULLY!')
    console.log('')
    console.log('ℹ️  Note: The following tables were preserved:')
    console.log('   - categories (seed data)')
    console.log('   - subscription_plans (seed data)')
    console.log('   - site_settings (configuration)')
    console.log('   - redirects (SEO configuration)')
    console.log('')
    console.log('🔐 Auth users in Supabase Auth must be cleared manually from the dashboard if needed.')
    
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    process.exit(1)
  }
}

// Execute the clear operation
clearDatabase()