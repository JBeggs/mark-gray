#!/usr/bin/env tsx

/**
 * Add Paddle Power Business
 * Creates a business entry for Paddle Power adventure company from paddlepower.co.za
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
      /<img[^>]*src=["']([^"']*paddle[^"']*power[^"']*)["']/i,
    ]
    
    for (const pattern of logoPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        logoImage = makeAbsolute(match[1])
        console.log(`   🏷️  Found logo: ${logoImage}`)
        break
      }
    }
    
    // 2. Look for DIFFERENT HERO/COVER images (adventure photos, river, outdoor activities, etc.)
    const heroPatterns = [
      // Hero/banner section backgrounds in CSS
      /background-image:\s*url\(['"]([^'"]+)['"]\)/gi,
      // Adventure/outdoor specific images
      /<img[^>]*class=[^>]*(?:hero|banner|adventure|outdoor|river|rafting|activity)[^>]*src=["']([^"']+)["']/gi,
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
        // Make sure it's different from logo and looks like an adventure/activity image
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
      // Prefer adventure/outdoor related images
      coverImage = foundImages.find(img => 
        img.includes('hero') || 
        img.includes('banner') || 
        img.includes('adventure') ||
        img.includes('outdoor') ||
        img.includes('river') ||
        img.includes('rafting') ||
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
      coverImage: coverImage || 'https://picsum.photos/1200/600?random=paddlepower',
      logoImage: logoImage || 'https://picsum.photos/300/300?random=paddlepower&logo',
      allImages: foundImages // Store ALL found images for selection
    }
    
  } catch (error) {
    console.error('❌ Error extracting images:', error)
    return {
      coverImage: 'https://picsum.photos/1200/600?random=paddlepower',
      logoImage: 'https://picsum.photos/300/300?random=paddlepower&logo',
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

async function addPaddlePower() {
  console.log('🚣 Adding Paddle Power business...')
  
  // Get the specific business owner we created for Paddle Power
  const { data: businessOwner } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', 'admin@paddlepower.co.za')
    .single()

  if (!businessOwner) {
    console.error('❌ Paddle Power business owner (admin@paddlepower.co.za) not found.')
    console.error('   Please run: npx tsx scripts/add-test-users.ts first')
    return
  }

  console.log(`👤 Using business owner: ${businessOwner.full_name} (${businessOwner.email})`)

  // Extract images from website
  const images = await extractBusinessImages('https://paddlepower.co.za/')

  const paddlePowerBusiness = {
    name: 'Paddle Power',
    slug: 'paddle-power',
    description: 'Adventure company offering river rafting, hiking, abseiling and teambuilding activities on the beautiful Crocodile River.',
    long_description: `On the banks of the Crocodile River, the home of Paddle Power Adventures, where wildlife, nature and wonder are ready and waiting to show you and your family the thrill of the outdoors.

Over 20 years ago we fell in love with the beauty and thrill of rafting on the Crocodile River, Hartbeespoort. Starting with small guided river rafting trips, Paddle Power is situated on a beautiful forested property right on the banks of the river and offers many other adventure activities now too.

Less than 40 minutes from Pretoria and Joburg – the perfect day trip for you, your friends, colleagues and family.

Services include:
• River Rafting - Scenic rafting experiences on the Crocodile River
• Hiking - Guided hikes with beautiful views and prepared breakfast
• Abseiling - Adventure climbing activities
• Teambuilding - Corporate and group activities
• The Rusty Feather Restaurant - Delicious food with river views

The original adventure guides on the Crocodile River with over 20 years of experience providing safe, thrilling outdoor adventures.`,
    industry: 'Adventure Tourism',
    website_url: 'https://paddlepower.co.za/',
    phone: '071 559 3081',
    email: 'info@paddlepower.co.za',
    address: 'Farm 237, Crocodile Rd, Entrance T-junction R512 & R104, Broederstroom',
    city: 'Hartbeespoort',
    state: 'North West',
    zip_code: '0216',
    owner_id: businessOwner.id,
    services: ['River Rafting', 'Hiking', 'Abseiling', 'Teambuilding', 'Restaurant'],
    business_hours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '17:00' },
      sunday: { open: '08:00', close: '17:00' }
    },
    social_links: {
      website: 'https://paddlepower.co.za/',
      email: 'mailto:info@paddlepower.co.za'
    },
    rating: 4.8,
    review_count: 45,
    is_verified: true,
    seo_title: 'Paddle Power - Adventure Activities in Hartbeespoort | River Rafting, Hiking & More',
    seo_description: 'Experience thrilling adventure activities at Paddle Power on the Crocodile River. River rafting, hiking, abseiling, and teambuilding near Pretoria and Johannesburg.',
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
      .eq('slug', paddlePowerBusiness.slug)
      .single()

    if (existing) {
      console.log('   ℹ️  Paddle Power business already exists, skipping')
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert(paddlePowerBusiness)
      .select()
      .single()

    if (error) throw error

    console.log('   ✅ Successfully added Paddle Power business!')
    console.log(`   🔗 Business ID: ${data.id}`)
    console.log(`   🌐 Website: ${paddlePowerBusiness.website_url}`)
    console.log(`   📍 Location: ${paddlePowerBusiness.address}, ${paddlePowerBusiness.city}`)
    console.log(`   📞 Phone: ${paddlePowerBusiness.phone}`)
    console.log(`   📧 Email: ${paddlePowerBusiness.email}`)
    console.log(`   🖼️  Cover Image: ${images.coverImage}`)
    console.log(`   🏷️  Logo Image: ${images.logoImage}`)

  } catch (error) {
    console.error('   ❌ Failed to add Paddle Power business:', error)
  }
}

async function main() {
  console.log('🚀 Adding Paddle Power Business...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  await addPaddlePower()
  
  console.log('\n🎉 Paddle Power Business Added!')
  console.log('📍 You can now visit:')
  console.log('   • /businesses/paddle-power')
  console.log('   • /businesses (to see all businesses)')
  console.log('\n🚣 Ready for adventure!')
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}