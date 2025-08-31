#!/usr/bin/env tsx

/**
 * List recent users to see what's actually in the database
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function listRecentUsers() {
  console.log('📋 Listing recent users...')
  
  // Get auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError.message)
    return
  }
  
  console.log(`\n👥 Found ${authUsers.users.length} auth users:`)
  
  // Sort by creation date (newest first)
  const usersByDate = authUsers.users.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  usersByDate.slice(0, 10).forEach((user, index) => {
    const createdAt = new Date(user.created_at).toLocaleString()
    const confirmed = user.email_confirmed_at ? '✅ Confirmed' : '❌ Not confirmed'
    console.log(`${index + 1}. ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Created: ${createdAt}`)
    console.log(`   Status: ${confirmed}`)
    console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`)
    console.log('')
  })
  
  // Check profiles table
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError.message)
  } else {
    console.log(`\n👤 Found ${profiles.length} profiles:`)
    profiles.forEach((profile, index) => {
      const createdAt = new Date(profile.created_at).toLocaleString()
      console.log(`${index + 1}. ${profile.email}`)
      console.log(`   Name: ${profile.full_name}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Created: ${createdAt}`)
      console.log('')
    })
  }
}

listRecentUsers()