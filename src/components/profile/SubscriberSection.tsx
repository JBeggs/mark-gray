'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { 
  Star, 
  Calendar, 
  CheckCircle,
  X,
  Mail,
  Bell,
  TrendingUp
} from 'lucide-react'

// Custom icons for missing lucide-react icons
const Crown = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11l5-5 4 4 8-8 1 1-9 9-4-4-5 5z" />
  </svg>
)

const CreditCard = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const Gift = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 20h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
  </svg>
)

const Bookmark = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const Download = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const Award = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const Zap = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

interface SubscriberSectionProps {
  profile: Profile
}

export default function SubscriberSection({ profile }: SubscriberSectionProps) {
  const [isManagingSubscription, setIsManagingSubscription] = useState(false)
  
  const isPremium = profile.role === 'premium_subscriber'
  const isSubscriber = profile.role === 'subscriber' || isPremium

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const standardFeatures = [
    { name: 'Access to all articles', included: true },
    { name: 'Newsletter subscription', included: true },
    { name: 'Comment on articles', included: true },
    { name: 'Basic profile features', included: true },
    { name: 'Article bookmarks', included: false },
    { name: 'Offline reading', included: false },
    { name: 'Premium content', included: false },
    { name: 'Ad-free experience', included: false },
    { name: 'Early article access', included: false },
    { name: 'Member-only events', included: false }
  ]

  const premiumFeatures = [
    { name: 'All standard features', included: true },
    { name: 'Article bookmarks', included: true },
    { name: 'Offline reading', included: true },
    { name: 'Premium exclusive content', included: true },
    { name: 'Ad-free experience', included: true },
    { name: 'Early article access', included: true },
    { name: 'Member-only events', included: true },
    { name: 'Priority customer support', included: true },
    { name: 'Monthly community calls', included: true },
    { name: 'Digital magazine archive', included: true }
  ]

  const currentFeatures = isPremium ? premiumFeatures : standardFeatures

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className={`w-8 h-8 ${isPremium ? 'text-yellow-600' : 'text-gray-400'}`} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isPremium ? 'Premium Subscription' : isSubscriber ? 'Standard Subscription' : 'Subscription'}
            </h2>
            <p className="text-gray-600">
              {isPremium 
                ? 'You have access to all premium features' 
                : isSubscriber 
                ? 'You\'re subscribed to our newsletter and updates'
                : 'Subscribe to get the most out of our platform'
              }
            </p>
          </div>
        </div>
        
        {isSubscriber && (
          <button
            onClick={() => setIsManagingSubscription(!isManagingSubscription)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Manage Subscription
          </button>
        )}
      </div>

      {/* Current Status */}
      <div className={`rounded-lg p-6 border ${isPremium ? 'bg-yellow-50 border-yellow-200' : isSubscriber ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isPremium ? 'bg-yellow-100' : isSubscriber ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {isPremium ? (
                <Crown className="w-6 h-6 text-yellow-600" />
              ) : isSubscriber ? (
                <Star className="w-6 h-6 text-blue-600" />
              ) : (
                <Mail className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isPremium ? 'text-yellow-900' : isSubscriber ? 'text-blue-900' : 'text-gray-900'}`}>
                {isPremium ? 'Premium Member' : isSubscriber ? 'Standard Subscriber' : 'Free Account'}
              </h3>
              <p className={`text-sm ${isPremium ? 'text-yellow-700' : isSubscriber ? 'text-blue-700' : 'text-gray-600'}`}>
                {isPremium 
                  ? 'Full access to all premium features and content'
                  : isSubscriber 
                  ? 'Newsletter subscriber with basic features'
                  : 'Limited access to free content only'
                }
              </p>
            </div>
          </div>
          
          {isPremium && (
            <div className="text-right">
              <p className="text-sm text-yellow-700">Member since</p>
              <p className="font-medium text-yellow-900">{formatDate(profile.created_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Comparison */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-6">Your Features</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {currentFeatures.map((feature, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between">
                <span className="text-gray-900">{feature.name}</span>
                {feature.included ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Section (for non-premium users) */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-8 text-white">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Upgrade to Premium</h3>
              <p className="text-purple-100">Unlock all features and get the full experience</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <Bookmark className="w-6 h-6 mb-2" />
              <h4 className="font-semibold mb-1">Save Articles</h4>
              <p className="text-sm text-purple-100">Bookmark articles for later reading</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <Download className="w-6 h-6 mb-2" />
              <h4 className="font-semibold mb-1">Offline Reading</h4>
              <p className="text-sm text-purple-100">Download articles for offline access</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <Award className="w-6 h-6 mb-2" />
              <h4 className="font-semibold mb-1">Exclusive Content</h4>
              <p className="text-sm text-purple-100">Access premium articles and insights</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Upgrade to Premium - $9.99/month
            </button>
            <span className="text-purple-100">or $99/year (save 17%)</span>
          </div>
        </div>
      )}

      {/* Reading Stats (for subscribers) */}
      {isSubscriber && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Articles Read</p>
                <p className="text-3xl font-bold text-gray-900">47</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookmarks</p>
                <p className="text-3xl font-bold text-purple-600">{isPremium ? '12' : '0'}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Bookmark className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reading Streak</p>
                <p className="text-3xl font-bold text-green-600">7 days</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Newsletter Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Weekly Newsletter</p>
              <p className="text-sm text-gray-600">Get our weekly roundup of top stories</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Breaking News Alerts</p>
              <p className="text-sm text-gray-600">Instant notifications for important news</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {isPremium && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Premium Digest</p>
                <p className="text-sm text-gray-600">Exclusive premium content updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Management (for subscribers) */}
      {isSubscriber && isManagingSubscription && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <p className="font-medium text-gray-900">
                  {isPremium ? 'Premium Subscription' : 'Standard Subscription'}
                </p>
                <p className="text-sm text-gray-600">
                  {isPremium ? '$9.99/month' : 'Free'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Next billing</p>
                <p className="font-medium text-gray-900">
                  {isPremium ? 'January 15, 2024' : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Update Payment Method
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Billing History
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Fix import for BookOpen
const BookOpen = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)