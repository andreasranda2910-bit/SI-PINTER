'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderOpen, Upload, BarChart2,
  Settings, Users, Shield, ChevronRight, LogOut, Activity
} from 'lucide-react'
import { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavItem { href: string; label: string; icon: React.ElementType; adminOnly?: boolean }

const navItems: NavItem[] = [
  { href: '/dashboard',           label: 'Beranda',       icon: LayoutDashboard },
  { href: '/dashboard/dokumen',   label: 'Dokumen',       icon: FolderOpen },
  { href: '/dashboard/upload',    label: 'Unggah',        icon: Upload },
  { href: '/dashboard/laporan',   label: 'Laporan',       icon: BarChart2 },
  { href: '/dashboard/aktivitas', label: 'Log Aktivitas', icon: Activity, adminOnly: true },
  { href: '/dashboard/pengguna',  label: 'Pengguna',      icon: Users,     adminOnly: true },
  { href: '/dashboard/pengaturan',label: 'Pengaturan',    icon: Settings },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <aside className="w-64 bg-[#1a3a5c] flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SI PINTER</p>
            <p className="text-blue-300 text-[10px] leading-tight">Irban V Inspektorat</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.filter(item => !item.adminOnly || isAdmin).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                active
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name || 'Pengguna'}</p>
            <p className="text-blue-300 text-[10px] capitalize">{profile?.role || 'viewer'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>
    </aside>
  )
}
