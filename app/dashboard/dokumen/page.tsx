'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Upload, Download, Trash2, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dokumen, KategoriDokumen, formatFileSize, getFileIcon, TAHUN_OPTIONS } from '@/lib/types'
import Link from 'next/link'

const PAGE_SIZE = 12

export default function DokumenPage() {
  const supabase = createClient()
  const [dokumen, setDokumen] = useState<Dokumen[]>([])
  const [kategori, setKategori] = useState<KategoriDokumen[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  // Filter state
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const [filterStatus, setFilterStatus] = useState('aktif')

  const fetchDokumen = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('dokumen')
      .select('*, kategori_dokumen(*), profiles(full_name, nip)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filterStatus) q = q.eq('status', filterStatus)
    if (filterKategori) q = q.eq('kategori_id', parseInt(filterKategori))
    if (filterTahun) q = q.eq('tahun_anggaran', parseInt(filterTahun))
    if (search) q = q.ilike('judul', `%${search}%`)

    const { data, count } = await q
    setDokumen(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [page, search, filterKategori, filterTahun, filterStatus])

  useEffect(() => { fetchDokumen() }, [fetchDokumen])
  useEffect(() => {
    supabase.from('kategori_dokumen').select('*').order('urutan').then(({ data }) => setKategori(data || []))
  }, [])

  async function handleDownload(doc: Dokumen) {
    const { data } = await supabase.storage.from('dokumen-sipinter').createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Dokumen</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString('id')} dokumen ditemukan</p>
        </div>
        <Link href="/dashboard/upload" className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" /> Unggah Dokumen
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Cari judul dokumen..." className="input pl-9" />
          </div>
          <select value={filterKategori} onChange={e => { setFilterKategori(e.target.value); setPage(0) }} className="input w-auto">
            <option value="">Semua Kategori</option>
            {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <select value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setPage(0) }} className="input w-auto">
            <option value="">Semua Tahun</option>
            {TAHUN_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0) }} className="input w-auto">
            <option value="aktif">Aktif</option>
            <option value="arsip">Arsip</option>
            <option value="draft">Draft</option>
            <option value="">Semua Status</option>
          </select>
        </div>
      </div>

      {/* Grid Dokumen */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-36 bg-gray-100" />
          ))}
        </div>
      ) : dokumen.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Tidak ada dokumen</p>
          <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau unggah dokumen baru</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {dokumen.map(doc => (
            <div key={doc.id} className="card hover:shadow-md transition-shadow group cursor-default flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: (doc.kategori_dokumen?.warna || '#3b82f6') + '20' }}>
                  {getFileIcon(doc.file_type)}
                </div>
                <span className="badge text-xs" style={{
                  backgroundColor: (doc.kategori_dokumen?.warna || '#3b82f6') + '20',
                  color: doc.kategori_dokumen?.warna || '#3b82f6'
                }}>
                  {doc.kategori_dokumen?.kode || 'DOK'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 mb-2">{doc.judul}</h3>
              <div className="text-xs text-gray-400 space-y-1 mb-3">
                <p>TA {doc.tahun_anggaran} • {formatFileSize(doc.file_size)}</p>
                <p>{new Date(doc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => handleDownload(doc)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-primary-600 hover:text-primary-800 py-1 rounded hover:bg-primary-50 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Unduh
                </button>
                <Link href={`/dashboard/dokumen/${doc.id}`}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 py-1 rounded hover:bg-gray-50 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn-secondary flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </button>
          <span className="text-sm text-gray-600">Halaman {page + 1} dari {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            className="btn-secondary flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-40">
            Berikutnya <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
