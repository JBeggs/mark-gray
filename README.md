# The Riverside Herald
*Modern Local News Platform & Business Directory*

## Overview

The Riverside Herald is a comprehensive local news platform that combines journalism with community business directory features. Built for local communities to stay informed and discover local businesses.

## Core Features

### 📰 News Platform
- **Article Management**: Rich article creation with SEO optimization, scheduling, and analytics
- **Multi-role System**: Admin, Editor, Author, Subscriber, and Premium Subscriber roles
- **Content Types**: Articles, galleries, videos, podcasts, and live blogs
- **Breaking News**: Real-time breaking news alerts and trending content
- **Categories & Tags**: Hierarchical content organization

### 🏢 Business Directory
- **Business Profiles**: Complete business listings with ratings, reviews, and media galleries
- **Location Services**: Geographic coordinates and mapping integration
- **Business Hours**: Structured business hours and contact information
- **Verification System**: Business verification and rating system
- **Services Listing**: Detailed service offerings and industry categorization

### 👥 User Management
- **Authentication**: Secure user authentication with Supabase
- **Role-based Access**: Different permission levels for different user types
- **Profile System**: Enhanced user profiles with social links and preferences
- **Subscription Tiers**: Free, subscriber, and premium subscription options

### 🖼️ Media Management
- **Gallery System**: Comprehensive image and media management
- **File Upload**: Drag-and-drop file uploads with automatic optimization
- **Media Organization**: Gallery creation and media categorization
- **Responsive Images**: Automatic image optimization for different screen sizes

## Technology Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel-ready with optimized build configuration
- **UI Components**: Custom components with Framer Motion animations
- **Icons**: Lucide React icon library

## Database Schema

The platform uses a comprehensive PostgreSQL schema with 15+ tables including:
- User profiles and authentication
- Articles with rich metadata
- Business directory with reviews
- Media and gallery management
- Categories, tags, and content organization
- Comments and engagement tracking

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/JBeggs/mark.gray.git
cd mark-gray
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create `.env.local` with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Set up database**
Apply the database schema from `src/lib/database.sql` in your Supabase SQL Editor

5. **Import sample data** (optional)
```bash
npm run fresh-start
```

6. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run fresh-start` - Clear database and import sample data
- `npm run clear-db` - Clear all database content
- `npm run import-enhanced` - Import comprehensive sample data

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── articles/       # Article pages and listings
│   ├── businesses/     # Business directory pages
│   ├── admin/          # Admin panel routes
│   └── profile/        # User profile pages
├── components/         # React components
│   ├── articles/       # Article-related components
│   ├── businesses/     # Business directory components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── lib/                # Utilities and configurations
│   ├── database.sql    # Database schema
│   ├── types.ts        # TypeScript type definitions
│   └── supabase.ts     # Supabase client configuration
└── styles/             # Global styles and CSS
```

## Current Status

### ✅ Implemented
- Complete news article system
- Business directory with reviews and ratings
- User authentication and role management
- Media galleries and file management
- Responsive frontend with modern UI
- Database schema with comprehensive relationships

### 🔧 In Development
- Admin panel interfaces
- Advanced content management features
- Analytics and reporting
- Enhanced SEO optimization

### 📋 Planned
- Social media integration
- Newsletter system
- Advanced search functionality
- Mobile app companion

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Private - All rights reserved

## Support

For technical support or questions about the platform, please refer to the documentation in the `/docs` directory or contact the development team.
