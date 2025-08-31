#!/usr/bin/env tsx

/**
 * Add The Rusty Feather Business
 * Creates a business entry for The Rusty Feather from rustyfeather.co.za
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Enhanced function to extract MULTIPLE DIFFERENT images from website
async function extractBusinessImages(url: string) {
  console.log(`🖼️  Extracting MULTIPLE images from: ${url}`)
  
  try {
    const response = await fetch(url)
    const html = await response.text()
    
    let logoImage = ''
    let coverImage = ''
    
    // Helper to make URLs absolute
    const makeAbsolute = (imageUrl: string) => {
      if (imageUrl.startsWith('http')) return imageUrl
      if (imageUrl.startsWith('//')) return `https:${imageUrl}`
      if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url)
        return `${urlObj.protocol}//${urlObj.host}${imageUrl}`
      }
      return imageUrl
    }
    
    // 1. Look for LOGO specifically
    const logoPatterns = [
      /<img[^>]*class=[^>]*logo[^>]*src=["']([^"']+)["']/i,
      /<img[^>]*src=["']([^"']*logo[^"']*)["']/i,
      /<img[^>]*class=[^>]*brand[^>]*src=["']([^"']+)["']/i,
      /<img[^>]*alt=[^>]*logo[^>]*src=["']([^"']+)["']/i,
      /<img[^>]*src=["']([^"']*rusty[^"']*feather[^"']*)["']/i,
      /<img[^>]*src=["']([^"']*feather[^"']*logo[^"']*)["']/i,
    ]
    
    for (const pattern of logoPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        logoImage = makeAbsolute(match[1])
        console.log(`   🏷️  Found logo: ${logoImage}`)
        break
      }
    }
    
    // 2. Look for DIFFERENT HERO/COVER images (restaurant photos, scenery, etc.)
    const heroPatterns = [
      // Hero/banner section backgrounds in CSS
      /background-image:\s*url\(['"]([^'"]+)['"]\)/gi,
      // Restaurant/venue photos
      /<img[^>]*class=[^>]*(?:hero|banner|restaurant|venue|dining|outdoor)[^>]*src=["']([^"']+)["']/gi,
      // Gallery images that might be good covers
      /<img[^>]*class=[^>]*(?:gallery|photo|image)[^>]*src=["']([^"']+)["']/gi,
      // WordPress slider/featured images
      /<img[^>]*class=[^>]*(?:slide|featured|main)[^>]*src=["']([^"']+)["']/gi,
      // Large images (likely hero images)
      /<img[^>]*src=["']([^"']+)["'][^>]*(?:width=["'][0-9]{3,}["']|height=["'][0-9]{3,}["'])/gi,
    ]
    
    let foundImages = []
    
    for (const pattern of heroPatterns) {
      let match
      while ((match = pattern.exec(html)) !== null) {
        const heroUrl = makeAbsolute(match[1])
        // Make sure it's different from logo and looks like a venue/restaurant image
        if (heroUrl !== logoImage && 
            !heroUrl.includes('logo') && 
            !heroUrl.includes('icon') &&
            !heroUrl.includes('favicon') &&
            (heroUrl.includes('.jpg') || heroUrl.includes('.jpeg') || heroUrl.includes('.png') || heroUrl.includes('.webp'))) {
          foundImages.push(heroUrl)
          console.log(`   📸 Found potential cover: ${heroUrl}`)
        }
      }
    }
    
    // 3. Scrape ALL images and filter for good cover candidates
    if (foundImages.length === 0) {
      console.log(`   🔍 No hero images found, searching all images...`)
      const allImages = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || []
      
      for (const imgTag of allImages) {
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/)
        if (srcMatch) {
          const imgUrl = makeAbsolute(srcMatch[1])
          if (imgUrl !== logoImage && 
              !imgUrl.includes('logo') && 
              !imgUrl.includes('icon') &&
              !imgUrl.includes('favicon') &&
              !imgUrl.includes('sprite') &&
              (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png') || imgUrl.includes('.webp'))) {
            foundImages.push(imgUrl)
            console.log(`   📷 Found image: ${imgUrl}`)
          }
        }
      }
    }
    
    // 4. Pick the best cover image
    if (foundImages.length > 0) {
      // Prefer larger/better images
      coverImage = foundImages.find(img => 
        img.includes('hero') || 
        img.includes('banner') || 
        img.includes('restaurant') ||
        img.includes('main') ||
        img.includes('large')
      ) || foundImages[0]
      console.log(`   ✅ Selected cover: ${coverImage}`)
    }
    
    // 5. Final fallbacks
    if (!coverImage && logoImage) {
      coverImage = logoImage
      console.log(`   ⚠️  Using logo as cover (no other images found)`)
    }
    
    console.log(`\n📊 FINAL RESULTS:`)
    console.log(`   📸 Cover image: ${coverImage || 'None found'}`)
    console.log(`   🏷️  Logo image: ${logoImage || 'None found'}`)
    console.log(`   🖼️  Total images found: ${foundImages.length}`)
    
    return {
      coverImage: coverImage || 'https://picsum.photos/1200/600?random=rustyfeather',
      logoImage: logoImage || 'https://picsum.photos/300/300?random=rustyfeather&logo',
      allImages: foundImages // Store ALL found images for selection
    }
    
  } catch (error) {
    console.error('❌ Error extracting images:', error)
    return {
      coverImage: 'https://picsum.photos/1200/600?random=rustyfeather',
      logoImage: 'https://picsum.photos/300/300?random=rustyfeather&logo',
      allImages: [] // Empty array on error
    }
  }
}

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addRustyFeather() {
  console.log('🪶 Adding The Rusty Feather business...')
  
  // Get the specific business owner we created for The Rusty Feather
  const { data: businessOwner } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', 'admin@rustyfeather.co.za')
    .single()

  if (!businessOwner) {
    console.error('❌ Rusty Feather business owner (admin@rustyfeather.co.za) not found.')
    console.error('   Please run: npx tsx scripts/add-test-users.ts first')
    return
  }

  console.log(`👤 Using business owner: ${businessOwner.full_name} (${businessOwner.email})`)

  // Extract images from website
  const images = await extractBusinessImages('https://rustyfeather.co.za/')

  const rustyFeatherBusiness = {
    name: 'The Rusty Feather',
    slug: 'the-rusty-feather',
    description: 'A hidden gem and local favourite - rustic bistro, bar, adventure hub, and library on the waterfront of the Crocodile River.',
    long_description: `The Rusty Feather is a hidden gem and local favourite. Old bones which have been rejuvenated into a stunning, relaxed, and rustic bistro, bar, adventure hub, and library on the waterfront of the Crocodile River.

Stop by on your weekend breakfast run to Harties for a delicious cappuccino or stay a while, take in the views and the vibe, while enjoying an artisanal style breakfast, lunch, and craft beer.

Just 40 mins out of bustling Joburg and Pretoria but feels like you're in the middle of South Africa's stunning bush. Take in the views, adventure on our river, our mountain or between the pages of the books in our library.

## What Makes Us Special

**Unique Experiences:**
- Waterfront dining on the Crocodile River with stunning bush views
- Honesty Library - browse donated books while sipping coffee on our deck
- Movies Under The Stars - monthly outdoor cinema experience
- Harties River Hiking Trail access with post-hike refreshments
- Beer Trail featuring craft beers and local brews
- Broederstroom Country Market events

**Dog-Friendly Environment:**
We love visitors of all kinds, especially dogs! We've included delicious menu items for our K9 friends too. Kindly bring your dog in on a leash - once acclimatised, they're welcome to run around and explore!

**Food & Beverage:**
- Artisanal breakfast, lunch, and dinner
- Specialty coffee and cappuccinos
- Craft beer selection
- Rustic bistro-style cuisine
- Weekend brunch (reservations recommended)

**Adventure Hub:**
- River adventures and water activities
- Mountain trail access
- Scenic hiking opportunities
- Outdoor recreation guidance
- Perfect base for Hartbeespoort adventures

Located at the T-Junction of R512 and R104, we're your perfect stop for adventure, relaxation, good food, and great company in the heart of South Africa's beautiful bushveld.`,
    industry: 'Restaurant & Adventure Tourism',
    website_url: 'https://rustyfeather.co.za/',
    phone: '079 980 7743',
    email: 'hello@rustyfeather.co.za',
    address: 'T-Junction R512 and R104, Farm 237',
    city: 'Broederstroom, Hartbeespoort',
    state: 'North West',
    zip_code: '0216',
    owner_id: businessOwner.id,
    services: [
      'Restaurant & Bistro',
      'Bar & Craft Beer',
      'Coffee Shop',
      'Adventure Hub',
      'Honesty Library',
      'Hiking Trails',
      'Movies Under The Stars',
      'Beer Trail',
      'Country Market',
      'Dog-Friendly Dining',
      'Outdoor Cinema',
      'River Activities'
    ],
    business_hours: {
      monday: null, // Closed
      tuesday: null, // Closed
      wednesday: { open: '11:00', close: '17:00' },
      thursday: { open: '11:00', close: '17:00' },
      friday: { open: '11:00', close: '22:00' }, // After dinner
      saturday: { open: '07:30', close: '17:00' },
      sunday: { open: '07:30', close: '16:00' }
    },
    social_links: {
      website: 'https://rustyfeather.co.za/',
      facebook: 'https://facebook.com/therustyfeather',
      instagram: 'https://instagram.com/therustyfeather',
      contact: 'https://rustyfeather.co.za/contact-us/',
      menu: 'https://rustyfeather.co.za/menu/',
      hike: 'https://rustyfeather.co.za/hike/'
    },
    rating: 4.6,
    review_count: 67,
    is_verified: true,
    seo_title: 'The Rusty Feather - Rustic Bistro, Bar & Adventure Hub | Hartbeespoort Crocodile River',
    seo_description: 'Hidden gem bistro, bar, and adventure hub on the Crocodile River. Dog-friendly dining, craft beer, hiking trails, outdoor cinema, and honesty library. 40 minutes from Joburg & Pretoria.',
    // Add extracted images
    logo_url: images.logoImage,
    cover_image_url: images.coverImage,
    available_images: images.allImages // Store all images for selection
  }

  try {
    // Check if business already exists
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', rustyFeatherBusiness.slug)
      .single()

    if (existing) {
      console.log('   ℹ️  The Rusty Feather business already exists, skipping')
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert(rustyFeatherBusiness)
      .select()
      .single()

    if (error) throw error

    console.log('   ✅ Successfully added The Rusty Feather business!')
    console.log(`   🔗 Business ID: ${data.id}`)
    console.log(`   🌐 Website: ${rustyFeatherBusiness.website_url}`)
    console.log(`   📍 Location: ${rustyFeatherBusiness.address}, ${rustyFeatherBusiness.city}`)
    console.log(`   📞 Phone: ${rustyFeatherBusiness.phone}`)
    console.log(`   📧 Email: ${rustyFeatherBusiness.email}`)
    console.log(`   🏭 Industry: ${rustyFeatherBusiness.industry}`)
    console.log(`   📦 Services: ${rustyFeatherBusiness.services.slice(0, 6).join(', ')}...`)
    console.log(`   🖼️  Cover Image: ${images.coverImage}`)
    console.log(`   🏷️  Logo Image: ${images.logoImage}`)

  } catch (error) {
    console.error('   ❌ Failed to add The Rusty Feather business:', error)
  }
}

async function main() {
  console.log('🚀 Adding The Rusty Feather Business...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  await addRustyFeather()
  
  console.log('\n🎉 The Rusty Feather Business Added!')
  console.log('📍 You can now visit:')
  console.log('   • /businesses/the-rusty-feather')
  console.log('   • /businesses (to see all businesses)')
  console.log('\n🪶 Source: rustyfeather.co.za')
  console.log('📱 Phone: 079 980 7743')
  console.log('📧 Email: hello@rustyfeather.co.za')
  console.log('📍 Address: T-Junction R512 and R104, Broederstroom, Hartbeespoort')
  console.log('⏰ Hours: Wed-Thu 11am-5pm | Fri 11am-late | Sat-Sun 7:30am-5pm/4pm')
  console.log('🐕 Dog-friendly dining with river views!')
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}