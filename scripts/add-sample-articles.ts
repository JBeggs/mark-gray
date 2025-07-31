#!/usr/bin/env tsx

/**
 * Add Sample Articles for Testing
 * Creates realistic sample articles including the robotics team story
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

async function getSampleData() {
  // Get categories and authors
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')

  const { data: authors } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['admin', 'editor', 'author'])

  const categoryMap = categories?.reduce((acc, cat) => {
    acc[cat.name.toLowerCase()] = cat.id
    return acc
  }, {} as Record<string, string>) || {}

  const adminAuthor = authors?.find(a => a.role === 'admin') || authors?.[0]
  const editorAuthor = authors?.find(a => a.role === 'editor') || authors?.[0]

  return { categoryMap, adminAuthor, editorAuthor }
}

async function createSampleArticles() {
  console.log('📰 Creating sample articles...')
  
  const { categoryMap, adminAuthor, editorAuthor } = await getSampleData()
  
  if (!adminAuthor) {
    console.error('❌ No admin or editor user found. Please create users first.')
    return
  }

  const sampleArticles = [
    {
      title: 'Local High School Robotics Team Wins Regional Championship',
      slug: 'local-high-school-robotics-team-wins-regional-championship',
      subtitle: 'Riverside High\'s "TechTitans" defeat 47 teams to advance to state finals',
      excerpt: 'The Riverside High School robotics team, known as the "TechTitans," secured first place at the Regional Robotics Championship held last weekend, earning them a spot in the state finals next month.',
      content: `<p>In an impressive display of engineering prowess and teamwork, Riverside High School's robotics team, the "TechTitans," claimed victory at the Regional Robotics Championship held at the Riverside Convention Center last weekend.</p>

<p>The team, comprising 12 dedicated students from grades 9-12, competed against 47 other teams from across the region in a series of challenging robotics competitions designed to test both technical skills and strategic thinking.</p>

<h2>The Winning Robot</h2>

<p>This year's competition theme, "Cargo Connect," required teams to design and build robots capable of collecting, transporting, and delivering various cargo items across a complex field with obstacles and scoring zones.</p>

<p>The TechTitans' robot, nicknamed "Titan Prime," stood out with its innovative dual-arm design and advanced autonomous navigation system. Team captain Sarah Martinez, a senior, explained: "We spent months perfecting Titan Prime's ability to adapt to different challenges. The key was developing an AI system that could make real-time decisions during matches."</p>

<blockquote>
<p>"This victory represents months of hard work, late nights, and incredible teamwork. These students have shown that with dedication and creativity, anything is possible." - Coach Jennifer Williams</p>
</blockquote>

<h2>Road to Victory</h2>

<p>The championship consisted of three main phases:</p>

<ul>
<li><strong>Qualification Rounds:</strong> Teams competed in alliance-style matches to determine seeding</li>
<li><strong>Alliance Selection:</strong> Top teams formed strategic partnerships</li>
<li><strong>Elimination Rounds:</strong> Best-of-three matches leading to the finals</li>
</ul>

<p>The TechTitans finished the qualification rounds ranked 3rd out of 48 teams, earning them the right to be an alliance captain. They selected teams from Jefferson High and Oakwood Academy as their alliance partners.</p>

<h2>Community Support</h2>

<p>The team's success wouldn't have been possible without strong community support. Local businesses, including <strong>Riverside Electronics</strong> and <strong>Mountain View Manufacturing</strong>, provided both financial sponsorship and technical mentorship throughout the season.</p>

<p>"Seeing these young minds tackle complex engineering challenges gives me hope for the future," said Mark Chen, owner of Riverside Electronics and team mentor. "They're not just building robots; they're developing problem-solving skills that will serve them throughout their careers."</p>

<h2>Looking Ahead</h2>

<p>The TechTitans will now prepare for the State Championship scheduled for March 15-17 at the Sacramento Convention Center. If they place in the top three at state, they'll advance to the national competition in Houston, Texas.</p>

<p>Team member Alex Rodriguez, a junior, is optimistic about their chances: "We've learned so much from this regional win. Now we know we can compete with anyone. We're already brainstorming improvements for Titan Prime before state."</p>

<p>The school district has announced a celebration assembly for Friday, where the team will demonstrate their robot and share their experiences with fellow students.</p>

<h2>Team Recognition</h2>

<p>In addition to the championship title, the TechTitans received several individual awards:</p>

<ul>
<li><strong>Innovation in Control Award</strong> - for their advanced autonomous programming</li>
<li><strong>Team Spirit Award</strong> - recognizing their exemplary sportsmanship</li>
<li><strong>Engineering Excellence Award</strong> - for outstanding robot design and documentation</li>
</ul>

<p>Principal Dr. Lisa Thompson expressed her pride: "These students represent the best of Riverside High. Their dedication to STEM education and their collaborative spirit make our entire school community proud."</p>

<p>The team's next practice session is scheduled for this Thursday at 6 PM in the school's robotics lab. Students interested in joining the program for next year are encouraged to attend.</p>`,
      featured_image_url: 'https://picsum.photos/800/600?random=1',
      category_id: categoryMap['local news'] || categoryMap['community'] || null,
      author_id: editorAuthor?.id,
      status: 'published',
      location_name: 'Riverside High School',
      views: Math.floor(Math.random() * 2000) + 500,
      likes: Math.floor(Math.random() * 100) + 20,
      shares: Math.floor(Math.random() * 50) + 5,
      published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      title: 'New Downtown Development Project Breaks Ground',
      slug: 'new-downtown-development-project-breaks-ground',
      subtitle: 'Mixed-use complex will bring 200 apartments and retail space to city center',
      excerpt: 'City officials and developers celebrated the groundbreaking of the Riverside Commons, a $45 million mixed-use development that promises to revitalize the downtown core.',
      content: `<p>City officials, developers, and community leaders gathered Tuesday morning for the ceremonial groundbreaking of Riverside Commons, a transformative $45 million mixed-use development project in the heart of downtown Riverside.</p>

<p>The project, spanning three city blocks between Main Street and River Avenue, will feature 200 modern apartments, 25,000 square feet of retail space, and a public plaza designed to serve as a community gathering space.</p>

<h2>Project Details</h2>

<p>Riverside Commons represents the largest downtown development in over two decades. The complex will consist of:</p>

<ul>
<li><strong>Two residential towers</strong> (8 and 12 stories) with 200 apartment units</li>
<li><strong>Ground-floor retail</strong> including a grocery store, restaurants, and local businesses</li>
<li><strong>Public plaza</strong> with seating areas, public art, and event space</li>
<li><strong>Underground parking</strong> for 300 vehicles</li>
<li><strong>Green space</strong> including rooftop gardens and street-level landscaping</li>
</ul>

<blockquote>
<p>"This project represents our commitment to creating a vibrant, walkable downtown that serves residents of all income levels while supporting local businesses." - Mayor Patricia Rodriguez</p>
</blockquote>

<h2>Affordable Housing Component</h2>

<p>In partnership with the city's affordable housing initiative, 40 units (20%) will be designated as affordable housing for families earning up to 80% of the area median income.</p>

<p>"Housing affordability is a critical issue in our community," said Housing Authority Director Michael Thompson. "This project provides market-rate and affordable options in a prime location with access to public transportation and amenities."</p>

<h2>Economic Impact</h2>

<p>The development is expected to create significant economic benefits:</p>

<ul>
<li><strong>500 construction jobs</strong> over the 24-month build period</li>
<li><strong>150 permanent jobs</strong> in retail and property management</li>
<li><strong>$2.3 million annually</strong> in property tax revenue</li>
<li><strong>Support for local businesses</strong> through increased foot traffic</li>
</ul>

<p>Developer James Morrison of Morrison Development Group expressed enthusiasm about the project's potential impact: "We're not just building apartments and shops; we're creating a community hub that will serve as a catalyst for continued downtown growth."</p>

<h2>Sustainable Design</h2>

<p>The project incorporates numerous sustainability features:</p>

<ul>
<li>Solar panels on rooftops generating renewable energy</li>
<li>Electric vehicle charging stations</li>
<li>Energy-efficient building systems and LED lighting</li>
<li>Drought-resistant landscaping and rainwater collection</li>
<li>Bike storage and repair stations</li>
</ul>

<h2>Community Input</h2>

<p>The project design reflects extensive community input gathered through public meetings and surveys over the past 18 months. Key community priorities included:</p>

<ul>
<li>Preservation of downtown's historic character</li>
<li>Support for local and minority-owned businesses</li>
<li>Pedestrian and bicycle-friendly design</li>
<li>Public spaces for community events</li>
</ul>

<p>Community activist Maria Santos praised the inclusive development process: "The developers and city really listened to our concerns and suggestions. This feels like a project by the community, for the community."</p>

<h2>Timeline and Next Steps</h2>

<p>Construction is expected to begin immediately, with the first phase (residential towers) scheduled for completion by fall 2025. The retail component and public plaza will open in early 2026.</p>

<p>The project team has committed to hiring locally when possible and will host monthly community meetings to provide construction updates and address any concerns.</p>

<p>Pre-leasing for apartments will begin in summer 2025, with a preference system for current Riverside residents and workers. Retail space applications are already being accepted through the city's economic development office.</p>`,
      featured_image_url: 'https://picsum.photos/800/600?random=2',
      category_id: categoryMap['business'] || categoryMap['local news'] || null,
      author_id: adminAuthor?.id,
      status: 'published',
      location_name: 'Downtown Riverside',
      views: Math.floor(Math.random() * 1500) + 300,
      likes: Math.floor(Math.random() * 80) + 15,
      shares: Math.floor(Math.random() * 40) + 8,
      published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      title: 'Local Restaurant Wins State Sustainability Award',
      slug: 'local-restaurant-wins-state-sustainability-award',
      subtitle: 'Farm Fork Café recognized for innovative eco-friendly practices',
      excerpt: 'The popular Main Street eatery has been honored by the California Restaurant Association for its commitment to sustainable dining and zero-waste operations.',
      content: `<p>Farm Fork Café, the beloved farm-to-table restaurant on Main Street, has been awarded the prestigious Green Restaurant Excellence Award by the California Restaurant Association, recognizing their outstanding commitment to sustainable dining practices.</p>

<p>The family-owned establishment, operated by chef-owners Maria and Carlos Fernandez since 2018, was selected from over 200 applicants statewide for their innovative approach to eco-friendly restaurant operations.</p>

<h2>Sustainable Practices</h2>

<p>The restaurant has implemented numerous environmentally conscious practices that set them apart in the industry:</p>

<h3>Zero Waste Initiative</h3>
<ul>
<li>Composting all food scraps and organic waste</li>
<li>Partnering with local farms to donate unusable produce for animal feed</li>
<li>Eliminating single-use plastics and disposables</li>
<li>Implementing a comprehensive recycling program</li>
</ul>

<h3>Local Sourcing</h3>
<ul>
<li>Partnering with 15 local farms within a 50-mile radius</li>
<li>Seasonal menu changes based on local harvest schedules</li>
<li>Supporting local producers and reducing transportation emissions</li>
<li>Maintaining an on-site herb and vegetable garden</li>
</ul>

<blockquote>
<p>"Sustainability isn't just good for the environment—it creates better food, supports our local community, and builds a business model that can thrive for generations." - Chef Maria Fernandez</p>
</blockquote>

<h2>Community Impact</h2>

<p>Beyond environmental benefits, Farm Fork Café's practices have created positive ripple effects throughout the community:</p>

<ul>
<li><strong>Supporting 15 local farms</strong> with consistent purchasing commitments</li>
<li><strong>Creating 25 local jobs</strong> with above-average wages and benefits</li>
<li><strong>Educational programs</strong> teaching sustainable cooking to local schools</li>
<li><strong>Community composting</strong> program accepting waste from neighboring businesses</li>
</ul>

<h2>Recognition and Awards</h2>

<p>This latest honor adds to a growing list of recognitions:</p>

<ul>
<li><strong>2023:</strong> Riverside Chamber of Commerce Small Business of the Year</li>
<li><strong>2022:</strong> California Organic Food Awards - Best Restaurant</li>
<li><strong>2021:</strong> National Restaurant Association Community Impact Award</li>
<li><strong>2021:</strong> Zagat Rising Star Restaurant</li>
</ul>

<p>The Green Restaurant Excellence Award comes with a $10,000 grant that the Fernandez family plans to use for expanding their solar panel installation and upgrading to more efficient kitchen equipment.</p>

<h2>Future Plans</h2>

<p>Looking ahead, Farm Fork Café has ambitious plans for further sustainability improvements:</p>

<ul>
<li><strong>Carbon Neutral Goal:</strong> Aiming to become carbon neutral by 2025</li>
<li><strong>Expanded Garden:</strong> Converting adjacent lot into larger urban farm</li>
<li><strong>Education Center:</strong> Developing cooking classes focused on sustainable practices</li>
<li><strong>Mentorship Program:</strong> Helping other restaurants adopt eco-friendly practices</li>
</ul>

<h2>Customer Response</h2>

<p>Regular customer Jennifer Walsh expressed her support: "It's wonderful to eat at a place where you know your money is supporting both great food and environmental responsibility. The fact that it's also supporting local farmers makes it even better."</p>

<p>The restaurant has seen increased patronage since implementing their sustainability programs, with many customers specifically seeking out eco-conscious dining options.</p>

<h2>Industry Leadership</h2>

<p>Industry experts note that Farm Fork Café's success demonstrates the viability of sustainable restaurant operations.</p>

<p>"They've proven that environmental responsibility and business success go hand in hand," said Dr. Sarah Kim, professor of sustainable business practices at UC Davis. "Their model is being studied by restaurants across California."</p>

<p>The California Restaurant Association plans to feature Farm Fork Café's practices in their upcoming sustainability guide for restaurant owners.</p>

<p>Farm Fork Café is located at 456 Main Street and is open Tuesday through Sunday for lunch and dinner. Reservations are recommended and can be made online or by calling (555) 234-5678.</p>`,
      featured_image_url: 'https://picsum.photos/800/600?random=3',
      category_id: categoryMap['business'] || categoryMap['community'] || null,
      author_id: editorAuthor?.id,
      status: 'published',
      location_name: 'Main Street, Riverside',
      views: Math.floor(Math.random() * 1200) + 200,
      likes: Math.floor(Math.random() * 70) + 10,
      shares: Math.floor(Math.random() * 35) + 5,
      published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
    }
  ]

  let createdCount = 0

  for (const article of sampleArticles) {
    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', article.slug)
        .single()

      if (existing) {
        console.log(`   ℹ️  Article "${article.title}" already exists, skipping`)
        continue
      }

      const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select()
        .single()

      if (error) throw error

      console.log(`   ✅ Created article: ${article.title}`)
      createdCount++

    } catch (error) {
      console.error(`   ❌ Failed to create article "${article.title}":`, error)
    }
  }

  console.log(`\n📊 Created ${createdCount} new articles`)
}

async function main() {
  console.log('🚀 Adding Sample Articles...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  await createSampleArticles()
  
  console.log('\n🎉 Sample Articles Added!')
  console.log('📍 You can now visit:')
  console.log('   • /articles/local-high-school-robotics-team-wins-regional-championship')
  console.log('   • /articles/new-downtown-development-project-breaks-ground')
  console.log('   • /articles/local-restaurant-wins-state-sustainability-award') 
  console.log('   • /articles (to see all articles)')
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}