'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Profile } from '@/lib/types'
import { 
  Building2, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Edit3,
  TrendingUp,
  User,
  CheckCircle
} from 'lucide-react'

// Custom SVG icons for missing lucide-react icons
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-3-6.943 4 4 0 013 6.943z" />
  </svg>
)

const ExternalLink = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

interface BusinessOwnerSectionProps {
  businesses: any[]
  profile: Profile
}

export default function BusinessOwnerSection({ businesses, profile }: BusinessOwnerSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const totalReviews = businesses.reduce((sum, business) => sum + (business.review_count || 0), 0)
  const averageRating = businesses.length > 0 
    ? businesses.reduce((sum, business) => sum + (business.rating || 0), 0) / businesses.length 
    : 0
  const verifiedCount = businesses.filter(business => business.is_verified).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Businesses</h2>
          <p className="text-gray-600 mt-1">Manage your business listings and track performance</p>
        </div>
        <Link
          href="/businesses/add"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Business</span>
        </Link>
      </div>

      {/* Stats Overview */}
      {businesses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-3xl font-bold text-gray-900">{businesses.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-purple-600">{totalReviews}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {businesses.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/businesses/add"
              className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Add New Business</p>
                <p className="text-sm text-gray-600">List another business</p>
              </div>
            </Link>

            <Link
              href="/businesses?verified=false"
              className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Get Verified</p>
                <p className="text-sm text-gray-600">Boost credibility</p>
              </div>
            </Link>

            <Link
              href="/businesses/analytics"
              className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Track performance</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Business Listings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-6">Your Businesses</h3>
        
        {businesses.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first business listing</p>
            <Link
              href="/businesses/add"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Business</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {businesses.map((business) => (
              <div key={business.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Business Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  {business.logo_url && (
                    <div className="absolute bottom-4 left-4">
                      <div className="w-16 h-16 bg-white rounded-lg p-2 shadow-lg">
                        <Image
                          src={business.logo_url}
                          alt={business.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {business.is_verified && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-600 rounded-full text-white text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {business.name}
                      </h4>
                      {business.industry && (
                        <p className="text-sm text-gray-600">{business.industry}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <Link
                        href={`/businesses/${business.slug}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="View business"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Edit business"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(business.rating || 0)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {(business.rating || 0).toFixed(1)} ({business.review_count || 0} reviews)
                    </span>
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{business.city || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <span>Listed since {formatDate(business.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <Link
                      href={`/businesses/${business.slug}`}
                      className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Public Page
                    </Link>
                    <button className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Business Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">💡 Tips for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Complete your profile</p>
              <p className="text-blue-700">Add photos, descriptions, and contact info</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Get verified</p>
              <p className="text-blue-700">Verified businesses get more visibility</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Encourage reviews</p>
              <p className="text-blue-700">Positive reviews boost your ranking</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Keep info updated</p>
              <p className="text-blue-700">Fresh information improves customer trust</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}