import { createClient } from '@/lib/supabase/server'
import { FileText, FolderOpen, Calendar, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  
  let totalDokumen = 0
  let dokumenBulanIni = 0
  
  try {
    const { count } = await supabase
      .from('dokumen')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktif')
    totalDokumen = count || 0

    const { data } = await supabase
      .from('dokumen')
      .select('id')
      .eq('status', 'aktif')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    dokumenBulanIni = data?.length || 0
  } catch {}

  const tahunSekarang = new Date().getFullYear()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beranda</h1>
        <p className="text-gray-500 text-sm mt-1">
          Selamat datang di SI PINTER — Irban V Inspektorat Kab. Sumba Barat
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4 border border-blue-200">
          <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalDokumen}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Dokumen</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 border border-green-200">
          <div className="bg-green-50 text-green-700 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{dokumenBulanIni}</p>
            <p className="text-xs text-gray-500 mt-0.5">Unggah Bulan Ini</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 border border-amber-200">
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{tahunSekarang}</p>
            <p className="text-xs text-gray-500 mt-0.5">Tahun Anggaran</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 border border-purple-200">
          <div className="bg-purple-50 text-purple-700 p-3 rounded-xl">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">14</p>
            <p className="text-xs text-gray-500 mt-0.5">Kategori Dokumen</p>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-8">
          Gunakan menu di sebelah kiri untuk mulai mengelola dokumen
        </p>
      </div>
    </div>
  )
}
