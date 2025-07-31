'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function AuthMessage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  useEffect(() => {
    const authRequired = searchParams.get('auth')
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (authRequired === 'required') {
      setMessage({
        type: 'info',
        text: 'Please sign in to access this page'
      })
    } else if (error === 'unauthorized') {
      setMessage({
        type: 'error',
        text: 'You do not have permission to access this page'
      })
    } else if (success === 'signed_out') {
      setMessage({
        type: 'success',
        text: 'You have been signed out successfully'
      })
    }

    // Clear message after 5 seconds
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!message) return null

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const Icon = icons[message.type]

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${colors[message.type]} max-w-sm shadow-lg`}>
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
        <p className="text-sm font-medium">{message.text}</p>
        <button
          onClick={() => setMessage(null)}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}