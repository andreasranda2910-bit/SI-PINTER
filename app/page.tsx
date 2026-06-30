'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/auth/login'
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a3a5c]">
      <div className="text-white text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-3"/>
        <p className="text-sm">Memuat SI PINTER...</p>
      </div>
    </div>
  )
}
