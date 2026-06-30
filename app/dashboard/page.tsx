'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, FolderOpen, Calendar, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, bulanIni: 0 })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('dokumen').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
      supabase.from('dokumen').select('id').eq('status', 'aktif')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ]).then(([{ count }, { data }]) => {
      setStats({ total: count || 0, bulanIni: data?.length || 0 })
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beranda</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di SI PINTER — Irban V Inspektorat Kab. Sumba Barat</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Dokumen', value: stats.total, icon: '📄', color: 'border-blue-200 bg-blue-50 text-blue-700' },
          { label: 'Unggah Bulan Ini', value: stats.bulanIni, icon: '📈', color: 'border-green-200 bg-green-50 text-green-700' },
          { label: 'Tahun Anggaran', value: new Date().getFullYear(), icon: '📅', color: 'border-amber-200 bg-amber-50 text-amber-700' },
          { label: 'Kategori Dokumen', value: 14, icon: '📁', color: 'border-purple-200 bg-purple-50 text-purple-700' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`card flex items-center gap-4 border ${color.split(' ')[0]}`}>
            <div className={`${color.split(' ').slice(1).join(' ')} p-3 rounded-xl text-xl`}>{icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">🗂️</p>
        <p className="text-gray-600 font-medium">Sistem siap digunakan</p>
        <p className="text-sm text-gray-400 mt-1">Gunakan menu di sebelah kiri untuk mengelola dokumen</p>
        <a href="/dashboard/upload" className="inline-block mt-4 btn-primary">⬆️ Unggah Dokumen Pertama</a>
      </div>
    </div>
  )
}
