import { createClient } from '@/lib/supabase/server'
import { FileText, FolderOpen, Calendar, TrendingUp, Clock, Download } from 'lucide-react'

async function getStats(supabase: ReturnType<typeof createClient>) {
  const [
    { count: totalDokumen },
    { data: dokumenBulanIni },
    { data: perKategori },
    { data: terbaru },
  ] = await Promise.all([
    supabase.from('dokumen').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
    supabase.from('dokumen').select('id').eq('status', 'aktif')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from('dokumen').select('kategori_dokumen(nama, warna)').eq('status', 'aktif'),
    supabase.from('dokumen').select('id, judul, file_type, created_at, kategori_dokumen(nama, warna)')
      .eq('status', 'aktif').order('created_at', { ascending: false }).limit(8),
  ])

  // Hitung per kategori
  const kategoriMap: Record<string, { jumlah: number; warna: string }> = {}
  perKategori?.forEach((d: any) => {
    const nama = d.kategori_dokumen?.nama || 'Lainnya'
    const warna = d.kategori_dokumen?.warna || '#94a3b8'
    if (!kategoriMap[nama]) kategoriMap[nama] = { jumlah: 0, warna }
    kategoriMap[nama].jumlah++
  })

  return {
    totalDokumen: totalDokumen || 0,
    dokumenBulanIni: dokumenBulanIni?.length || 0,
    terbaru: terbaru || [],
    perKategori: Object.entries(kategoriMap)
      .map(([nama, v]) => ({ nama, ...v }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 6),
  }
}

export default async function DashboardPage() {
  const supabase = createClient()
  const stats = await getStats(supabase)
  const tahunSekarang = new Date().getFullYear()

  const statCards = [
    { label: 'Total Dokumen', value: stats.totalDokumen, icon: FileText, color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
    { label: 'Unggah Bulan Ini', value: stats.dokumenBulanIni, icon: TrendingUp, color: 'bg-green-50 text-green-700', border: 'border-green-200' },
    { label: 'Tahun Anggaran', value: tahunSekarang, icon: Calendar, color: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
    { label: 'Total Kategori', value: stats.perKategori.length, icon: FolderOpen, color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beranda</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di SI PINTER — Irban V Inspektorat Kab. Sumba Barat</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`card flex items-center gap-4 border ${border}`}>
            <div className={`${color} p-3 rounded-xl`}><Icon className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('id')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Distribusi Kategori */}
        <div className="card lg:col-span-1">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-400" /> Distribusi Kategori
          </h2>
          <div className="space-y-3">
            {stats.perKategori.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada dokumen</p>
            )}
            {stats.perKategori.map(({ nama, jumlah, warna }) => (
              <div key={nama}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium truncate">{nama}</span>
                  <span className="text-gray-500 ml-2 shrink-0">{jumlah}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((jumlah / (stats.totalDokumen || 1)) * 100, 100)}%`, backgroundColor: warna }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dokumen Terbaru */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" /> Dokumen Terbaru
          </h2>
          <div className="space-y-2">
            {stats.terbaru.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada dokumen diunggah</p>
            )}
            {stats.terbaru.map((d: any) => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: d.kategori_dokumen?.warna + '20' || '#f3f4f6' }}>
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{d.judul}</p>
                  <p className="text-xs text-gray-400">
                    {d.kategori_dokumen?.nama || 'Umum'} •{' '}
                    {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {stats.terbaru.length > 0 && (
            <a href="/dashboard/dokumen" className="block text-center text-sm text-primary-600 hover:underline mt-4">
              Lihat semua dokumen →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
