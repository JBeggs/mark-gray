'use client'

import { useState, useEffect } from 'react'
import { Edit3, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { BusinessAuthModal } from './BusinessAuthModal'
import { BusinessEditModal } from './BusinessEditModal'

interface BusinessEditButtonProps {
  businessId: string
  ownerId: string
}

export function BusinessEditButton({ businessId, ownerId }: BusinessEditButtonProps) {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isBusinessOwner, setIsBusinessOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkBusinessOwnership()
  }, [user, ownerId])

  const checkBusinessOwnership = async () => {
    if (!user) {
      setIsBusinessOwner(false)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Check if the current user is the business owner
      const { data: business, error } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', businessId)
        .single()

      if (error) {
        console.error('Error checking business ownership:', error)
        setIsBusinessOwner(false)
      } else {
        setIsBusinessOwner(business?.owner_id === user.id)
      }
    } catch (error) {
      console.error('Error checking business ownership:', error)
      setIsBusinessOwner(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = () => {
    if (!user) {
      setShowAuthModal(true)
    } else if (isBusinessOwner) {
      setShowEditModal(true)
    } else {
      // User is logged in but not the owner
      alert('You can only edit your own business profile.')
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <>
      <button
        onClick={handleEditClick}
        className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {!user ? (
          <>
            <LogIn className="w-4 h-4" />
            <span className="text-sm font-medium">Business Owner Login</span>
          </>
        ) : isBusinessOwner ? (
          <>
            <Edit3 className="w-4 h-4" />
            <span className="text-sm font-medium">Edit Profile</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span className="text-sm font-medium">Business Owner Login</span>
          </>
        )}
      </button>

      {/* Business Authentication Modal */}
      {showAuthModal && (
        <BusinessAuthModal
          businessId={businessId}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false)
            checkBusinessOwnership()
          }}
        />
      )}

      {/* Business Edit Modal */}
      {showEditModal && (
        <BusinessEditModal
          businessId={businessId}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            // Optionally refresh the page to show updated data
            window.location.reload()
          }}
        />
      )}
    </>
  )
}