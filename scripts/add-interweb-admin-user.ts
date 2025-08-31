#!/usr/bin/env tsx

/**
 * Add Interweb Solutions Admin User
 * Creates the admin@interweb-solutions.co.za account
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client with service role key to create users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createInterwebAdminUser() {
  console.log('👤 Creating Interweb Solutions admin user...')
  
  const user = {
    email: 'admin@interweb-solutions.co.za',
    password: 'InterwebAdmin123!',
    full_name: 'Interweb Solutions Admin',
    role: 'user',
    description: 'Business Owner - Interweb Solutions'
  }
  
  try {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .single()

    if (existing) {
      console.log('   ℹ️  Admin user already exists, updating business ownership...')
      
      // Update the business to use this admin account
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ owner_id: existing.id })
        .eq('slug', 'interweb-solutions')

      if (updateError) {
        console.error('   ❌ Failed to update business ownership:', updateError)
      } else {
        console.log('   ✅ Business ownership updated to admin account')
      }
      
      return existing
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name
      }
    })
    
    if (authError) {
      console.error(`   ❌ Auth creation failed: ${authError.message}`)
      return false
    }
    
    console.log(`   ✅ Auth user created: ${authData.user.id}`)
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.error(`   ❌ Profile creation failed: ${profileError.message}`)
      return false
    }
    
    console.log(`   ✅ Profile created with role: ${user.role}`)
    
    // Update the business to use this admin account
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ owner_id: authData.user.id })
      .eq('slug', 'interweb-solutions')

    if (updateError) {
      console.error('   ❌ Failed to update business ownership:', updateError)
    } else {
      console.log('   ✅ Business ownership updated to admin account')
    }
    
    return authData.user
    
  } catch (error) {
    console.error(`   ❌ Unexpected error: ${error}`)
    return false
  }
}

async function main() {
  console.log('🚀 Creating Interweb Solutions Admin User...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const result = await createInterwebAdminUser()
  
  if (result) {
    console.log('\n🎉 Interweb Solutions Admin User Created!')
    console.log('📧 Login Credentials:')
    console.log('   • Email: admin@interweb-solutions.co.za')
    console.log('   • Password: InterwebAdmin123!')
    console.log('\n💻 You can now login as the business owner!')
  } else {
    console.log('\n❌ Failed to create admin user')
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}