#!/usr/bin/env tsx

/**
 * Add Newsletter Page and Enhance Content
 * Adds missing Newsletter page and improves existing page content
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

async function addNewsletterPage() {
  console.log('📰 Adding Newsletter page...')
  
  // Get admin user
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  
  if (!admin) {
    console.error('❌ No admin user found')
    return
  }

  // Check if Newsletter page already exists
  const { data: existingPage } = await supabase
    .from('pages')
    .select('id')
    .eq('slug', 'newsletter')
    .single()
  
  if (existingPage) {
    console.log('   ℹ️  Newsletter page already exists')
    return
  }

  // Create Newsletter page
  const newsletterPage = {
    title: 'Newsletter',
    slug: 'newsletter',
    page_type: 'custom',
    content: `<div class="newsletter-page">
  <h1>Stay Informed with The Riverside Herald Newsletter</h1>
  
  <p class="lead">Get the latest local news, community updates, and exclusive content delivered straight to your inbox. Join thousands of Riverside residents who trust us to keep them informed.</p>
  
  <div class="newsletter-benefits">
    <h2>What You'll Get</h2>
    <ul>
      <li><strong>Daily News Digest:</strong> Top local stories every morning</li>
      <li><strong>Weekly Business Roundup:</strong> Local business news and opportunities</li>
      <li><strong>Community Events:</strong> Never miss important community happenings</li>
      <li><strong>Breaking News Alerts:</strong> Instant notifications for urgent news</li>
      <li><strong>Exclusive Content:</strong> Subscriber-only articles and insights</li>
      <li><strong>Local Government Updates:</strong> City council, school board, and more</li>
    </ul>
  </div>

  <div class="newsletter-signup">
    <h2>Subscribe Today</h2>
    <p>Join our community of informed residents. It's free and you can unsubscribe anytime.</p>
    
    <form class="newsletter-form" action="/api/newsletter/subscribe" method="post">
      <div class="form-group">
        <label for="newsletter-email">Email Address</label>
        <input type="email" id="newsletter-email" name="email" required placeholder="Enter your email address">
      </div>
      
      <div class="form-group">
        <label for="newsletter-name">Full Name (Optional)</label>
        <input type="text" id="newsletter-name" name="name" placeholder="Your full name">
      </div>
      
      <div class="form-group">
        <label>Newsletter Preferences</label>
        <div class="checkbox-group">
          <label><input type="checkbox" name="preferences[]" value="daily" checked> Daily News Digest</label>
          <label><input type="checkbox" name="preferences[]" value="weekly" checked> Weekly Business Roundup</label>
          <label><input type="checkbox" name="preferences[]" value="events" checked> Community Events</label>
          <label><input type="checkbox" name="preferences[]" value="breaking" checked> Breaking News Alerts</label>
        </div>
      </div>
      
      <button type="submit" class="btn btn-primary">Subscribe to Newsletter</button>
    </form>
  </div>

  <div class="newsletter-archive">
    <h2>Newsletter Archive</h2>
    <p>Catch up on recent newsletters:</p>
    <ul>
      <li><a href="/newsletter/archive/2024-01-15">January 15, 2024 - City Budget Approved, New Business Opens</a></li>
      <li><a href="/newsletter/archive/2024-01-08">January 8, 2024 - School Board Elections, Community Garden Project</a></li>
      <li><a href="/newsletter/archive/2024-01-01">January 1, 2024 - New Year, New Projects for Riverside</a></li>
    </ul>
    <p><a href="/newsletter/archive">View All Newsletter Archives →</a></p>
  </div>

  <div class="newsletter-testimonials">
    <h2>What Subscribers Say</h2>
    <blockquote>
      <p>"The Riverside Herald newsletter keeps me connected to my community. I never miss important local news now!"</p>
      <cite>— Sarah Johnson, Riverside Resident</cite>
    </blockquote>
    
    <blockquote>
      <p>"As a local business owner, the weekly business roundup helps me stay competitive and informed about opportunities."</p>
      <cite>— Mike Chen, Local Business Owner</cite>
    </blockquote>
  </div>

  <div class="newsletter-privacy">
    <h3>Privacy Commitment</h3>
    <p>We respect your privacy. Your email address will never be shared, sold, or used for anything other than delivering our newsletter. You can unsubscribe at any time with one click.</p>
  </div>
</div>`,
    meta_title: 'Newsletter - Stay Informed with The Riverside Herald',
    meta_description: 'Subscribe to The Riverside Herald newsletter for daily local news, community updates, business roundups, and exclusive content delivered to your inbox.',
    meta_keywords: ['newsletter', 'local news', 'community updates', 'subscribe', 'riverside news'],
    is_published: true,
    is_in_menu: true,
    menu_order: 4,
    created_by: admin.id,
    updated_by: admin.id
  }

  const { data, error } = await supabase
    .from('pages')
    .insert(newsletterPage)
    .select()
    .single()

  if (error) {
    console.error('❌ Failed to create Newsletter page:', error)
    return
  }

  console.log('   ✅ Created Newsletter page')
  return data
}

async function enhanceContactPage() {
  console.log('📞 Enhancing Contact page...')
  
  const enhancedContactContent = `<div class="contact-page">
  <h1>Contact The Riverside Herald</h1>
  
  <p class="lead">We're here to serve the Riverside community. Whether you have a news tip, feedback, advertising inquiry, or just want to get involved, we'd love to hear from you.</p>

  <div class="contact-grid">
    <div class="contact-section">
      <h2>📰 Newsroom</h2>
      <p>Have a story idea, news tip, or want to report on community events?</p>
      <ul class="contact-list">
        <li><strong>Editor-in-Chief:</strong> <a href="mailto:editor@riversideherald.com">editor@riversideherald.com</a></li>
        <li><strong>News Tips:</strong> <a href="mailto:tips@riversideherald.com">tips@riversideherald.com</a></li>
        <li><strong>Phone:</strong> <a href="tel:+15551234567">(555) 123-4567</a></li>
        <li><strong>Text Tips:</strong> <a href="sms:+15551234568">(555) 123-4568</a></li>
      </ul>
    </div>

    <div class="contact-section">
      <h2>🏢 Business Directory & Advertising</h2>
      <p>Promote your business and connect with the local community.</p>
      <ul class="contact-list">
        <li><strong>Advertising Sales:</strong> <a href="mailto:ads@riversideherald.com">ads@riversideherald.com</a></li>
        <li><strong>Business Directory:</strong> <a href="mailto:directory@riversideherald.com">directory@riversideherald.com</a></li>
        <li><strong>Phone:</strong> <a href="tel:+15551234569">(555) 123-4569</a></li>
      </ul>
    </div>

    <div class="contact-section">
      <h2>📧 General Inquiries</h2>
      <p>Questions, feedback, or partnership opportunities.</p>
      <ul class="contact-list">
        <li><strong>General Info:</strong> <a href="mailto:info@riversideherald.com">info@riversideherald.com</a></li>
        <li><strong>Customer Service:</strong> <a href="mailto:support@riversideherald.com">support@riversideherald.com</a></li>
        <li><strong>Partnerships:</strong> <a href="mailto:partnerships@riversideherald.com">partnerships@riversideherald.com</a></li>
      </ul>
    </div>
  </div>

  <div class="office-info">
    <h2>🏛️ Our Office</h2>
    <div class="office-details">
      <div class="address">
        <h3>Address</h3>
        <p>The Riverside Herald<br>
        123 Main Street, Suite 200<br>
        Riverside, CA 92501</p>
      </div>
      
      <div class="hours">
        <h3>Office Hours</h3>
        <p>Monday - Friday: 9:00 AM - 5:00 PM<br>
        Saturday: 10:00 AM - 2:00 PM<br>
        Sunday: Closed<br>
        <em>Newsroom operates 24/7 for breaking news</em></p>
      </div>
    </div>
  </div>

  <div class="contact-form-section">
    <h2>📝 Send Us a Message</h2>
    <p>Use the form below to send us a message directly. We'll get back to you within 24 hours.</p>
    
    <form class="contact-form" action="/api/contact" method="post">
      <div class="form-row">
        <div class="form-group">
          <label for="contact-name">Full Name *</label>
          <input type="text" id="contact-name" name="name" required>
        </div>
        
        <div class="form-group">
          <label for="contact-email">Email Address *</label>
          <input type="email" id="contact-email" name="email" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="contact-phone">Phone Number</label>
          <input type="tel" id="contact-phone" name="phone">
        </div>
        
        <div class="form-group">
          <label for="contact-subject">Subject *</label>
          <select id="contact-subject" name="subject" required>
            <option value="">Select a subject</option>
            <option value="news-tip">News Tip</option>
            <option value="story-idea">Story Idea</option>
            <option value="advertising">Advertising Inquiry</option>
            <option value="business-directory">Business Directory</option>
            <option value="feedback">Feedback</option>
            <option value="partnership">Partnership</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="contact-message">Message *</label>
        <textarea id="contact-message" name="message" rows="6" required placeholder="Tell us more about your inquiry..."></textarea>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" name="newsletter" value="yes">
          Subscribe to our newsletter for local news updates
        </label>
      </div>
      
      <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
  </div>

  <div class="social-media">
    <h2>🌐 Follow Us</h2>
    <p>Stay connected with us on social media for real-time updates:</p>
    <div class="social-links">
      <a href="https://facebook.com/riversideherald" target="_blank">📘 Facebook</a>
      <a href="https://twitter.com/riversideherald" target="_blank">🐦 Twitter</a>
      <a href="https://instagram.com/riversideherald" target="_blank">📷 Instagram</a>
      <a href="https://linkedin.com/company/riversideherald" target="_blank">💼 LinkedIn</a>
    </div>
  </div>

  <div class="emergency-contact">
    <h2>🚨 Breaking News & Emergencies</h2>
    <p>For urgent news tips or breaking news situations:</p>
    <ul>
      <li><strong>24/7 News Hotline:</strong> <a href="tel:+15551234599">(555) 123-4599</a></li>
      <li><strong>Emergency Email:</strong> <a href="mailto:breaking@riversideherald.com">breaking@riversideherald.com</a></li>
      <li><strong>Text Alerts:</strong> Text "BREAKING" to <a href="sms:+15551234599">55512</a></li>
    </ul>
  </div>
</div>`

  const { error } = await supabase
    .from('pages')
    .update({ 
      content: enhancedContactContent,
      meta_description: 'Contact The Riverside Herald for news tips, advertising inquiries, business directory listings, and general information. Multiple ways to reach our newsroom and team.',
      updated_at: new Date().toISOString()
    })
    .eq('slug', 'contact')

  if (error) {
    console.error('❌ Failed to enhance Contact page:', error)
    return
  }

  console.log('   ✅ Enhanced Contact page content')
}

async function createNewsletterSubscribers() {
  console.log('📧 Adding sample newsletter subscribers...')
  
  const subscribers = [
    {
      email: 'sarah.johnson@email.com',
      full_name: 'Sarah Johnson',
      preferences: ['daily', 'events'],
      is_active: true,
      subscribed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    },
    {
      email: 'mike.chen@business.com',
      full_name: 'Mike Chen',
      preferences: ['daily', 'weekly', 'breaking'],
      is_active: true,
      subscribed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
    },
    {
      email: 'lisa.martinez@email.com',
      full_name: 'Lisa Martinez',
      preferences: ['weekly', 'events'],
      is_active: true,
      subscribed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    }
  ]

  for (const subscriber of subscribers) {
    try {
      // Check if subscriber already exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', subscriber.email)
        .single()

      if (existing) {
        console.log(`   ℹ️  Subscriber ${subscriber.email} already exists`)
        continue
      }

      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert(subscriber)

      if (error) throw error

      console.log(`   ✅ Added subscriber: ${subscriber.full_name}`)
    } catch (error) {
      console.error(`   ❌ Failed to add subscriber ${subscriber.email}:`, error)
    }
  }
}

async function main() {
  console.log('🚀 Adding Newsletter Page and Enhancing Content...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  await addNewsletterPage()
  await enhanceContactPage()
  await createNewsletterSubscribers()
  
  console.log('\n🎉 Content Enhancement Complete!')
  console.log('📊 Summary:')
  console.log('   • Newsletter page added with subscription form')
  console.log('   • Contact page enhanced with detailed information')
  console.log('   • Sample newsletter subscribers added')
  console.log('   • Ready for /newsletter and /contact routes!')
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}