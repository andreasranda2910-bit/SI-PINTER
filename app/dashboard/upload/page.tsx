'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { KategoriDokumen, formatFileSize } from '@/lib/types'

const MAX_SIZE = 100 * 1024 * 1024 // 100MB

export default function UploadPage() {
  const supabase = createClient()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [kategori, setKategori] = useState<KategoriDokumen[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const tahunSekarang = new Date().getFullYear()

  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    kategori_id: '',
    tahun_anggaran: String(tahunSekarang),
    nomor_dokumen: '',
    tanggal_dokumen: '',
    tags: '',
  })

  useEffect(() => {
    supabase.from('kategori_dokumen').select('*').order('urutan').then(({ data }) => setKategori(data || []))
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) validateAndSetFile(f)
  }

  function validateAndSetFile(f: File) {
    if (f.size > MAX_SIZE) {
      setError(`Ukuran file maksimal 100MB. File Anda: ${formatFileSize(f.size)}`)
      return
    }
    setFile(f); setError('')
    if (!form.judul) setForm(p => ({ ...p, judul: f.name.replace(/\.[^.]+$/, '') }))
  }

  function validateTahun(val: string) {
    const num = parseInt(val)
    if (isNaN(num)) return false
    if (num < 2000 || num > 2099) return false
    return true
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Pilih file terlebih dahulu'); return }
    if (!validateTahun(form.tahun_anggaran)) {
      setError('Tahun anggaran tidak valid (2000–2099)')
      return
    }
    setUploading(true); setError(''); setProgress(10)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Sesi habis, silakan login ulang'); setUploading(false); return }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${form.tahun_anggaran}/${form.kategori_id || 'umum'}/${Date.now()}_${safeName}`

    setProgress(30)
    const { error: storageErr } = await supabase.storage.from('dokumen-sipinter').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (storageErr) { setError('Gagal mengunggah file: ' + storageErr.message); setUploading(false); return }

    setProgress(70)
    const { error: dbErr } = await supabase.from('dokumen').insert({
      judul: form.judul,
      deskripsi: form.deskripsi || null,
      kategori_id: form.kategori_id ? parseInt(form.kategori_id) : null,
      tahun_anggaran: parseInt(form.tahun_anggaran),
      nomor_dokumen: form.nomor_dokumen || null,
      tanggal_dokumen: form.tanggal_dokumen || null,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      status: 'aktif',
      uploaded_by: session.user.id,
    })

    if (dbErr) {
      await supabase.storage.from('dokumen-sipinter').remove([path])
      setError('Gagal menyimpan data: ' + dbErr.message); setUploading(false); return
    }

    setProgress(100); setSuccess(true)
    setTimeout(() => { window.location.href = '/dashboard/dokumen' }, 2000)
  }

  if (success) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-800">Dokumen Berhasil Diunggah!</h2>
      <p className="text-gray-500 mt-2">Mengalihkan ke daftar dokumen...</p>
    </div>
  )

  // Opsi tahun: 5 tahun ke belakang + tahun ini + 5 tahun ke depan
  const tahunOptions = Array.from({ length: 11 }, (_, i) => tahunSekarang - 5 + i)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Unggah Dokumen</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah dokumen perencanaan/penganggaran baru ke SI PINTER</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}>
          <input ref={fileRef} type="file" className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar"
            onChange={e => { const f = e.target.files?.[0]; if (f) validateAndSetFile(f) }} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-10 h-10 text-primary-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-semibold text-gray-700 text-lg">Klik atau seret file ke sini</p>
              <p className="text-sm text-gray-400 mt-1">PDF, Word, Excel, PPT, Gambar, ZIP/RAR</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Maksimal ukuran file: <span className="text-primary-600">100 MB</span></p>
            </>
          )}
        </div>

        {error && (
          <div className="flex gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <div className="card space-y-4">
          <div>
            <label className="label">Judul Dokumen <span className="text-red-500">*</span></label>
            <input required value={form.judul}
              onChange={e => setForm(p => ({ ...p, judul: e.target.value }))}
              placeholder="Contoh: RKA Irban V Tahun Anggaran 2025"
              className="input" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kategori Dokumen</label>
              <select value={form.kategori_id}
                onChange={e => setForm(p => ({ ...p, kategori_id: e.target.value }))}
                className="input">
                <option value="">-- Pilih Kategori --</option>
                {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tahun Anggaran <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <select
                  value={tahunOptions.includes(parseInt(form.tahun_anggaran)) ? form.tahun_anggaran : ''}
                  onChange={e => { if (e.target.value) setForm(p => ({ ...p, tahun_anggaran: e.target.value })) }}
                  className="input flex-1">
                  {tahunOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <label className="text-xs text-gray-500 mb-1 block">Atau ketik manual:</label>
                <input
                  type="number"
                  value={form.tahun_anggaran}
                  onChange={e => setForm(p => ({ ...p, tahun_anggaran: e.target.value }))}
                  placeholder={String(tahunSekarang)}
                  min="2000"
                  max="2099"
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nomor Dokumen</label>
              <input value={form.nomor_dokumen}
                onChange={e => setForm(p => ({ ...p, nomor_dokumen: e.target.value }))}
                placeholder="Mis: 050/001/2025"
                className="input" />
            </div>
            <div>
              <label className="label">Tanggal Dokumen</label>
              <input type="date" value={form.tanggal_dokumen}
                onChange={e => setForm(p => ({ ...p, tanggal_dokumen: e.target.value }))}
                className="input" />
            </div>
          </div>

          <div>
            <label className="label">Deskripsi</label>
            <textarea value={form.deskripsi}
              onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
              placeholder="Keterangan singkat isi dokumen..."
              className="input h-24 resize-none" />
          </div>

          <div>
            <label className="label">Tags <span className="text-gray-400 font-normal">(pisah dengan koma)</span></label>
            <input value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="Mis: anggaran, 2025, revisi, irban"
              className="input" />
          </div>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Mengunggah file...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="h-3 bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 text-center">
              {progress < 50 ? 'Mengunggah ke server...' : progress < 80 ? 'Menyimpan metadata...' : 'Hampir selesai...'}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => window.location.href = '/dashboard/dokumen'}
            className="btn-secondary flex-1">
            Batal
          </button>
          <button type="submit" disabled={uploading || !file}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Mengunggah...
              </>
            ) : (
              <><Upload className="w-4 h-4" /> Simpan Dokumen</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
