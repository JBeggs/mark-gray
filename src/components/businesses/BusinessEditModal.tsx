'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface BusinessEditModalProps {
  businessId: string
  onClose: () => void
  onSuccess: () => void
}

interface BusinessData {
  name: string
  slug: string
  description: string
  long_description: string
  industry: string
  website_url: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip_code: string
  services: string[]
  business_hours: Record<string, string>
  social_links: Record<string, string>
  logo_url: string
  cover_image_url: string
  available_images: string[]
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

const socialPlatforms = [
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'youtube',
  'tiktok'
]

export function BusinessEditModal({ businessId, onClose, onSuccess }: BusinessEditModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    industry: '',
    website_url: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    services: [],
    business_hours: {},
    social_links: {},
    logo_url: '',
    cover_image_url: '',
    available_images: []
  })

  const [newService, setNewService] = useState('')
  const [newSocialPlatform, setNewSocialPlatform] = useState('')
  const [newSocialUrl, setNewSocialUrl] = useState('')

  useEffect(() => {
    fetchBusinessData()
  }, [businessId])

  // Helper functions to convert business hours
  const formatHoursForDisplay = (hours: any): Record<string, string> => {
    if (!hours || typeof hours !== 'object') return {}
    
    const formatted: Record<string, string> = {}
    for (const [day, time] of Object.entries(hours)) {
      if (time && typeof time === 'object' && 'open' in time && 'close' in time) {
        const timeObj = time as { open: string; close: string; closed?: boolean }
        if (timeObj.closed) {
          formatted[day] = 'Closed'
        } else {
          formatted[day] = `${timeObj.open} - ${timeObj.close}`
        }
      } else if (typeof time === 'string') {
        formatted[day] = time
      } else {
        formatted[day] = ''
      }
    }
    return formatted
  }

  const parseHoursForSaving = (hours: Record<string, string>): Record<string, any> => {
    const parsed: Record<string, any> = {}
    for (const [day, timeString] of Object.entries(hours)) {
      if (!timeString || timeString.toLowerCase() === 'closed') {
        parsed[day] = { closed: true }
      } else if (timeString.includes(' - ')) {
        const [open, close] = timeString.split(' - ')
        parsed[day] = { open: open.trim(), close: close.trim() }
      } else {
        parsed[day] = timeString // Keep as string if not in expected format
      }
    }
    return parsed
  }

  const fetchBusinessData = async () => {
    const supabase = createClient()
    
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()

      if (error) {
        setError('Error fetching business data')
        return
      }

      setBusinessData({
        name: business.name || '',
        slug: business.slug || '',
        description: business.description || '',
        long_description: business.long_description || '',
        industry: business.industry || '',
        website_url: business.website_url || '',
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        zip_code: business.zip_code || '',
        services: business.services || [],
        business_hours: formatHoursForDisplay(business.business_hours),
        social_links: business.social_links || {},
        logo_url: business.logo_url || '',
        cover_image_url: business.cover_image_url || '',
        available_images: business.available_images || []
      })
    } catch (error: any) {
      setError(error.message || 'Error fetching business data')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
  }

  const handleInputChange = (field: keyof BusinessData, value: any) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug when name changes
    if (field === 'name') {
      setBusinessData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const addService = () => {
    if (newService.trim()) {
      setBusinessData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }))
      setNewService('')
    }
  }

  const removeService = (index: number) => {
    setBusinessData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const addSocialLink = () => {
    if (newSocialPlatform && newSocialUrl.trim()) {
      setBusinessData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [newSocialPlatform]: newSocialUrl.trim()
        }
      }))
      setNewSocialPlatform('')
      setNewSocialUrl('')
    }
  }

  const removeSocialLink = (platform: string) => {
    setBusinessData(prev => {
      const newSocialLinks = { ...prev.social_links }
      delete newSocialLinks[platform]
      return {
        ...prev,
        social_links: newSocialLinks
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: businessData.name,
          slug: businessData.slug,
          description: businessData.description,
          long_description: businessData.long_description,
          industry: businessData.industry,
          website_url: businessData.website_url,
          phone: businessData.phone,
          email: businessData.email,
          address: businessData.address,
          city: businessData.city,
          state: businessData.state,
          zip_code: businessData.zip_code,
          services: businessData.services,
          business_hours: parseHoursForSaving(businessData.business_hours),
          social_links: businessData.social_links,
          logo_url: businessData.logo_url,
          cover_image_url: businessData.cover_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)

      if (error) {
        setError(error.message)
        return
      }

      onSuccess()
    } catch (error: any) {
      setError(error.message || 'Error saving business data')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Loading business data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Business Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Basic Info' },
              { id: 'contact', label: 'Contact' },
              { id: 'services', label: 'Services' },
              { id: 'hours', label: 'Hours' },
              { id: 'social', label: 'Social Media' },
              { id: 'images', label: 'Images' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={businessData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="business-name-url"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry/Category
                  </label>
                  <input
                    type="text"
                    value={businessData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Restaurant, Retail, Professional Services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={businessData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your business"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={businessData.long_description}
                    onChange={(e) => handleInputChange('long_description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of your business, services, history, etc."
                  />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={businessData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={businessData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@business.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={businessData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.yourbusiness.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={businessData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={businessData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={businessData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={businessData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Offered
                  </label>
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add a service"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                    />
                    <button
                      type="button"
                      onClick={addService}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-2">
                    {businessData.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span>{service}</span>
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Hours Tab */}
            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Business Hours
                  </label>
                  <div className="space-y-3">
                    {daysOfWeek.map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-4">
                        <div className="w-24 text-sm font-medium text-gray-700">{label}</div>
                        <input
                          type="text"
                          value={businessData.business_hours[key] || ''}
                          onChange={(e) => handleInputChange('business_hours', {
                            ...businessData.business_hours,
                            [key]: e.target.value
                          })}
                          placeholder="e.g. 9:00 AM - 5:00 PM or Closed"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Links
                  </label>
                  <div className="flex space-x-2 mb-4">
                    <select
                      value={newSocialPlatform}
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select platform</option>
                      {socialPlatforms.filter(platform => !businessData.social_links[platform]).map(platform => (
                        <option key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addSocialLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(businessData.social_links).map(([platform, url]) => (
                      <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <span className="font-medium capitalize">{platform}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                            {url}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(platform)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-8">
                {/* Current Images */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Logo Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Logo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {businessData.logo_url ? (
                        <div className="space-y-3">
                          <img 
                            src={businessData.logo_url} 
                            alt="Current logo" 
                            className="mx-auto max-h-32 max-w-full object-contain rounded-lg shadow-sm"
                          />
                          <p className="text-sm text-gray-600">Current Logo</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Logo</span>
                          </div>
                          <p className="text-sm text-gray-500">No logo selected</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Image Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Cover Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {businessData.cover_image_url ? (
                        <div className="space-y-3">
                          <img 
                            src={businessData.cover_image_url} 
                            alt="Current cover" 
                            className="mx-auto max-h-32 max-w-full object-cover rounded-lg shadow-sm"
                          />
                          <p className="text-sm text-gray-600">Current Cover Image</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Cover</span>
                          </div>
                          <p className="text-sm text-gray-500">No cover image selected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Available Images for Selection */}
                {businessData.available_images && businessData.available_images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Available Images ({businessData.available_images.length})
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Click on any image to use it as your logo or cover image.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {businessData.available_images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={imageUrl} 
                            alt={`Available image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-sm border-2 border-transparent hover:border-blue-300 cursor-pointer transition-all"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 space-x-2 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleInputChange('logo_url', imageUrl)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Use as Logo
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInputChange('cover_image_url', imageUrl)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                              >
                                Use as Cover
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual URL Input */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Or Enter Image URLs Manually
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={businessData.logo_url}
                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image URL
                      </label>
                      <input
                        type="url"
                        value={businessData.cover_image_url}
                        onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                        placeholder="https://example.com/cover.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}