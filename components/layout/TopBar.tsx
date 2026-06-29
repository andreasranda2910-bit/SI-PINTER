'use client'
import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { Profile } from '@/lib/types'

const titles: Record<string, string> = {
  '/dashboard':            'Beranda',
  '/dashboard/dokumen':    'Daftar Dokumen',
  '/dashboard/upload':     'Unggah Dokumen',
  '/dashboard/laporan':    'Laporan & Statistik',
  '/dashboard/aktivitas':  'Log Aktivitas',
  '/dashboard/pengguna':   'Manajemen Pengguna',
  '/dashboard/pengaturan': 'Pengaturan',
}

export default function TopBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const title = Object.entries(titles).findLast(([key]) => pathname.startsWith(key))?.[1] || 'SI PINTER'

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 border-l pl-3">
          <div className="w-8 h-8 bg-[#1a3a5c] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-800 leading-tight">{profile?.full_name || 'Pengguna'}</p>
            <p className="text-xs text-gray-400">{profile?.jabatan || profile?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
