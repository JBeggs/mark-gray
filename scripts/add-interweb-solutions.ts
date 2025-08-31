#!/usr/bin/env tsx

/**
 * Add Interweb Solutions Business
 * Creates a business entry for Interweb Solutions web development company
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addInterwebSolutions() {
  console.log('💻 Adding Interweb Solutions business...')
  
  // Get Jody Beggs as the business owner
  const { data: businessOwner } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', 'jody.beggs@example.com')
    .single()

  if (!businessOwner) {
    console.error('❌ Business owner Jody Beggs (jody.beggs@example.com) not found.')
    console.error('   Please run: npx tsx scripts/add-test-users.ts first')
    return
  }

  console.log(`👤 Using business owner: ${businessOwner.full_name} (${businessOwner.email})`)

  const interwebSolutionsBusiness = {
    name: 'Interweb Solutions',
    slug: 'interweb-solutions',
    description: 'Professional web application development services for modern businesses and startups.',
    long_description: `Interweb Solutions is a cutting-edge web development company specializing in modern web applications, IoT solutions, and digital transformation services.

We provide comprehensive web application development services including:

• Custom Web Applications - Modern, responsive web applications built with the latest technologies
• IoT Solutions - Internet of Things development and integration services
• Digital Strategy - Helping businesses navigate their digital transformation journey
• E-commerce Platforms - Full-featured online stores and marketplace solutions
• API Development - Robust backend services and API integrations
• Mobile-First Design - Responsive designs that work perfectly on all devices
• Database Solutions - Efficient data management and analytics systems
• Cloud Integration - Scalable cloud-based solutions and deployment

Our expertise includes React, Next.js, Node.js, TypeScript, Python, and modern cloud platforms. We work with businesses of all sizes, from startups to enterprise clients, delivering high-quality solutions that drive growth and innovation.

With a focus on Internet of Things (IoT) technologies, we help businesses connect their physical operations to digital platforms, creating smart, data-driven solutions that optimize efficiency and provide valuable insights.

Whether you need a simple website, a complex web application, or an integrated IoT system, Interweb Solutions has the expertise to bring your vision to life.`,
    industry: 'Technology',
    website_url: 'https://interweb-solutions.co.za',
    phone: '0725235515',
    email: 'info@interweb-solutions.co.za',
    // Using Paddle Power's address as requested
    address: 'Farm 237, Crocodile Rd, Entrance T-junction R512 & R104, Broederstroom',
    city: 'Hartbeespoort',
    state: 'North West',
    zip_code: '0216',
    owner_id: businessOwner.id,
    services: [
      'Web Application Development',
      'IoT Solutions',
      'E-commerce Development',
      'API Development',
      'Digital Strategy',
      'Mobile-First Design',
      'Cloud Integration',
      'Database Solutions'
    ],
    business_hours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '13:00' },
      sunday: { closed: true }
    },
    social_links: {
      website: 'https://interweb-solutions.co.za',
      email: 'mailto:info@interweb-solutions.co.za',
      linkedin: 'https://linkedin.com/company/interweb-solutions'
    },
    rating: 4.9,
    review_count: 23,
    is_verified: true,
    seo_title: 'Interweb Solutions - Professional Web Development & IoT Services',
    seo_description: 'Expert web application development and Internet of Things (IoT) solutions. Custom web apps, e-commerce, API development, and digital strategy services.',
    // Placeholder images - will be replaced with actual logo and cover
    logo_url: 'https://picsum.photos/300/300?random=interweb&logo',
    cover_image_url: 'https://picsum.photos/1200/600?random=interweb&tech',
    available_images: []
  }

  try {
    // Check if business already exists
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', interwebSolutionsBusiness.slug)
      .single()

    if (existing) {
      console.log('   ℹ️  Interweb Solutions business already exists, skipping')
      return existing
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert(interwebSolutionsBusiness)
      .select()
      .single()

    if (error) throw error

    console.log('   ✅ Successfully added Interweb Solutions business!')
    console.log(`   🔗 Business ID: ${data.id}`)
    console.log(`   🌐 Website: ${interwebSolutionsBusiness.website_url}`)
    console.log(`   📍 Location: ${interwebSolutionsBusiness.address}, ${interwebSolutionsBusiness.city}`)
    console.log(`   📞 Phone: ${interwebSolutionsBusiness.phone}`)
    console.log(`   📧 Email: ${interwebSolutionsBusiness.email}`)
    console.log(`   👤 Owner: ${businessOwner.full_name}`)

    return data

  } catch (error) {
    console.error('   ❌ Failed to add Interweb Solutions business:', error)
    throw error
  }
}

async function main() {
  console.log('🚀 Adding Interweb Solutions Business...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const business = await addInterwebSolutions()
  
  console.log('\n🎉 Interweb Solutions Business Added!')
  console.log('📍 You can now visit:')
  console.log('   • /businesses/interweb-solutions')
  console.log('   • /businesses (to see all businesses)')
  console.log('\n💻 Ready for web development!')
  
  return business
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}

export { addInterwebSolutions }