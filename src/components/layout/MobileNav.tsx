'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Bell } from 'lucide-react'

interface MenuItem {
  title: string
  href: string
}

interface MobileNavProps {
  menuItems: MenuItem[]
}

export function MobileNav({ menuItems }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-neutral-600 hover:text-blue-600">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 text-neutral-600 hover:text-blue-600">
          <Bell className="w-5 h-5" />
        </button>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-neutral-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-white border-b border-neutral-200 shadow-lg">
          <nav className="container-wide py-4 space-y-2">
            <Link 
              href="/" 
              className="block py-2 text-neutral-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="block py-2 text-neutral-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}