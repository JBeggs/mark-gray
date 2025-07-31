#!/usr/bin/env tsx

/**
 * Enhanced CMS Data Import Script for Modern News Platform
 * 
 * This script populates the database with comprehensive sample data including:
 * - Enhanced user profiles with social links and bios
 * - Author profiles with expertise areas
 * - Local businesses with complete information and galleries
 * - News articles with multiple images and enhanced metadata
 * - Image galleries for all content types
 * - Dynamic pages (Home, About, Contact, etc.)
 * - Content blocks and flexible page layouts
 * - Navigation menus and site structure
 * - Contact forms with custom fields
 * - Team members directory
 * - Testimonials and FAQs
 * - Site settings and configuration
 * - Comprehensive media management
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Utility functions
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const downloadImage = async (url: string, filename: string): Promise<string> => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const buffer = await response.arrayBuffer()
    const imagePath = path.join(__dirname, '..', 'temp_images', filename)
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(imagePath), { recursive: true })
    await fs.writeFile(imagePath, Buffer.from(buffer))
    
    return imagePath
  } catch (error) {
    console.warn(`⚠️  Failed to download ${url}:`, error)
    return ''
  }
}

const uploadToSupabase = async (
  filePath: string, 
  bucket: string, 
  fileName: string
): Promise<string | null> => {
  try {
    const fileBuffer = await fs.readFile(filePath)
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return publicUrl
  } catch (error) {
    console.warn(`⚠️  Failed to upload ${fileName}:`, error)
    return null
  }
}

// Enhanced sample data generators with comprehensive field coverage
const generateUsers = () => [
  {
    email: 'admin@riversideherald.com',
    username: 'smitchell',
    full_name: 'Sarah Mitchell',
    bio: 'Editor-in-Chief with 15 years of experience in local journalism. Passionate about community storytelling and investigative reporting.',
    role: 'admin' as const,
    avatar_url: 'https://images.unsplash.com/photo-1494175092949-5daa71bff31e?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    social_links: {
      twitter: 'https://twitter.com/sarahmitchell',
      linkedin: 'https://linkedin.com/in/sarahmitchell',
      email: 'sarah@riversideherald.com'
    },
    preferences: {
      email_notifications: true,
      newsletter_frequency: 'daily',
      theme: 'light'
    }
  },
  {
    email: 'editor@riversideherald.com', 
    username: 'mrodriguez',
    full_name: 'Michael Rodriguez',
    bio: 'Senior Editor specializing in local politics and government coverage. Former city council reporter with deep community connections.',
    role: 'editor' as const,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    social_links: {
      twitter: 'https://twitter.com/mrodriguezreports',
      linkedin: 'https://linkedin.com/in/michaelrodriguez'
    },
    preferences: {
      email_notifications: true,
      newsletter_frequency: 'weekly'
    }
  },
  {
    email: 'reporter1@riversideherald.com',
    username: 'echen',
    full_name: 'Emily Chen',
    bio: 'Community reporter covering education, local events, and human interest stories. Graduate of State University School of Journalism.',
    role: 'author' as const,
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    social_links: {
      twitter: 'https://twitter.com/emilyreports',
      instagram: 'https://instagram.com/emilyreports'
    },
    preferences: {
      email_notifications: true
    }
  },
  {
    email: 'reporter2@riversideherald.com',
    username: 'dthompson',
    full_name: 'David Thompson',
    bio: 'Sports and business reporter with expertise in local economic development. Covers high school sports and emerging businesses.',
    role: 'author' as const,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    social_links: {
      twitter: 'https://twitter.com/dthompsonsports',
      linkedin: 'https://linkedin.com/in/davidthompson'
    },
    preferences: {
      email_notifications: false
    }
  },
  {
    email: 'subscriber1@example.com',
    username: 'ljohnson',
    full_name: 'Lisa Johnson',
    bio: 'Local resident and community volunteer. Enjoys staying informed about neighborhood events and local business news.',
    role: 'subscriber' as const,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    is_verified: false,
    social_links: {
      facebook: 'https://facebook.com/lisajohnson'
    },
    preferences: {
      email_notifications: true,
      newsletter_frequency: 'weekly'
    }
  },
  {
    email: 'subscriber2@example.com',
    username: 'rkim',
    full_name: 'Robert Kim',
    bio: 'Small business owner and longtime Riverside resident. Interested in local politics and community development.',
    role: 'premium_subscriber' as const,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    social_links: {
      linkedin: 'https://linkedin.com/in/robertkim',
      website: 'https://kimconsulting.com'
    },
    preferences: {
      email_notifications: true,
      newsletter_frequency: 'daily'
    }
  }
]

const generateAuthorProfiles = () => [
  {
    email: 'admin@riversideherald.com',
    display_name: 'Sarah Mitchell',
    title: 'Editor-in-Chief',
    expertise_areas: ['investigative-reporting', 'local-government', 'community-affairs', 'editorial-management'],
    bio_long: 'Sarah Mitchell brings over 15 years of journalism experience to The Riverside Herald, where she has served as Editor-in-Chief for the past 5 years. She started her career at the State Capital Tribune covering state politics before returning to her hometown to focus on local journalism. Sarah holds a Master\'s degree in Journalism from State University and has won multiple awards for investigative reporting, including the Regional Press Association\'s Excellence in Journalism Award. When not chasing stories, she enjoys hiking with her family and volunteering at the local animal shelter.',
    contact_email: 'sarah@riversideherald.com',
    social_twitter: 'https://twitter.com/sarahmitchell',
    social_linkedin: 'https://linkedin.com/in/sarahmitchell',
    profile_image_url: 'https://images.unsplash.com/photo-1494175092949-5daa71bff31e?w=800&h=800&fit=crop&crop=face',
    byline_image_url: 'https://images.unsplash.com/photo-1494175092949-5daa71bff31e?w=150&h=150&fit=crop&crop=face',
    is_featured: true
  },
  {
    email: 'editor@riversideherald.com',
    display_name: 'Michael Rodriguez',
    title: 'Senior Editor & Political Reporter',
    expertise_areas: ['local-politics', 'government', 'public-policy', 'investigative-reporting'],
    bio_long: 'Michael Rodriguez has been covering local politics and government for The Riverside Herald for over 8 years. His in-depth reporting on city council proceedings and county government has helped keep residents informed about important policy decisions. Michael previously worked as a freelance journalist covering state politics and has a Bachelor\'s degree in Political Science from Regional University. He is known for his ability to make complex policy issues accessible to everyday readers.',
    contact_email: 'michael@riversideherald.com',
    social_twitter: 'https://twitter.com/mrodriguezreports',
    social_linkedin: 'https://linkedin.com/in/michaelrodriguez',
    profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&crop=face',
    byline_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    is_featured: true
  },
  {
    email: 'reporter1@riversideherald.com',
    display_name: 'Emily Chen',
    title: 'Community Reporter',
    expertise_areas: ['education', 'community-events', 'human-interest', 'local-culture'],
    bio_long: 'Emily Chen joined The Riverside Herald three years ago as a community reporter, bringing fresh perspectives to local storytelling. She specializes in education coverage, from school board meetings to student achievements, and has a talent for finding compelling human interest stories throughout the community. Emily graduated magna cum laude from State University\'s School of Journalism and previously interned at Metropolitan Daily News. She is passionate about highlighting diverse voices and celebrating community achievements.',
    contact_email: 'emily@riversideherald.com',
    social_twitter: 'https://twitter.com/emilyreports',
    social_instagram: 'https://instagram.com/emilyreports',
    profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop&crop=face',
    byline_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    is_featured: true
  },
  {
    email: 'reporter2@riversideherald.com',
    display_name: 'David Thompson',
    title: 'Sports & Business Reporter',
    expertise_areas: ['sports', 'business', 'economic-development', 'local-entrepreneurship'],
    bio_long: 'David Thompson covers the intersection of sports and business for The Riverside Herald, from high school athletics to local economic development. With a background in both journalism and business administration, David brings unique insights to his coverage of local entrepreneurs and business trends. He has been with the Herald for four years and previously covered regional sports for the County Sports Network. David is also an avid runner and coaches youth basketball in his spare time.',
    contact_email: 'david@riversideherald.com',
    social_twitter: 'https://twitter.com/dthompsonsports',
    social_linkedin: 'https://linkedin.com/in/davidthompson',
    profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&crop=face',
    byline_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    is_featured: false
  }
]

const generateBusinesses = () => [
  {
    name: "Miller's Family Diner",
    slug: "millers-family-diner",
    description: "Family-owned restaurant serving comfort food and homemade pies since 1985.",
    long_description: "Miller's Family Diner has been a cornerstone of the Riverside community for nearly four decades. What started as a small breakfast spot has grown into a beloved local institution, serving three generations of families with our signature comfort food recipes. Our menu features hearty breakfast offerings available all day, fresh-made soups, classic sandwiches, and our famous homemade pies. We pride ourselves on using locally sourced ingredients whenever possible and maintaining the warm, welcoming atmosphere that has made us a community gathering place.",
    industry: "Restaurant & Food Service",
    website_url: "https://millersdiner.com",
    phone: "(555) 123-4567",
    email: "info@millersdiner.com",
    address: "123 Main Street",
    city: "Riverside",
    state: "CA",
    zip_code: "12345",
    coordinates: [-118.2437, 34.0522],
    business_hours: {
      monday: "6:00 AM - 9:00 PM",
      tuesday: "6:00 AM - 9:00 PM", 
      wednesday: "6:00 AM - 9:00 PM",
      thursday: "6:00 AM - 9:00 PM",
      friday: "6:00 AM - 10:00 PM",
      saturday: "6:00 AM - 10:00 PM",
      sunday: "7:00 AM - 9:00 PM"
    },
    social_links: {
      facebook: "https://facebook.com/millersfamilydiner",
      instagram: "https://instagram.com/millersdiner",
      yelp: "https://yelp.com/biz/millers-family-diner"
    },
    services: ["Breakfast", "Lunch", "Dinner", "Takeout", "Catering", "Private Events", "Daily Specials"],
    is_verified: true,
    rating: 4.8,
    review_count: 267,
    seo_title: "Miller's Family Diner - Best Breakfast & Comfort Food in Riverside",
    seo_description: "Family-owned restaurant serving delicious comfort food and homemade pies since 1985. Open daily for breakfast, lunch, and dinner in downtown Riverside.",
    logo_url: "https://images.unsplash.com/photo-1553805730-bd01b19c1f9b?w=400&h=400&fit=crop",
    cover_image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop",
    gallery_images: [
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop"
    ]
  },
  {
    name: "GreenLeaf Auto Repair",
    slug: "greenleaf-auto-repair",
    description: "Trusted auto repair shop with certified mechanics specializing in both domestic and foreign vehicles.",
    long_description: "GreenLeaf Auto Repair has been serving the Riverside community for over 12 years with honest, reliable automotive service. Our ASE-certified mechanics have extensive experience working on all makes and models, from routine maintenance to complex engine repairs. We believe in transparent pricing and will always explain what work needs to be done and why. Our state-of-the-art diagnostic equipment ensures accurate problem identification, and we use only high-quality parts backed by our comprehensive warranty.",
    industry: "Automotive Repair & Service",
    website_url: "https://greenleafauto.com", 
    phone: "(555) 234-5678",
    email: "service@greenleafauto.com",
    address: "456 Oak Avenue",
    city: "Riverside",
    state: "CA",
    zip_code: "12346",
    coordinates: [-118.2520, 34.0485],
    business_hours: {
      monday: "7:00 AM - 6:00 PM",
      tuesday: "7:00 AM - 6:00 PM",
      wednesday: "7:00 AM - 6:00 PM",
      thursday: "7:00 AM - 6:00 PM",
      friday: "7:00 AM - 6:00 PM",
      saturday: "8:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    social_links: {
      facebook: "https://facebook.com/greenleafautorepair",
      google: "https://business.google.com/greenleafauto",
      nextdoor: "https://nextdoor.com/greenleafauto"
    },
    services: ["Oil Changes", "Brake Service", "Engine Repair", "Transmission Service", "Hybrid/Electric Vehicle Service", "State Inspections", "Tire Service", "AC Repair"],
    is_verified: true,
    rating: 4.9,
    review_count: 189,
    seo_title: "GreenLeaf Auto Repair - Trusted Mechanic in Riverside, CA",
    seo_description: "Expert auto repair services for all makes and models. ASE-certified mechanics, honest pricing, and hybrid/electric vehicle specialists in Riverside.",
    logo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    cover_image_url: "https://images.unsplash.com/photo-1486326658981-ed68abe5868e?w=1200&h=600&fit=crop",
    gallery_images: [
      "https://images.unsplash.com/photo-1487027440440-e37bcc830f2f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1580414292382-5bb57ba2f5b1?w=800&h=600&fit=crop"
    ]
  },
  {
    name: "Sunshine Bakery",
    description: "Artisan bakery featuring fresh breads, pastries, and custom cakes. All items baked daily using locally sourced ingredients.",
    website_url: "https://sunshinebakery.com",
    phone: "(555) 345-6789", 
    email: "orders@sunshinebakery.com",
    address: "789 Cherry Lane, Historic District",
    logo_url: "https://images.unsplash.com/photo-1517433367423-c7e5b0f9f7b9?w=400&h=400&fit=crop"
  },
  {
    name: "TechFix Solutions",
    description: "Computer and smartphone repair services. Quick turnaround times and fair prices. We also offer IT consulting for small businesses.",
    website_url: "https://techfixsolutions.com",
    phone: "(555) 456-7890",
    email: "support@techfixsolutions.com", 
    address: "321 Digital Drive, Tech Park",
    logo_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop"
  },
  {
    name: "Riverside Hardware",
    description: "Your neighborhood hardware store with everything you need for home improvement projects. Expert advice and quality tools.",
    website_url: "https://riversidehardware.com",
    phone: "(555) 567-8901",
    email: "info@riversidehardware.com",
    address: "654 River Road, Riverside",
    logo_url: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400&h=400&fit=crop"
  },
  {
    name: "Bella Vista Salon",
    description: "Full-service salon offering cuts, color, styling, and spa services. Our experienced stylists stay current with the latest trends.",
    website_url: "https://bellavistasalon.com",
    phone: "(555) 678-9012",
    email: "book@bellavistasalon.com",
    address: "987 Beauty Boulevard, Uptown",
    logo_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop"
  }
]

const generateArticles = () => [
  {
    title: "City Council Approves New Downtown Development Project",
    excerpt: "The ambitious $50 million mixed-use development will bring new housing, retail spaces, and a community center to the downtown core.",
    content: `The City Council voted unanimously last night to approve the highly anticipated downtown development project, marking a significant milestone in the city's urban renewal efforts.

The $50 million project, spearheaded by local developer Riverside Construction, will transform a currently vacant 5-acre lot into a vibrant mixed-use complex featuring:

- 120 affordable housing units
- 15,000 square feet of retail space
- A 10,000 square foot community center
- Underground parking for 200 vehicles
- Green spaces and pedestrian walkways

"This project represents our commitment to sustainable growth while maintaining the character that makes our downtown special," said Mayor Jennifer Walsh during the council meeting.

The development is expected to create approximately 300 construction jobs over the next two years, with an additional 150 permanent positions once completed. Construction is scheduled to begin in the spring, with the first phase opening in late 2025.

Local residents have expressed mixed reactions, with supporters praising the affordable housing component while some neighbors raised concerns about increased traffic and parking availability.

The project includes several environmental features, including solar panels, rainwater collection systems, and energy-efficient building materials, aligning with the city's climate action goals.`,
    featured_image_url: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&h=800&fit=crop",
    category_slug: "local-news",
    views: 342
  },
  {
    title: "Local High School Robotics Team Wins Regional Championship",
    excerpt: "The Riverside High Robotics Club defeated 45 other teams to claim the regional title and advance to the state competition.",
    content: `The Riverside High School Robotics Club made history this weekend by winning the Regional FIRST Robotics Competition, defeating 45 teams from across the tri-state area.

The team's robot, nicknamed "Storm Chaser," impressed judges with its precision engineering and innovative problem-solving approach during the three-day competition held at the Convention Center.

"We've been working on this robot since August," said team captain Maria Gonzalez, a senior at Riverside High. "Hundreds of hours in the workshop, countless iterations, and amazing teamwork brought us to this moment."

The competition challenged teams to build robots capable of:
- Autonomous navigation through complex obstacle courses
- Precise object manipulation and placement
- Collaborative tasks with alliance partners
- Rapid response to changing game conditions

Coach Robert Chen, who has led the program for eight years, praised the students' dedication: "This group exemplifies what happens when you combine STEM education with creativity and perseverance."

The victory qualifies the team for the state championship next month in the capital city, where they'll compete against the top teams from across the state for a chance to advance to the national competition.

Local businesses have rallied behind the team, with sponsors contributing over $15,000 to help cover travel and equipment costs. The school district has also provided additional funding for the state competition trip.

"This win puts our school and our community on the map," said Principal Sarah Martinez. "These students are showing that innovation and excellence can come from anywhere."`,
    featured_image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop",
    category_slug: "community",
    views: 189
  },
  {
    title: "New Farmers Market Opens with Grand Celebration",
    excerpt: "Over 30 local vendors gathered to launch the weekly farmers market, featuring fresh produce, artisan goods, and live entertainment.",
    content: `The long-awaited Riverside Farmers Market officially opened its doors Saturday morning with a festive grand opening celebration that drew hundreds of community members to the downtown park pavilion.

More than 30 local vendors showcased their offerings, including:

**Fresh Produce Vendors:**
- Sunshine Farms: Organic vegetables and herbs
- Mountain View Orchards: Seasonal fruits and apple products  
- Valley Gardens: Heirloom tomatoes and specialty greens

**Artisan and Specialty Vendors:**
- Homestyle Bakery: Fresh breads and pastries
- Maple Grove Honey: Local honey and bee products
- Riverside Pottery: Handcrafted ceramics
- Knit & Needle: Handmade clothing and accessories

The market will operate every Saturday from 8 AM to 2 PM, year-round, with seasonal adjustments for vendor availability.

"We're thrilled to provide a platform for local producers to connect directly with consumers," said Market Manager Linda Foster. "This market supports our local economy while giving residents access to the freshest, highest-quality products."

The opening day featured live music from the Community Jazz Ensemble, face painting for children, and cooking demonstrations by local chef Antonio Rivera from Bella Vista Restaurant.

Mayor Jennifer Walsh cut the ceremonial ribbon, emphasizing the market's role in strengthening community bonds: "This market represents the best of what our community has to offer – local entrepreneurship, sustainable agriculture, and neighbors supporting neighbors."

Several vendors reported strong sales, with Sunshine Farms selling out of their popular heirloom tomatoes before noon. "The community response has been overwhelming," said owner Janet Miller. "We're already planning to expand our offerings for next week."

The market organizers are already working on special themed events, including a harvest festival in October and holiday craft fairs in December.`,
    featured_image_url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=800&fit=crop",
    category_slug: "business",
    views: 156
  },
  {
    title: "Community Center Hosts Annual Charity Drive",
    excerpt: "This year's drive aims to collect 10,000 items for local families in need, surpassing last year's record-breaking donations.",
    content: `The annual Community Care Charity Drive is in full swing at the Riverside Community Center, with organizers setting an ambitious goal of collecting 10,000 items for local families facing economic hardship.

Now in its seventh year, the drive has become a cornerstone event that brings together residents, businesses, and organizations in a unified effort to support neighbors in need.

**This Year's Collection Goals:**
- 3,000 non-perishable food items
- 2,500 clothing items (all sizes)
- 2,000 school and office supplies
- 1,500 personal care products  
- 1,000 household essentials

"Every year, our community amazes me with their generosity," said Drive Coordinator Rachel Thompson. "Last year we collected over 8,500 items, and this year we're confident we can reach 10,000."

The drive runs through the end of the month, with collection boxes placed at 15 locations throughout the city, including:
- Riverside Community Center (main collection point)
- City Hall
- Public Library branches
- Local grocery stores
- Schools and churches

Major sponsors this year include Miller's Family Diner, which is providing meals for volunteers, and TechFix Solutions, which donated tablets for inventory management.

"Supporting this drive aligns perfectly with our company values," said TechFix owner James Park. "Technology should serve the community, and we're proud to contribute."

Volunteer opportunities are still available, with shifts needed for sorting, packing, and distribution. High school students can earn community service hours by participating.

The items collected will be distributed through partnerships with three local organizations: the Food Bank Network, Family Support Services, and the Housing Assistance Program.

Distribution begins the first week of next month, with recipients identified through a collaborative process involving social services, schools, and community advocates.

Last year's drive helped 847 families, including 312 children. Organizers expect to serve over 1,000 families this year based on current registration numbers.`,
    featured_image_url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&h=800&fit=crop",
    category_slug: "community", 
    views: 203
  },
  {
    title: "Local Restaurant Week Showcases Culinary Diversity",
    excerpt: "Fifteen restaurants participate in the inaugural event, offering special menus highlighting the community's diverse food scene.",
    content: `Riverside's first-ever Restaurant Week kicked off Monday with fifteen local establishments participating in the week-long celebration of the community's diverse culinary landscape.

The inaugural event, organized by the Chamber of Commerce and Downtown Business Association, features special prix fixe menus, cooking demonstrations, and behind-the-scenes restaurant tours.

**Participating Restaurants Include:**

**Casual Dining:**
- Miller's Family Diner: Comfort food classics with a modern twist
- Riverside Pizza Co.: Wood-fired pizzas and craft beer pairings
- Taco Libre: Authentic Mexican street food and fresh salsas

**Fine Dining:**
- Bella Vista: Contemporary American cuisine with local ingredients
- The Garden Room: Farm-to-table dining with seasonal menus
- Sakura Sushi: Traditional Japanese cuisine and sake tastings

**International Flavors:**
- Mumbai Spice: Authentic Indian dishes and spice blends
- Nonna's Kitchen: Family-recipe Italian pasta and wine
- Pho Saigon: Vietnamese pho and fresh spring rolls

"This week celebrates not just great food, but the entrepreneurial spirit and cultural diversity that makes our dining scene special," said Chamber President Mark Wilson.

Each restaurant offers a three-course dinner menu priced at $35, with lunch menus available for $20. Vegetarian and dietary restriction options are available at all locations.

Special events throughout the week include:
- Tuesday: Cooking class at The Culinary Academy
- Wednesday: Wine tasting at three downtown restaurants  
- Thursday: "Meet the Chef" dinner at Bella Vista
- Saturday: Food truck festival in Riverside Park

Early feedback has been overwhelmingly positive, with several restaurants reporting full bookings for the remainder of the week.

"We've had diners try our restaurant for the first time," said Sakura Sushi owner Kenji Tanaka. "Many have already made reservations to return after the week ends."

The economic impact is already noticeable, with increased foot traffic benefiting not just restaurants but neighboring shops and services.

Based on the success of this inaugural event, organizers are already planning an expanded Restaurant Week for next year, potentially including food trucks, catering companies, and pop-up dining experiences.`,
    featured_image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop",
    category_slug: "business",
    views: 278
  },
  {
    title: "Youth Soccer League Championship Final Set",
    excerpt: "Two undefeated teams will face off this Saturday in what promises to be an exciting conclusion to the season.",
    content: `The Riverside Youth Soccer League championship final is set for this Saturday as two powerhouse teams prepare to battle for the title at Memorial Stadium.

The Riverside Rangers (12-0) will face the Downtown Dynamos (11-0-1) in what promises to be the most competitive final in the league's 15-year history.

**Team Profiles:**

**Riverside Rangers** 
- Coach: Maria Santos (5th year)
- Key Players: Forward Alex Chen (18 goals), Midfielder Sam Rodriguez (12 assists)
- Strengths: Fast-paced offense, solid teamwork
- Regular Season: Outscored opponents 67-12

**Downtown Dynamos**
- Coach: David Thompson (3rd year) 
- Key Players: Goalkeeper Jamie Foster (8 shutouts), Defender Taylor Kim
- Strengths: Strong defense, strategic play calling
- Regular Season: Allowed fewest goals in league (8)

"Both teams have shown incredible skill and sportsmanship throughout the season," said League Commissioner Janet Miller. "This final represents the best of youth athletics."

The championship game features several compelling storylines:
- Rangers seeking their third consecutive title
- Dynamos looking for their first championship since 2019
- Several players are siblings of former league champions
- Both coaches played in the adult recreational league

Pre-game festivities begin at 1 PM with:
- Recognition ceremony for volunteers and sponsors
- Performance by the High School Marching Band
- Skills demonstration by league all-stars
- Game time: 2 PM

Admission is free, with concessions provided by the Parent Booster Club. Proceeds support league equipment and field maintenance.

The winner advances to represent Riverside in the Regional Tournament next month, competing against champions from eight other communities.

Weather forecast calls for sunny skies and temperatures in the mid-70s – perfect conditions for what should be an outstanding game.

"Regardless of the outcome, both teams have already won by showing what dedication and teamwork can accomplish," said Rangers coach Maria Santos.

Memorial Stadium is expected to reach capacity, with over 500 spectators anticipated for the championship showdown.`,
    featured_image_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=800&fit=crop",
    category_slug: "sports",
    views: 167
  }
]

// Main import functions
async function createUsers() {
  console.log('👥 Creating sample users...')
  
  const users = generateUsers()
  const createdUsers = []
  
  for (const user of users) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'TempPassword123!',
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          avatar_url: user.avatar_url
        }
      })
      
      if (authError) throw authError
      
      // Update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: user.role })
        .eq('id', authData.user.id)
      
      if (profileError) throw profileError
      
      createdUsers.push({
        id: authData.user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      })
      
      console.log(`   ✅ Created user: ${user.full_name} (${user.role})`)
    } catch (error) {
      console.error(`   ❌ Failed to create user ${user.email}:`, error)
    }
  }
  
  return createdUsers
}

async function createBusinesses(users: any[]) {
  console.log('🏢 Creating sample businesses...')
  
  const businesses = generateBusinesses()
  const businessOwners = users.filter(u => u.role === 'user')
  const createdBusinesses = []
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i]
    const owner = businessOwners[i % businessOwners.length]
    
    try {
      // Download and upload logo
      let logoUrl = business.logo_url
      if (logoUrl) {
        const fileName = `business-${slugify(business.name)}-logo.jpg`
        const localPath = await downloadImage(logoUrl, fileName)
        if (localPath) {
          const uploadedUrl = await uploadToSupabase(localPath, 'advertisements', fileName)
          if (uploadedUrl) logoUrl = uploadedUrl
        }
      }
      
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name: business.name,
          description: business.description,
          website_url: business.website_url,
          phone: business.phone,
          email: business.email,
          address: business.address,
          logo_url: logoUrl,
          owner_id: owner.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      createdBusinesses.push(data)
      console.log(`   ✅ Created business: ${business.name}`)
    } catch (error) {
      console.error(`   ❌ Failed to create business ${business.name}:`, error)
    }
  }
  
  return createdBusinesses
}

async function createArticles(users: any[]) {
  console.log('📰 Creating sample articles...')
  
  const articles = generateArticles()
  const editors = users.filter(u => u.role === 'editor' || u.role === 'admin')
  const createdArticles = []
  
  // Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    const author = editors[i % editors.length]
    const category = categories?.find(c => c.slug === article.category_slug)
    
    try {
      // Download and upload featured image
      let featuredImageUrl = article.featured_image_url
      if (featuredImageUrl) {
        const fileName = `article-${slugify(article.title)}.jpg`
        const localPath = await downloadImage(featuredImageUrl, fileName)
        if (localPath) {
          const uploadedUrl = await uploadToSupabase(localPath, 'articles', fileName)
          if (uploadedUrl) featuredImageUrl = uploadedUrl
        }
      }
      
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          slug: slugify(article.title),
          excerpt: article.excerpt,
          content: article.content,
          featured_image_url: featuredImageUrl,
          author_id: author.id,
          category_id: category?.id,
          status: 'published',
          views: article.views,
          published_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      createdArticles.push(data)
      console.log(`   ✅ Created article: ${article.title}`)
    } catch (error) {
      console.error(`   ❌ Failed to create article ${article.title}:`, error)
    }
  }
  
  return createdArticles
}

async function createAdvertisements(businesses: any[]) {
  console.log('📢 Creating sample advertisements...')
  
  const adPositions = ['header', 'sidebar', 'content', 'footer']
  const createdAds = []
  
  for (let i = 0; i < businesses.length && i < 8; i++) {
    const business = businesses[i]
    const position = adPositions[i % adPositions.length]
    
    try {
      // Create ad image (use business logo or generic ad image)
      let adImageUrl = business.logo_url || 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=400&fit=crop'
      
      if (adImageUrl && !business.logo_url) {
        const fileName = `ad-${slugify(business.name)}.jpg`
        const localPath = await downloadImage(adImageUrl, fileName)
        if (localPath) {
          const uploadedUrl = await uploadToSupabase(localPath, 'advertisements', fileName)
          if (uploadedUrl) adImageUrl = uploadedUrl
        }
      }
      
      const { data, error } = await supabase
        .from('advertisements')
        .insert({
          business_id: business.id,
          title: `${business.name} - Special Offer`,
          description: `Visit ${business.name} for quality service and great deals!`,
          image_url: adImageUrl,
          link_url: business.website_url,
          position: position,
          status: 'active',
          impressions: Math.floor(Math.random() * 1000) + 100,
          clicks: Math.floor(Math.random() * 50) + 10,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      createdAds.push(data)
      console.log(`   ✅ Created ad: ${business.name} (${position})`)
    } catch (error) {
      console.error(`   ❌ Failed to create ad for ${business.name}:`, error)
    }
  }
  
  return createdAds
}

async function cleanupTempFiles() {
  try {
    const tempDir = path.join(__dirname, '..', 'temp_images')
    await fs.rm(tempDir, { recursive: true, force: true })
    console.log('🧹 Cleaned up temporary image files')
  } catch (error) {
    console.warn('⚠️  Could not clean up temp files:', error)
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting professional data import...\n')
  
  try {
    // Test connection
    const { data, error } = await supabase.from('categories').select('count', { count: 'exact' })
    if (error) throw error
    console.log('✅ Database connection successful\n')
    
    // Create sample data
    const users = await createUsers()
    console.log('')
    
    const businesses = await createBusinesses(users)
    console.log('')
    
    const articles = await createArticles(users)
    console.log('')
    
    const advertisements = await createAdvertisements(businesses)
    console.log('')
    
    // Summary
    console.log('📊 Import Summary:')
    console.log(`   👥 Users: ${users.length}`)
    console.log(`   🏢 Businesses: ${businesses.length}`)
    console.log(`   📰 Articles: ${articles.length}`)
    console.log(`   📢 Advertisements: ${advertisements.length}`)
    console.log('')
    
    console.log('✅ Professional data import completed successfully!')
    console.log('')
    console.log('🔗 Access your application:')
    console.log('   Local: http://localhost:3000')
    console.log('')
    console.log('👤 Test Login Credentials:')
    console.log('   Admin: admin@localnews.com / TempPassword123!')
    console.log('   Editor: editor@localnews.com / TempPassword123!')
    console.log('   User: user1@example.com / TempPassword123!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  } finally {
    await cleanupTempFiles()
  }
}

// Run the import
main().catch(console.error)