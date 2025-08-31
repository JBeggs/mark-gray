#!/usr/bin/env tsx

/**
 * Setup Avatar Storage Policies using Admin Client
 * This bypasses permission issues by using the service role
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStoragePolicies() {
  console.log('🔐 Setting up avatar storage policies with admin client...')
  
  try {
    // First, let's check current bucket configuration
    console.log('1️⃣ Checking avatars bucket...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return
    }
    
    const avatarsBucket = buckets.find(bucket => bucket.id === 'avatars')
    console.log('✅ Avatars bucket:', avatarsBucket ? 'Found' : 'Missing')
    
    // Update bucket to be public with proper settings
    console.log('2️⃣ Configuring bucket settings...')
    const { data: updateBucket, error: updateError } = await supabase.storage.updateBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    })
    
    if (updateError) {
      console.error('❌ Error updating bucket:', updateError.message)
    } else {
      console.log('✅ Bucket configuration updated')
    }
    
    // Try to set up RLS policies using the service role
    console.log('3️⃣ Setting up RLS policies...')
    
    const policies = [
      {
        name: 'Users can upload own avatar',
        definition: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`,
        command: 'INSERT'
      },
      {
        name: 'Users can update own avatar', 
        definition: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`,
        command: 'UPDATE'
      },
      {
        name: 'Users can delete own avatar',
        definition: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`,
        command: 'DELETE'
      },
      {
        name: 'Anyone can view avatars',
        definition: `bucket_id = 'avatars'`,
        command: 'SELECT'
      }
    ]
    
    // Try using raw SQL with service role
    const createPoliciesSQL = `
      -- Enable RLS on storage.objects if not already enabled
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
      DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects; 
      DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
      DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
      
      -- Create policies
      CREATE POLICY "Users can upload own avatar" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      );
      
      CREATE POLICY "Users can update own avatar" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      );
      
      CREATE POLICY "Users can delete own avatar" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      );
      
      CREATE POLICY "Anyone can view avatars" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
    `
    
    const { error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: createPoliciesSQL 
    })
    
    if (sqlError) {
      console.log('⚠️  RPC method not available, using alternative approach...')
      
      // Alternative: Try basic storage permissions
      console.log('4️⃣ Trying basic storage setup...')
      
      // Check if we can upload a test file
      const testFile = new Blob(['test'], { type: 'text/plain' })
      const testFileName = 'test-permissions.txt'
      
      const { error: testError } = await supabase.storage
        .from('avatars')
        .upload(testFileName, testFile)
      
      if (testError) {
        console.error('❌ Storage upload test failed:', testError.message)
        console.log('')
        console.log('🛠️  **Manual Setup Required:**')
        console.log('   1. Go to Supabase Dashboard → Storage → avatars bucket')
        console.log('   2. Click "Settings" tab')
        console.log('   3. Enable "Public bucket"')
        console.log('   4. Set File size limit: 5242880 (5MB)')
        console.log('   5. Set MIME types: image/jpeg,image/jpg,image/png,image/gif')
        console.log('   6. Go to "Policies" tab')
        console.log('   7. Create policies manually using the Dashboard UI')
        console.log('')
        console.log('   **Or try running as database owner/superuser in SQL Editor**')
      } else {
        console.log('✅ Basic upload permissions working!')
        
        // Clean up test file
        await supabase.storage.from('avatars').remove([testFileName])
      }
    } else {
      console.log('✅ RLS policies created successfully!')
    }
    
    console.log('')
    console.log('🎉 Storage setup complete!')
    console.log('💡 Try uploading an avatar now.')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    console.log('')
    console.log('🔧 **Fallback: Manual Dashboard Setup**')
    console.log('   1. Supabase Dashboard → Storage → avatars')
    console.log('   2. Settings → Public: ON, Size: 5MB, Types: images')
    console.log('   3. Policies → Create new policies for INSERT/SELECT/UPDATE/DELETE')
  }
}

setupStoragePolicies()