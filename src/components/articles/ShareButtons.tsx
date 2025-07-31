'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, Linkedin, Link2, Mail, Check } from 'lucide-react'

interface ShareButtonsProps {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  // Safely get the full URL
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}` 
    : `https://riversideherald.com${url}` // fallback for SSR
  
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(fullUrl)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=Check out this article: ${fullUrl}`
  }

  const copyToClipboard = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Share Menu */}
      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 -z-10"
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Options */}
          <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[200px]">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Share this article</h3>
            
            <div className="space-y-2">
              {/* Facebook */}
              <button
                onClick={() => openShare('facebook')}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Facebook className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Facebook</span>
              </button>

              {/* Twitter */}
              <button
                onClick={() => openShare('twitter')}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mr-3">
                  <Twitter className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Twitter</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => openShare('linkedin')}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center mr-3">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">LinkedIn</span>
              </button>

              {/* Email */}
              <button
                onClick={() => openShare('email')}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Email</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Link2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-gray-700">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Share Button */}
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        <Share2 className="w-6 h-6" />
      </button>
    </div>
  )
}