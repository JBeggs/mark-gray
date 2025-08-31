#!/usr/bin/env tsx

/**
 * Add Fambri Farms Business
 * Creates a business entry for Fambri Farms from fambrifarms.co.za
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
      /<img[^>]*src=["']([^"']*fambri[^"']*)["']/i,
    ]
    
    for (const pattern of logoPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        logoImage = makeAbsolute(match[1])
        console.log(`   🏷️  Found logo: ${logoImage}`)
        break
      }
    }
    
    // 2. Look for DIFFERENT HERO/COVER images (farm photos, crops, scenery, etc.)
    const heroPatterns = [
      // Hero/banner section backgrounds in CSS
      /background-image:\s*url\(['"]([^'"]+)['"]\)/gi,
      // Farm/agriculture specific images
      /<img[^>]*class=[^>]*(?:hero|banner|farm|agriculture|crop|harvest|field)[^>]*src=["']([^"']+)["']/gi,
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
        // Make sure it's different from logo and looks like a farm/agriculture image
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
      // Prefer farm/agriculture related images
      coverImage = foundImages.find(img => 
        img.includes('hero') || 
        img.includes('banner') || 
        img.includes('farm') ||
        img.includes('agriculture') ||
        img.includes('crop') ||
        img.includes('harvest') ||
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
      coverImage: coverImage || 'https://picsum.photos/1200/600?random=fambrifarms',
      logoImage: logoImage || 'https://picsum.photos/300/300?random=fambrifarms&logo',
      allImages: foundImages // Store ALL found images for selection
    }
    
  } catch (error) {
    console.error('❌ Error extracting images:', error)
    return {
      coverImage: 'https://picsum.photos/1200/600?random=fambrifarms',
      logoImage: 'https://picsum.photos/300/300?random=fambrifarms&logo',
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

async function addFambriFarms() {
  console.log('🌱 Adding Fambri Farms business...')
  
  // Get the specific business owner we created for Fambri Farms
  const { data: businessOwner } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', 'admin@fambrifarms.co.za')
    .single()

  if (!businessOwner) {
    console.error('❌ Fambri Farms business owner (admin@fambrifarms.co.za) not found.')
    console.error('   Please run: npx tsx scripts/add-test-users.ts first')
    return
  }

  console.log(`👤 Using business owner: ${businessOwner.full_name} (${businessOwner.email})`)

  // Extract images from website
  const images = await extractBusinessImages('https://fambrifarms.co.za/')

  const fambriFarmsBusiness = {
    name: 'Fambri Farms',
    slug: 'fambri-farms',
    description: 'Family owned and run farm specializing in fine herbs and vegetables, situated at the foot of the Magaliesburg mountain range in Hartbeespoort.',
    long_description: `Back in 2014 a shoddy looking old farm was acquired because a man saw potential in it. For 2 years this man drove his tractor, ploughed, ripped and pulled. Production started on a small scale and one thing lead to another. Ten beds became twenty, twenty became sixty, before it was realised production grew to two hectares. This lead to the formation of Fambri Farms in 2016.

Fambri Farms now specialises in fine herbs and certain vegetables. Today farming on 6 hectares, including 1 hectare of a young pomegranate orchid. Fambri Farms is always evolving and looking to improve the lives of it's staff and the community.

Our farm philosophy is focused on implementing commercially sustainable farming practices that allows us to offer a diverse produce line of fresh fruit, vegetables and herbs, while nurturing and improving our soil and water quality. This will result in a better quality of produce, grown naturally.

## Products & Services

**Fresh Herbs:**
- Coriander (Cilantro/Chinese Parsley) - Rich in vitamin A, C and K
- Chives - Sweet, mild-onion flavored with high vitamin A content
- Rocket and other fresh herbs

**Vegetables:**
- Lettuce varieties including Red/Green Batavia, Red/Green Oak, Multi Green, Butter and Green Cos
- Swiss Chard
- Various seasonal vegetables

**Additional Services:**
- Animal feed depot with most animal feeds available
- Sustainable farming consultation
- Fresh produce recipes and cooking ideas

**Farm Specialties:**
- 6 hectares of sustainable farming
- 1 hectare pomegranate orchard
- Family owned and operated since 2016
- Focus on soil and water quality improvement
- Community-focused farming practices`,
    industry: 'Agriculture & Fresh Produce',
    website_url: 'https://fambrifarms.co.za/',
    phone: '+27 (0)84 504 8586',
    email: 'info@fambrifarms.co.za', // Assumed based on domain
    address: 'BR1601, Hartbeeshoek Road',
    city: 'Broederstroom',
    state: 'North West',
    zip_code: '0260',
    owner_id: businessOwner.id,
    services: [
      'Fresh Herbs', 
      'Vegetables', 
      'Animal Feed', 
      'Sustainable Farming', 
      'Pomegranate Orchard',
      'Coriander',
      'Chives', 
      'Lettuce Varieties',
      'Swiss Chard',
      'Rocket'
    ],
    business_hours: {
      monday: { open: '07:00', close: '17:00' },
      tuesday: { open: '07:00', close: '17:00' },
      wednesday: { open: '07:00', close: '17:00' },
      thursday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '17:00' },
      saturday: { open: '08:00', close: '15:00' },
      sunday: { open: '08:00', close: '15:00' }
    },
    social_links: {
      website: 'https://fambrifarms.co.za/',
      about: 'https://fambrifarms.co.za/about/',
      recipes: 'https://fambrifarms.co.za/recipes/'
    },
    rating: 4.7,
    review_count: 23,
    is_verified: true,
    seo_title: 'Fambri Farms - Fresh Herbs & Vegetables | Sustainable Farming in Hartbeespoort',
    seo_description: 'Family-owned Fambri Farms offers fresh herbs, vegetables and sustainable farming practices in Hartbeespoort. Specializing in coriander, chives, lettuce varieties and more.',
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
      .eq('slug', fambriFarmsBusiness.slug)
      .single()

    if (existing) {
      console.log('   ℹ️  Fambri Farms business already exists, skipping')
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert(fambriFarmsBusiness)
      .select()
      .single()

    if (error) throw error

    console.log('   ✅ Successfully added Fambri Farms business!')
    console.log(`   🔗 Business ID: ${data.id}`)
    console.log(`   🌐 Website: ${fambriFarmsBusiness.website_url}`)
    console.log(`   📍 Location: ${fambriFarmsBusiness.address}, ${fambriFarmsBusiness.city}`)
    console.log(`   📞 Phone: ${fambriFarmsBusiness.phone}`)
    console.log(`   🌱 Industry: ${fambriFarmsBusiness.industry}`)
    console.log(`   📦 Services: ${fambriFarmsBusiness.services.slice(0, 5).join(', ')}${fambriFarmsBusiness.services.length > 5 ? '...' : ''}`)
    console.log(`   🖼️  Cover Image: ${images.coverImage}`)
    console.log(`   🏷️  Logo Image: ${images.logoImage}`)

  } catch (error) {
    console.error('   ❌ Failed to add Fambri Farms business:', error)
  }
}

async function main() {
  console.log('🚀 Adding Fambri Farms Business...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  await addFambriFarms()
  
  console.log('\n🎉 Fambri Farms Business Added!')
  console.log('📍 You can now visit:')
  console.log('   • /businesses/fambri-farms')
  console.log('   • /businesses (to see all businesses)')
  console.log('\n🌱 Source: fambrifarms.co.za')
  console.log('📱 Phone: +27 (0)84 504 8586 | +27 (0)61 179 6894')
  console.log('📍 Address: BR1601, Hartbeeshoek Road, Broederstroom, 0260')
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}