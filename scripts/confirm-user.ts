#!/usr/bin/env tsx

/**
 * Manually confirm a user's email
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

async function confirmUser(email: string) {
  console.log(`✅ Confirming user: ${email}`)
  
  try {
    // Get the user first
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error('❌ User not found!')
      return
    }
    
    // Update user to confirm email
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    })
    
    if (error) {
      console.error('❌ Error confirming user:', error.message)
    } else {
      console.log('✅ User email confirmed successfully!')
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)
      console.log('🎉 User can now login!')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Confirm the test user
confirmUser('testuser@gmail.com')