'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { LogIn, LogOut, User, ChevronDown } from 'lucide-react'
import AuthModal from './AuthModal'

export default function AuthButton() {
  const { user, profile, signOut, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-300 rounded-full h-8 w-20"></div>
      </div>
    )
  }

  if (user && profile) {
    return (
      <div className="relative">
        {/* User Menu Button */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {profile.full_name || user.email?.split('@')[0]}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              {profile.role && (
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {profile.role}
                </span>
              )}
            </div>
            
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Profile Settings
            </Link>
            
            {(profile.role === 'admin' || profile.role === 'editor') && (
              <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Admin Panel
              </Link>
            )}
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close menu */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </div>
    )
  }

  return (
    <>
      {/* Auth Buttons for non-authenticated users */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleAuthClick('login')}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </button>
        
        <button
          onClick={() => handleAuthClick('signup')}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          <User className="w-4 h-4 mr-2" />
          Sign Up
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}