import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

async function getFooterData() {
  const supabase = await createClient()
  
  // Get site settings for footer content
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'site_name', 'site_description', 'contact_address',
      'contact_phone', 'contact_email', 'social_facebook',
      'social_twitter', 'social_instagram'
    ])
  
  const settingsMap = settings?.reduce((acc, setting) => ({
    ...acc,
    [setting.key]: tryParseJSON(setting.value)
  }), {} as Record<string, any>) || {}

  function tryParseJSON(value: string) {
    try {
      return JSON.parse(value)
    } catch {
      return value // Return as-is if not valid JSON
    }
  }

  // Get footer menu items
  const { data: menuData } = await supabase
    .from('menus')
    .select(`
      id, name,
      menu_items:menu_items!inner(
        id, title, url, page_id, sort_order, is_active,
        pages:page_id(slug)
      )
    `)
    .eq('location', 'footer')
    .eq('is_active', true)
    .single()

  const menuItems = menuData?.menu_items
    ?.filter(item => item.is_active)
    ?.sort((a, b) => a.sort_order - b.sort_order)
    ?.map(item => ({
      title: item.title,
      href: item.url || (item.pages ? `/pages/${Array.isArray(item.pages) ? (item.pages as any)[0]?.slug : (item.pages as any)?.slug}` : '#')
    })) || []

  // Get locations for contact info
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .limit(1)

  return {
    siteName: settingsMap.site_name || 'The Riverside Herald',
    description: settingsMap.site_description || 'Your trusted source for local news',
    contact: {
      address: settingsMap.contact_address || locations?.[0]?.address,
      phone: settingsMap.contact_phone || locations?.[0]?.phone,
      email: settingsMap.contact_email || locations?.[0]?.email
    },
    social: {
      facebook: settingsMap.social_facebook,
      twitter: settingsMap.social_twitter,
      instagram: settingsMap.social_instagram
    },
    menuItems
  }
}

export async function Footer() {
  const { siteName, description, contact, social, menuItems } = await getFooterData()

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container-wide">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">
                  {siteName.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
                </span>
              </div>
              <span className="font-bold text-lg">{siteName}</span>
            </div>
            <p className="text-neutral-300 mb-4">{description}</p>
            <div className="flex space-x-4">
              {social.facebook && (
                <a href={social.facebook} className="text-neutral-400 hover:text-white">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} className="text-neutral-400 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} className="text-neutral-400 hover:text-white">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-neutral-300 hover:text-white">Home</Link></li>
              <li><Link href="/articles" className="text-neutral-300 hover:text-white">Latest News</Link></li>
              <li><Link href="/businesses" className="text-neutral-300 hover:text-white">Business Directory</Link></li>
              {menuItems.slice(0, 4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-neutral-300 hover:text-white">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/advertise" className="text-neutral-300 hover:text-white">Advertise With Us</Link></li>
              <li><Link href="/newsletter" className="text-neutral-300 hover:text-white">Newsletter</Link></li>
              <li><Link href="/submit-story" className="text-neutral-300 hover:text-white">Submit a Story</Link></li>
              <li><Link href="/careers" className="text-neutral-300 hover:text-white">Careers</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              {contact.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <span className="text-neutral-300 text-sm">{contact.address}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-300">{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-300">{contact.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-neutral-400 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white text-sm">Terms of Service</Link>
              <Link href="/cookies" className="text-neutral-400 hover:text-white text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}