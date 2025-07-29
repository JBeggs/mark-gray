# 🧪 Local News Platform - Testing Guide

## 🚀 **QUICK START SETUP**

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized (2-3 minutes)
3. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key

### 2. **Set Up Environment Variables**
Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. **Set Up Database Schema**
In your Supabase dashboard:

1. Go to **SQL Editor**
2. Create a new query and paste the contents of `src/lib/database.sql`
3. Run the query ▶️
4. Create another query with contents of `src/lib/database-functions.sql`
5. Run the second query ▶️

### 4. **Configure Storage Buckets**
In Supabase dashboard:

1. Go to **Storage**
2. Create bucket named `audio` (private)
3. Create bucket named `images` (public)
4. Create bucket named `imports` (private)

### 5. **Install Dependencies & Start**
```bash
cd local-news-platform
npm install
npm run dev
```

Visit: `http://localhost:3000`

---

## 🧪 **TESTING CHECKLIST**

### **🔐 AUTHENTICATION TESTING**

#### ✅ **User Registration**
- [ ] Click "Sign Up" button
- [ ] Enter email, password, and full name
- [ ] Verify account creation success
- [ ] Check toast notification appears
- [ ] Verify user is automatically logged in

#### ✅ **User Login**
- [ ] Click "Sign In" button  
- [ ] Enter credentials
- [ ] Verify successful login
- [ ] Check user menu appears in header
- [ ] Verify profile information is displayed

#### ✅ **Admin Access Control**
- [ ] Try accessing `/admin` while logged out → Should redirect to home
- [ ] Login as regular user and try `/admin` → Should redirect with error
- [ ] **To test admin access**: Manually update user role in Supabase:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
  ```
- [ ] Access `/admin` as admin → Should work successfully

---

### **📰 CONTENT MANAGEMENT TESTING**

#### ✅ **Homepage Features**
- [ ] Featured articles section loads
- [ ] Recent articles display properly
- [ ] Category grid shows all categories
- [ ] Business spotlight section works
- [ ] Ad banners display (if ads exist)

#### ✅ **Admin Dashboard**
*(Requires admin role)*
- [ ] Access `/admin` successfully
- [ ] Statistics cards show correct counts
- [ ] Recent activity feed displays
- [ ] Quick action buttons work

---

### **🎙️ VOICE RECORDER TESTING**

#### ✅ **Voice Recording Functionality**
- [ ] Go to `/voice-recorder` page
- [ ] Click "Start Recording" → Should request microphone permission
- [ ] **Grant microphone access when prompted**
- [ ] Speak clearly → Verify real-time transcription appears
- [ ] Click "Stop Recording" → Recording should stop
- [ ] Verify transcription accuracy
- [ ] Check audio file is uploaded to Supabase Storage
- [ ] Verify recording is saved to database

#### ✅ **Browser Compatibility**
Test voice recording on:
- [ ] Chrome/Chromium (recommended)
- [ ] Safari (limited support)
- [ ] Firefox (may have issues)
- [ ] Mobile browsers (Chrome Mobile recommended)

---

### **🔒 SECURITY TESTING**

#### ✅ **Route Protection**
- [ ] Try accessing `/admin` while not logged in
- [ ] Try accessing `/admin` as regular user
- [ ] Verify proper redirects and error messages

#### ✅ **Input Sanitization**
Try entering malicious content:
- [ ] `<script>alert('XSS')</script>` in text fields
- [ ] SQL injection attempts in forms
- [ ] Verify content is properly sanitized

#### ✅ **File Upload Security**
- [ ] Try uploading non-image files to image fields
- [ ] Try uploading files larger than 5MB
- [ ] Verify proper validation errors

---

### **📱 MOBILE TESTING**

#### ✅ **Responsive Design**
- [ ] Test on mobile screen sizes (375px+)
- [ ] Verify navigation menu works on mobile
- [ ] Check voice recorder works on mobile devices
- [ ] Test touch interactions

#### ✅ **Mobile Voice Recording**
**Critical for mobile users:**
- [ ] Open app on mobile device
- [ ] Navigate to voice recorder
- [ ] Grant microphone permissions
- [ ] Test recording and transcription
- [ ] Verify audio quality on mobile

---

### **⚡ PERFORMANCE TESTING**

#### ✅ **Loading Performance**
- [ ] Check homepage loads quickly
- [ ] Verify images load with proper optimization
- [ ] Test navigation between pages
- [ ] Check admin dashboard performance

#### ✅ **Caching Verification**
- [ ] Load featured articles twice → Should load faster second time
- [ ] Check network tab for cached requests
- [ ] Verify no unnecessary API calls

---

### **🛠️ ERROR HANDLING TESTING**

#### ✅ **Network Error Simulation**
- [ ] Disconnect internet while using app
- [ ] Verify proper error messages appear
- [ ] Test reconnection behavior

#### ✅ **Invalid Data Handling**
- [ ] Submit forms with invalid data
- [ ] Verify validation error messages
- [ ] Test edge cases (empty fields, etc.)

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **"Supabase client error"**
- ✅ Check `.env.local` file exists with correct variables
- ✅ Verify Supabase project URL and keys are correct
- ✅ Ensure no trailing slashes in URLs

#### **"Database table doesn't exist"**
- ✅ Run both SQL files in Supabase SQL Editor
- ✅ Check for any SQL execution errors
- ✅ Verify RLS policies are enabled

#### **Voice recording not working**
- ✅ Use HTTPS (required for microphone access)
- ✅ Grant microphone permissions in browser
- ✅ Test in Chrome/Chromium first
- ✅ Check browser console for errors

#### **Admin panel access denied**
- ✅ Manually set user role to 'admin' in database:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
  ```

#### **Build errors**
- ✅ Clear Next.js cache: `rm -rf .next`
- ✅ Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- ✅ Check for TypeScript errors: `npm run build`

---

## 📊 **TEST DATA SETUP**

### **Create Sample Content**
To properly test the app, create:

1. **Categories** (via Supabase dashboard):
   ```sql
   INSERT INTO categories (name, slug, description) VALUES 
   ('Local News', 'local-news', 'Breaking news and events'),
   ('Business', 'business', 'Local business updates'),
   ('Sports', 'sports', 'Local sports coverage');
   ```

2. **Sample Business**:
   ```sql
   INSERT INTO businesses (name, description, website_url, owner_id) VALUES 
   ('Test Business', 'A local test business', 'https://example.com', 'your-user-id');
   ```

3. **Sample Advertisement**:
   ```sql
   INSERT INTO advertisements (title, description, image_url, position, business_id, status, start_date, end_date) VALUES 
   ('Test Ad', 'Sample advertisement', 'https://via.placeholder.com/300x200', 'header', 'business-id', 'active', NOW(), NOW() + INTERVAL '30 days');
   ```

---

## 🎯 **TESTING PRIORITIES**

### **High Priority Tests** (Must Pass)
1. ✅ User authentication (signup/login)
2. ✅ Admin route protection
3. ✅ Voice recording functionality
4. ✅ Database connections
5. ✅ Basic content display

### **Medium Priority Tests**
1. ✅ Ad impression tracking
2. ✅ File upload validation
3. ✅ Mobile responsiveness
4. ✅ Performance optimization

### **Low Priority Tests**
1. ✅ Advanced admin features
2. ✅ Content import functionality
3. ✅ Advanced search features

---

## 🚀 **DEPLOYMENT TESTING**

Once local testing passes:

1. **Deploy to Vercel**:
   ```bash
   npm run build
   # If build succeeds, deploy to Vercel
   ```

2. **Test Production Environment**:
   - [ ] All features work in production
   - [ ] Environment variables are set correctly
   - [ ] HTTPS works properly (required for voice recording)
   - [ ] Database connections work from production

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are correct
3. Ensure Supabase project is properly configured
4. Test in Chrome/Chromium browser first
5. Check network connectivity

**Happy Testing! 🎉** 