import { createClient } from '@/lib/supabase/server'
import { BarChart2, FileText, Download, TrendingUp } from 'lucide-react'

export default async function LaporanPage() {
  const supabase = createClient()

  // Data per kategori
  const { data: perKategori } = await supabase
    .from('dokumen')
    .select('kategori_dokumen(nama, warna, kode)')
    .eq('status', 'aktif')

  const { data: perTahun } = await supabase
    .from('dokumen')
    .select('tahun_anggaran')
    .eq('status', 'aktif')
    .order('tahun_anggaran', { ascending: false })

  // Agregasi
  const kategoriMap: Record<string, { jumlah: number; warna: string; kode: string }> = {}
  perKategori?.forEach((d: any) => {
    const nama = d.kategori_dokumen?.nama || 'Lainnya'
    if (!kategoriMap[nama]) kategoriMap[nama] = { jumlah: 0, warna: d.kategori_dokumen?.warna || '#94a3b8', kode: d.kategori_dokumen?.kode || '' }
    kategoriMap[nama].jumlah++
  })
  const tahunMap: Record<number, number> = {}
  perTahun?.forEach((d: any) => { tahunMap[d.tahun_anggaran] = (tahunMap[d.tahun_anggaran] || 0) + 1 })

  const totalDokumen = perKategori?.length || 0
  const sortedKategori = Object.entries(kategoriMap).sort((a, b) => b[1].jumlah - a[1].jumlah)
  const sortedTahun = Object.entries(tahunMap).sort((a, b) => Number(b[0]) - Number(a[0]))
  const maxKategori = sortedKategori[0]?.[1].jumlah || 1
  const maxTahun = Math.max(...Object.values(tahunMap), 1)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Statistik</h1>
        <p className="text-sm text-gray-500 mt-1">Rekap dokumen SI PINTER Irban V</p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Dokumen Aktif', value: totalDokumen, color: 'text-blue-700' },
          { label: 'Kategori Terpakai', value: sortedKategori.length, color: 'text-green-700' },
          { label: 'Rentang Tahun', value: `${sortedTahun[sortedTahun.length - 1]?.[0] || '-'} – ${sortedTahun[0]?.[0] || '-'}`, color: 'text-amber-700' },
          { label: 'Dokumen Terbanyak', value: sortedKategori[0]?.[0] || '-', color: 'text-purple-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Per Kategori */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-gray-400" /> Distribusi per Kategori
          </h2>
          <div className="space-y-3">
            {sortedKategori.map(([nama, { jumlah, warna, kode }]) => (
              <div key={nama}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{nama}</span>
                  <span className="text-gray-500">{jumlah} dokumen ({Math.round(jumlah / totalDokumen * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${(jumlah / maxKategori) * 100}%`, backgroundColor: warna }} />
                </div>
              </div>
            ))}
            {sortedKategori.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Belum ada data</p>}
          </div>
        </div>

        {/* Per Tahun */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" /> Distribusi per Tahun Anggaran
          </h2>
          <div className="space-y-3">
            {sortedTahun.map(([tahun, jumlah]) => (
              <div key={tahun}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">TA {tahun}</span>
                  <span className="text-gray-500">{jumlah} dokumen</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-3 bg-[#1a3a5c] rounded-full transition-all" style={{ width: `${(jumlah / maxTahun) * 100}%` }} />
                </div>
              </div>
            ))}
            {sortedTahun.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Belum ada data</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
