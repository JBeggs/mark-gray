import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { MobileNav } from './MobileNav'
import ClientHeader from './ClientHeader'

async function getHeaderData() {
  const supabase = await createClient()
  
  // Get site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['site_name', 'site_tagline', 'site_logo'])
  
  function tryParseJSON(value: string) {
    try {
      return JSON.parse(value)
    } catch {
      return value // Return as-is if not valid JSON
    }
  }

  const settingsMap = settings?.reduce((acc, setting) => ({
    ...acc,
    [setting.key]: tryParseJSON(setting.value)
  }), {} as Record<string, any>) || {}

  // Get main navigation menu
  const { data: menuData } = await supabase
    .from('menus')
    .select(`
      id, name,
      menu_items:menu_items!inner(
        id, title, url, page_id, sort_order, is_active,
        pages:page_id(slug)
      )
    `)
    .eq('location', 'header')
    .eq('is_active', true)
    .single()

  const menuItems = menuData?.menu_items
    ?.filter(item => item.is_active)
    ?.sort((a, b) => a.sort_order - b.sort_order)
    ?.map(item => ({
      title: item.title,
      href: item.url || (item.pages ? `/pages/${item.pages.slug}` : '#')
    })) || []

  return {
    siteName: settingsMap.site_name || 'The Riverside Herald',
    tagline: settingsMap.site_tagline || 'Your Local News Source',
    logo: settingsMap.site_logo,
    menuItems
  }
}

export async function Header() {
  const { siteName, tagline, menuItems } = await getHeaderData()

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white">
        <div className="container-wide">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/newsletter" className="hover:text-blue-400">Newsletter</Link>
              <Link href="/contact" className="hover:text-blue-400">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-wide">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {siteName.split(' ').map(word => word[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{siteName}</h1>
                <p className="text-sm text-neutral-600">{tagline}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation & Auth */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="nav-link">Home</Link>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.title}
                </Link>
              ))}
            </nav>
            
            {/* Auth Button */}
            <div className="hidden md:block">
              <ClientHeader />
            </div>
          </div>

          {/* Mobile Navigation */}
          <MobileNav menuItems={menuItems} />
        </div>
      </div>
    </header>
  )
}