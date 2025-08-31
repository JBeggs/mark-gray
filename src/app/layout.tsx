import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import '../styles/pages.css'
import { createClient, createSupabaseBuildClient } from '@/lib/supabase-server'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import AuthMessage from '@/components/auth/AuthMessage'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

// Get dynamic metadata from database
async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = createSupabaseBuildClient() // Use build client (no cookies)
    
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['site_name', 'site_tagline', 'site_description'])
    
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
    
    const siteName = settingsMap.site_name || 'The Riverside Herald'
    const tagline = settingsMap.site_tagline || 'Your Local News Source'
    const description = settingsMap.site_description || 'Stay informed with local news and community updates'
    
    return {
      title: `${siteName} | ${tagline}`,
      description,
      openGraph: {
        title: `${siteName} | ${tagline}`,
        description,
        type: 'website',
      },
    }
  } catch (error) {
    // Fallback metadata if database is unavailable
    return {
      title: 'The Riverside Herald | Your Local News Source',
      description: 'Stay informed with local news and community updates',
    }
  }
}

export const metadata = await generateMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Suspense fallback={null}>
            <AuthMessage />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}