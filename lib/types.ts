export type UserRole = 'admin' | 'operator' | 'viewer'
export type DocStatus = 'aktif' | 'arsip' | 'draft'

export interface Profile {
  id: string
  full_name: string
  nip?: string
  jabatan?: string
  role: UserRole
  is_active: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface KategoriDokumen {
  id: number
  kode: string
  nama: string
  deskripsi?: string
  warna: string
  ikon: string
  urutan: number
  created_at: string
}

export interface Dokumen {
  id: string
  judul: string
  deskripsi?: string
  kategori_id?: number
  tahun_anggaran: number
  nomor_dokumen?: string
  tanggal_dokumen?: string
  file_path: string
  file_name: string
  file_size?: number
  file_type?: string
  tags?: string[]
  status: DocStatus
  uploaded_by?: string
  created_at: string
  updated_at: string
  // joined
  kategori_dokumen?: KategoriDokumen
  profiles?: Profile
}

export interface ActivityLog {
  id: number
  user_id?: string
  action: string
  dokumen_id?: string
  detail?: Record<string, unknown>
  ip_address?: string
  created_at: string
  profiles?: Profile
  dokumen?: Dokumen
}

export interface DashboardStats {
  total_dokumen: number
  total_tahun: number
  total_kategori: number
  dokumen_bulan_ini: number
  dokumen_per_kategori: { nama: string; jumlah: number; warna: string }[]
  dokumen_per_tahun: { tahun: number; jumlah: number }[]
}

export const TAHUN_OPTIONS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileIcon(fileType?: string): string {
  if (!fileType) return '📄'
  if (fileType.includes('pdf')) return '📕'
  if (fileType.includes('word') || fileType.includes('document')) return '📘'
  if (fileType.includes('sheet') || fileType.includes('excel')) return '📗'
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📙'
  if (fileType.includes('image')) return '🖼️'
  if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️'
  return '📄'
}
