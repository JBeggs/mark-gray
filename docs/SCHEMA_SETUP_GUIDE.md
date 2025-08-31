# 🗄️ Database Schema Setup Guide

## ⚠️ **IMPORTANT: Apply Schema Before Import**

The enhanced import script requires the new CMS database schema. You must apply these SQL files **in order** before running the import.

## 📋 **Step-by-Step Setup**

### **Step 1: Access Supabase SQL Editor**
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **"+ New query"**

### **Step 2: Apply Schema Files (IN ORDER)**

#### **File 1: Enhanced Database Schema** 
```sql
-- Copy and paste contents of: src/lib/cms-enhanced-database.sql
```
- Creates all new tables and columns
- Adds new fields to existing tables
- Sets up relationships and constraints

#### **File 2: Enhanced Security Policies**
```sql
-- Copy and paste contents of: src/lib/cms-enhanced-security.sql  
```
- Creates Row Level Security policies
- Sets up user permissions
- Protects sensitive data

#### **File 3: Enhanced Functions**
```sql
-- Copy and paste contents of: src/lib/cms-enhanced-functions.sql
```
- Creates database functions for CMS operations
- Adds admin panel functionality
- Sets up search and analytics

#### **File 4: Enhanced Storage**
```sql
-- Copy and paste contents of: src/lib/cms-enhanced-storage.sql
```
- Creates storage buckets for media
- Sets up storage policies
- Configures file upload permissions

### **Step 3: Verify Schema**
After applying all files, verify the schema:

```sql
-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Should show: id, created_at, updated_at, email, full_name, avatar_url, role, username, bio, social_links, preferences, is_verified

-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('galleries', 'team_members', 'testimonials', 'faqs', 'pages', 'content_blocks');
```

### **Step 4: Run Enhanced Import**
Only after schema is applied:

```bash
npm run fresh-start
```

## 🚨 **Common Issues**

### **Issue 1: Column doesn't exist**
```
Error: Could not find the 'bio' column of 'profiles'
```
**Solution**: Apply `cms-enhanced-database.sql` first

### **Issue 2: Table doesn't exist**
```
Error: relation "galleries" does not exist
```
**Solution**: Apply all schema files in order

### **Issue 3: Permission denied**
```
Error: permission denied for table
```
**Solution**: Apply `cms-enhanced-security.sql`

### **Issue 4: Function doesn't exist**
```
Error: function update_updated_at() does not exist
```
**Solution**: Apply `cms-enhanced-functions.sql`

## 🎯 **Quick Setup Commands**

### **Option A: Manual Setup (Recommended)**
1. Copy each SQL file content
2. Paste into Supabase SQL Editor  
3. Run each file in order
4. Verify schema
5. Run import

### **Option B: All-in-One File**
I can create a single combined SQL file if you prefer:

```sql
-- Combined schema file with all enhancements
-- (Would need to be created)
```

## ✅ **Verification Checklist**

Before running imports, verify:

- [ ] `profiles` table has `bio`, `username`, `social_links` columns
- [ ] `businesses` table has `slug`, `industry`, `rating` columns  
- [ ] `articles` table has `subtitle`, `seo_title`, `read_time_minutes` columns
- [ ] `galleries` table exists
- [ ] `team_members` table exists
- [ ] `pages` table exists
- [ ] `content_blocks` table exists
- [ ] Storage buckets are created
- [ ] RLS policies are active

## 🔄 **If You Want to Use Current Schema**

If you prefer to stick with your current basic schema, I can create a **compatibility import script** that works with your existing database structure.

**Choose one:**
1. **Apply enhanced schema** → Use enhanced import (recommended)
2. **Keep current schema** → Use compatibility import

Let me know which approach you prefer!