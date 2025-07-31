'use client'

import AuthButton from '@/components/auth/AuthButton'

export default function ClientHeader() {
  return (
    <div className="flex items-center space-x-4">
      <AuthButton />
    </div>
  )
}