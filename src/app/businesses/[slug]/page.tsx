import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Globe, Star, Clock, Edit3, CheckCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import { BusinessEditButton } from '@/components/businesses/BusinessEditButton'

// Helper function to format phone numbers
function formatPhone(phone?: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

// Helper function to format business hours
function formatBusinessHours(hours?: any) {
  if (!hours || typeof hours !== 'object') return null
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return daysOfWeek.map((day, index) => {
    const dayData = hours[day]
    if (dayData && dayData.open && dayData.close) {
      return {
        day: dayNames[index],
        hours: `${dayData.open} - ${dayData.close}`
      }
    } else {
      return {
        day: dayNames[index],
        hours: 'Closed'
      }
    }
  })
}

// Helper function to render stars for rating
function renderStars(rating: number, size: 'sm' | 'md' = 'md') {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />
    )
  }
  
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className={`${starSize} text-gray-300`} />
        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
        </div>
      </div>
    )
  }
  
  const remainingStars = 5 - Math.ceil(rating)
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className={`${starSize} text-gray-300`} />
    )
  }
  
  return stars
}



interface BusinessPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getBusiness(slug: string) {
  const supabase = await createClient()
  
  const { data: business, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      description,
      long_description,
      industry,
      website_url,
      phone,
      email,
      address,
      city,
      state,
      zip_code,
      services,
      is_verified,
      rating,
      review_count,
      business_hours,
      social_links,
      created_at,
      owner_id,
      logo_id,
      cover_image_id,
      logo_url,
      cover_image_url,
      owner:profiles!owner_id(
        full_name,
        email
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching business:', error)
    return null
  }

  // Transform data to match expected structure
  return {
    ...business,
    logo: business.logo_url ? 
      { file_url: business.logo_url, alt_text: `${business.name} logo` } : 
      business.logo_id ? 
      { file_url: `https://picsum.photos/300/300?random=${business.id}&logo`, alt_text: `${business.name} logo` } : 
      null,
    cover_image: business.cover_image_url ? 
      { file_url: business.cover_image_url, alt_text: `${business.name} cover` } : 
      business.cover_image_id ? 
      { file_url: `https://picsum.photos/1200/600?random=${business.id}&cover`, alt_text: `${business.name} cover` } : 
      null,
    rating: business.rating || 0,
    review_count: business.review_count || 0,
    services: business.services || [],
    social_links: business.social_links || {},
    owner: Array.isArray(business.owner) ? business.owner[0] : business.owner
  }
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusiness(slug)
  
  if (!business) {
    return {
      title: 'Business Not Found | The Riverside Herald',
      description: 'The requested business page could not be found.',
    }
  }

  return {
    title: `${business.name} | Local Business Directory`,
    description: business.description || `Learn more about ${business.name}, a local business in ${business.city || 'your area'}.`,
    openGraph: {
      title: business.name,
      description: business.description || `Learn more about ${business.name}`,
      images: business.cover_image?.file_url ? [business.cover_image.file_url] : [],
      type: 'website',
    },
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    notFound()
  }

  const businessHours = formatBusinessHours(business.business_hours)
  const socialLinks = business.social_links || {}

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        {business.cover_image?.file_url ? (
          <Image
            src={business.cover_image.file_url}
            alt={business.cover_image.alt_text || business.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container-wide pb-8">
            <div className="flex items-end space-x-6">
              {/* Logo */}
              {business.logo?.file_url && (
                <div className="flex-shrink-0 w-32 h-32 bg-white rounded-lg p-4 shadow-lg">
                  <Image
                    src={business.logo.file_url}
                    alt={business.logo.alt_text || business.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* Business Info */}
              <div className="flex-1 text-white">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold">{business.name}</h1>
                  {business.is_verified && (
                    <div className="flex items-center space-x-1 px-3 py-1 bg-green-600 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
                
                {business.industry && (
                  <p className="text-xl text-gray-200 mb-2">{business.industry}</p>
                )}
                
                {/* Rating */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(business.rating)}
                  </div>
                  <span className="text-lg">
                    {business.rating.toFixed(1)} ({business.review_count} reviews)
                  </span>
                </div>
              </div>
              
              {/* Edit Button */}
              <BusinessEditButton businessId={business.id} ownerId={business.owner_id} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-wide py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {business.name}</h2>
              <div className="prose prose-lg max-w-none">
                {business.long_description ? (
                  <div className="space-y-6">
                    {business.long_description.split('\n\n').map((paragraph: string, index: number) => {
                      // Handle headers (lines starting with ##)
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4">
                            {paragraph.replace('## ', '')}
                          </h3>
                        )
                      }
                      
                      // Handle bold text (**text**)
                      if (paragraph.includes('**')) {
                        const parts = paragraph.split('**')
                        return (
                          <div key={index} className="space-y-3">
                            {parts.map((part, partIndex) => {
                              if (partIndex % 2 === 1) {
                                return <strong key={partIndex} className="font-bold text-gray-900">{part}</strong>
                              }
                              // Handle bullet points (lines starting with -)
                              if (part.includes('\n- ')) {
                                const lines = part.split('\n')
                                return (
                                  <div key={partIndex}>
                                    {lines.map((line, lineIndex) => {
                                      if (line.startsWith('- ')) {
                                        return (
                                          <div key={lineIndex} className="flex items-start space-x-2 mb-2">
                                            <span className="text-blue-600 font-bold mt-1">•</span>
                                            <span className="text-gray-700">{line.replace('- ', '')}</span>
                                          </div>
                                        )
                                      }
                                      return line && <p key={lineIndex} className="text-gray-700 mb-2">{line}</p>
                                    })}
                                  </div>
                                )
                              }
                              return part && <span key={partIndex} className="text-gray-700">{part}</span>
                            })}
                          </div>
                        )
                      }
                      
                      // Handle bullet points without bold text
                      if (paragraph.includes('\n- ')) {
                        const lines = paragraph.split('\n')
                        return (
                          <div key={index} className="space-y-2">
                            {lines.map((line, lineIndex) => {
                              if (line.startsWith('- ')) {
                                return (
                                  <div key={lineIndex} className="flex items-start space-x-2">
                                    <span className="text-blue-600 font-bold mt-1">•</span>
                                    <span className="text-gray-700">{line.replace('- ', '')}</span>
                                  </div>
                                )
                              }
                              return line && <p key={lineIndex} className="text-gray-700 leading-relaxed">{line}</p>
                            })}
                          </div>
                        )
                      }
                      
                      // Regular paragraphs
                      return paragraph && (
                        <p key={index} className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    })}
                  </div>
                ) : business.description ? (
                  <p className="text-gray-700 leading-relaxed">{business.description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description available.</p>
                )}
              </div>
            </section>

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
                <div className="flex flex-wrap gap-2">
                  {business.services.map((service: string, index: number) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Business Hours */}
            {businessHours && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Hours</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-3">
                    {businessHours.map(({ day, hours }) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{day}</span>
                        <span className="text-gray-600">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                {/* Address */}
                {(business.address || business.city) && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      {business.address && <div className="text-gray-900">{business.address}</div>}
                      {business.city && (
                        <div className="text-gray-600">
                          {business.city}{business.state ? `, ${business.state}` : ''} {business.zip_code}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Phone */}
                {business.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a 
                      href={`tel:${business.phone}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {formatPhone(business.phone)}
                    </a>
                  </div>
                )}

                {/* Email */}
                {business.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a 
                      href={`mailto:${business.email}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {business.email}
                    </a>
                  </div>
                )}

                {/* Website */}
                {business.website_url && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a 
                      href={business.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="block w-full px-4 py-3 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Call Now
                  </a>
                )}
                {business.website_url && (
                  <a
                    href={business.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 bg-gray-600 text-white text-center font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </section>

            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
                <div className="space-y-2">
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <span className="capitalize font-medium">{platform}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Business Owner */}
            {business.owner && (
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Business Owner</h3>
                <div className="text-gray-600">
                  <p className="font-medium">{business.owner.full_name}</p>
                  <p className="text-sm text-gray-500">
                    Listed since {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Back to Businesses */}
      <div className="border-t border-gray-200 py-8">
        <div className="container-wide">
          <Link
            href="/businesses"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to All Businesses
          </Link>
        </div>
      </div>
    </div>
  )
}