# The Riverside Herald - System Instructions

## System Overview

The Riverside Herald is a local news platform with integrated business directory. This document outlines how to use and manage the system.

## User Roles & Permissions

### 🔑 **Admin** (Full Access)
- Manage all content, users, and system settings
- Access to admin panel at `/admin`
- Can create, edit, delete articles and businesses
- User management and role assignment
- System configuration

### ✏️ **Editor** (Content Management)
- Create and edit articles
- Manage categories and tags
- Review and approve content
- Limited admin panel access

### 📝 **Author** (Content Creation)
- Create and edit own articles
- Upload media and create galleries
- Basic profile management

### 👤 **Subscriber** (Enhanced Access)
- Comment on articles
- Save articles for later
- Newsletter subscription
- Basic profile features

### 💎 **Premium Subscriber** (Full Access)
- All subscriber features
- Access to premium content
- Ad-free experience
- Priority support

### 🏢 **Business Owner** (Business Management)
- Create and manage business listings
- Upload business media and galleries
- Respond to reviews
- Update business information

## Content Management

### 📰 Articles

#### Creating Articles
1. **Login** as Author, Editor, or Admin
2. **Navigate** to `/admin/articles` or use profile dashboard
3. **Click** "New Article" button
4. **Fill in required fields:**
   - Title (required)
   - Content (required)
   - Category (optional but recommended)
   - Featured image (recommended)
   - SEO settings (title, description)

#### Article Features
- **Rich Text Editor**: Full formatting capabilities
- **Media Integration**: Embed images, videos, galleries
- **SEO Optimization**: Custom meta titles and descriptions
- **Scheduling**: Publish immediately or schedule for later
- **Categories & Tags**: Organize content for discovery
- **Breaking News**: Mark urgent articles as breaking news
- **Premium Content**: Restrict access to premium subscribers

#### Article Status
- **Draft**: Work in progress, not visible to public
- **Scheduled**: Set to publish at specific time
- **Published**: Live and visible to appropriate audience
- **Archived**: Removed from main listings but accessible via URL

### 🏢 Business Directory

#### Adding Businesses
1. **Business owners** can self-register
2. **Admins** can add businesses directly
3. **Required information:**
   - Business name
   - Description
   - Contact information
   - Location/address

#### Business Features
- **Rich Descriptions**: Support for formatted text with headers, bullet points, bold text
- **Media Galleries**: Multiple images per business
- **Business Hours**: Structured opening hours
- **Services Listing**: Categorized service offerings
- **Reviews & Ratings**: Customer feedback system
- **Verification**: Admin verification for trusted businesses

#### Business Description Formatting
The system supports basic markdown formatting:
- **Headers**: Use `## Header Text`
- **Bold Text**: Use `**Bold Text**`
- **Bullet Points**: Use `- List item`
- **Paragraphs**: Separate with double line breaks

Example:
```
## What Makes Us Special

**Unique Experiences:**
- Waterfront dining with stunning views
- Outdoor cinema experience
- Hiking trail access

**Food & Beverage:**
- Artisanal breakfast, lunch, and dinner
- Specialty coffee and cappuccinos
```

### 🖼️ Media Management

#### Uploading Media
1. **Drag and drop** files into upload areas
2. **Supported formats**: JPG, PNG, GIF, MP4, PDF
3. **Automatic optimization** for web delivery
4. **Alt text** for accessibility (recommended)

#### Gallery Creation
1. **Upload multiple images**
2. **Organize** with drag-and-drop sorting
3. **Add captions** for context
4. **Choose display style** (grid, carousel, masonry)

## User Management

### Registration Process
1. **Users** can self-register at `/signup`
2. **Email verification** required
3. **Default role**: User (can be upgraded by admin)
4. **Profile completion** encouraged for better experience

### Profile Management
- **Personal Information**: Name, bio, avatar
- **Social Links**: Connect social media profiles
- **Notification Preferences**: Control email notifications
- **Subscription Management**: Upgrade/downgrade plans

## Administrative Tasks

### Daily Operations
- **Review new content** for quality and compliance
- **Moderate comments** and user-generated content
- **Monitor system performance** and user activity
- **Respond to user inquiries** and support requests

### Content Moderation
- **Article approval** workflow for new authors
- **Comment moderation** to prevent spam
- **Business verification** for directory listings
- **Media review** for inappropriate content

### System Maintenance
- **Database backups** (automated via Supabase)
- **Performance monitoring** via admin dashboard
- **User support** through profile system
- **Content analytics** review

## Going Live Checklist

### 🔧 Technical Requirements
- [ ] **Database**: Supabase project active and configured
- [ ] **Environment Variables**: All `.env.local` variables set
- [ ] **Domain**: Custom domain configured (optional)
- [ ] **SSL Certificate**: HTTPS enabled
- [ ] **Performance**: Site speed optimized
- [ ] **SEO**: Meta tags and sitemaps configured

### 📝 Content Requirements
- [ ] **Sample Articles**: At least 5-10 articles published
- [ ] **Business Listings**: Local businesses added and verified
- [ ] **Categories**: Content categories defined
- [ ] **About Page**: Site information and contact details
- [ ] **Privacy Policy**: Legal compliance documentation
- [ ] **Terms of Service**: User agreement terms

### 👥 User Setup
- [ ] **Admin Account**: Primary admin user created
- [ ] **Editor Accounts**: Content management team setup
- [ ] **Test Users**: Different role types tested
- [ ] **Email System**: Notifications working properly

### 🎨 Design & UX
- [ ] **Logo**: Site branding in place
- [ ] **Colors**: Brand colors configured
- [ ] **Mobile**: Responsive design tested
- [ ] **Navigation**: Menu structure finalized
- [ ] **Footer**: Contact and legal links added

### 🔍 SEO & Analytics
- [ ] **Google Analytics**: Tracking code installed
- [ ] **Search Console**: Site submitted to Google
- [ ] **Meta Tags**: All pages have proper meta descriptions
- [ ] **Sitemap**: XML sitemap generated
- [ ] **Social Media**: Open Graph tags configured

## Deployment Options

### Vercel (Recommended)
1. **Connect** GitHub repository to Vercel
2. **Configure** environment variables in Vercel dashboard
3. **Deploy** automatically on git push
4. **Custom domain** setup (optional)

### Manual Deployment
1. **Build** the application: `npm run build`
2. **Upload** build files to web server
3. **Configure** web server for Next.js
4. **Set** environment variables on server

## Troubleshooting

### Common Issues

#### Database Connection
- **Check** Supabase project status
- **Verify** environment variables
- **Test** database connectivity

#### Image Upload Issues
- **Check** Supabase storage buckets
- **Verify** storage policies
- **Test** file upload permissions

#### Performance Issues
- **Monitor** database query performance
- **Optimize** images and media files
- **Check** server resources

### Support Resources
- **Documentation**: `/docs` directory
- **Database Schema**: `src/lib/database.sql`
- **Type Definitions**: `src/lib/types.ts`
- **Component Library**: `src/components/`

## Best Practices

### Content Creation
- **Write compelling headlines** that encourage clicks
- **Use high-quality images** with proper alt text
- **Optimize for SEO** with relevant keywords
- **Categorize content** for better organization
- **Engage with community** through comments

### Business Listings
- **Complete all profile fields** for better visibility
- **Upload high-quality photos** of business and products
- **Respond to reviews** professionally and promptly
- **Keep information current** (hours, contact, services)
- **Use descriptive, keyword-rich content**

### User Engagement
- **Encourage user registration** for better experience
- **Moderate comments** to maintain quality discussion
- **Feature quality content** on homepage
- **Send regular newsletters** to subscribers
- **Respond to user feedback** and suggestions

## Security Considerations

### Data Protection
- **User passwords** handled by Supabase Auth
- **Personal information** protected by RLS policies
- **File uploads** scanned for security
- **Database access** restricted by role

### Content Security
- **Input validation** on all forms
- **XSS protection** in content rendering
- **Image optimization** prevents malicious files
- **Comment moderation** prevents spam and abuse

## Future Enhancements

### Planned Features
- **Newsletter system** for subscriber engagement
- **Advanced search** with filters and sorting
- **Social media integration** for content sharing
- **Mobile app** for iOS and Android
- **E-commerce integration** for business directory

### Analytics & Reporting
- **Content performance** metrics
- **User engagement** tracking
- **Business directory** usage statistics
- **Revenue reporting** for premium features

---

## Quick Start Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run fresh-start        # Clear DB and import sample data
npm run clear-db          # Clear all database content
npm run import-enhanced   # Import comprehensive sample data

# Maintenance
npm run lint              # Check code quality
npm run type-check        # Verify TypeScript types
```

## Contact & Support

For technical issues or questions about system usage, refer to the documentation or contact the development team.

**Remember**: Always test changes in development before deploying to production.
