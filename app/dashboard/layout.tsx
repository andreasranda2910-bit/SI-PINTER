'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = '/auth/login'
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a3a5c]">
      <div className="text-white text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-3"/>
        <p className="text-sm">Memuat dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar sederhana */}
      <aside className="w-64 bg-[#1a3a5c] flex flex-col h-full shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">SI PINTER</p>
              <p className="text-blue-300 text-[10px]">Irban V Inspektorat</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/dashboard', label: '🏠 Beranda' },
            { href: '/dashboard/dokumen', label: '📁 Dokumen' },
            { href: '/dashboard/upload', label: '⬆️ Unggah' },
            { href: '/dashboard/laporan', label: '📊 Laporan' },
            { href: '/dashboard/pengaturan', label: '⚙️ Pengaturan' },
          ].map(({ href, label }) => (
            <a key={href} href={href}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
              {label}
            </a>
          ))}
          {profile?.role === 'admin' && (
            <a href="/dashboard/pengguna"
              className="flex items-center px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
              👥 Pengguna
            </a>
          )}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-xs font-medium">{profile?.full_name || 'Pengguna'}</p>
            <p className="text-blue-300 text-[10px] capitalize">{profile?.role || 'viewer'}</p>
          </div>
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/auth/login'
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          <p className="font-semibold text-gray-800">SI PINTER</p>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
