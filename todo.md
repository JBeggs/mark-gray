# Avatar Upload Setup - TODO

## 🚨 Current Issue
Avatar uploads are failing with `403 Unauthorized` and `new row violates row-level security policy` error.

**Root Cause:** Supabase Storage RLS policies are not configured for the `avatars` bucket.

---

## ✅ What's Already Done

- ✅ **Avatar upload functionality** implemented in `PersonalInfoSection.tsx`
- ✅ **File validation** (JPG/PNG/GIF, max 5MB)
- ✅ **Avatars bucket** created in Supabase Storage
- ✅ **Bucket configuration** (public, size limits, MIME types)
- ✅ **Upload UI** with loading states and error handling

---

## 🔧 Required Fix: Storage RLS Policies

### Option A: Quick Fix (2 minutes) ⚡
**Temporarily disable RLS for testing:**

1. **Go to:** https://supabase.com/dashboard
2. **Click:** SQL Editor
3. **Run this SQL:**
   ```sql
   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
   ```
4. **Test avatar upload** - should work immediately!

⚠️ **Note:** This is temporary - re-enable RLS with proper policies later for production.

---

### Option B: Proper RLS Setup (5 minutes) 🔐
**Create proper Row Level Security policies:**

#### Step 1: Go to Storage Policies
1. **Open:** https://supabase.com/dashboard
2. **Select your project**
3. **Click:** "Storage" (left sidebar)
4. **Click:** "Policies" tab

#### Step 2: Create Upload Policy
1. **Click:** "New Policy"
2. **Select:** "For INSERT operations"
3. **Fill in:**
   - **Policy name:** `Users can upload own avatar`
   - **Target roles:** ✅ `authenticated`
   - **WITH CHECK expression:**
     ```sql
     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
     ```
4. **Click:** "Save"

#### Step 3: Create View Policy
1. **Click:** "New Policy"
2. **Select:** "For SELECT operations"
3. **Fill in:**
   - **Policy name:** `Anyone can view avatars`
   - **Target roles:** ✅ `authenticated` ✅ `anon`
   - **USING expression:**
     ```sql
     bucket_id = 'avatars'
     ```
4. **Click:** "Save"

#### Step 4: Create Update Policy (Optional)
1. **Click:** "New Policy"
2. **Select:** "For UPDATE operations"
3. **Fill in:**
   - **Policy name:** `Users can update own avatar`
   - **Target roles:** ✅ `authenticated`
   - **USING expression:**
     ```sql
     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
     ```
4. **Click:** "Save"

#### Step 5: Create Delete Policy (Optional)
1. **Click:** "New Policy"
2. **Select:** "For DELETE operations"  
3. **Fill in:**
   - **Policy name:** `Users can delete own avatar`
   - **Target roles:** ✅ `authenticated`
   - **USING expression:**
     ```sql
     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
     ```
4. **Click:** "Save"

---

## 🧪 Testing Steps

After completing either Option A or B:

1. **Login** to your site with any user account
2. **Navigate** to Profile page
3. **Click** "Edit Profile"
4. **Click** "Change Photo" button
5. **Select** an image file (JPG/PNG/GIF, under 5MB)
6. **Verify** upload works and image appears
7. **Click** "Save" to persist the avatar URL
8. **Refresh** page to confirm avatar persists

---

## 📁 Related Files

### Implementation Files:
- **`src/components/profile/PersonalInfoSection.tsx`** - Avatar upload UI & logic
- **`src/lib/types.ts`** - Profile interface with avatar_url field

### Setup Files:
- **`src/lib/setup-avatar-storage.sql`** - Complete RLS policies SQL
- **`scripts/setup-avatar-storage.ts`** - Bucket creation script
- **`scripts/setup-storage-policies-admin.ts`** - Admin policy setup script
- **`scripts/disable-storage-rls.ts`** - Temporary RLS disable script

---

## 🚀 Recommendation

**Start with Option A** to quickly test functionality, then implement Option B for proper security.

1. ✅ **Run Quick Fix** (disable RLS temporarily)
2. ✅ **Test avatar uploads** work properly
3. ✅ **Implement proper RLS policies** (Option B)
4. ✅ **Re-test** to ensure security is working
5. ✅ **Clean up** temporary scripts and files

---

## 📝 Notes

- **File Structure:** Avatars are stored as `{user_id}/avatar.{ext}` in the `avatars` bucket
- **Security:** RLS policies ensure users can only upload to their own folder
- **Public Access:** Anyone can view avatars (needed for displaying profile pictures)
- **File Limits:** 5MB max, images only (JPG/PNG/GIF)
- **Overwrite:** New uploads replace existing avatars (using `upsert: true`)

---

## ✅ Success Criteria

When complete, users should be able to:
- ✅ Upload profile pictures from the Profile page
- ✅ See instant preview of uploaded image
- ✅ Save profile with avatar persisting in database
- ✅ View avatars across the site (profile cards, etc.)
- ✅ Upload new avatars to replace existing ones
- ❌ Upload files that are too large or wrong format (proper validation)
- ❌ Upload to other users' folders (proper security)