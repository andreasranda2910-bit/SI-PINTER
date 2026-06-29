'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Save, CheckCircle } from 'lucide-react'
import { Profile } from '@/lib/types'

export default function PengaturanPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', nip: '', jabatan: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) { setProfile(data); setForm({ full_name: data.full_name || '', nip: data.nip || '', jabatan: data.jabatan || '' }) }
      })
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update(form).eq('id', user.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault(); setPwError(''); setPwSuccess(false)
    if (newPassword.length < 8) { setPwError('Password minimal 8 karakter'); return }
    if (newPassword !== confirmPassword) { setPwError('Password tidak cocok'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPwError(error.message)
    else { setPwSuccess(true); setNewPassword(''); setConfirmPassword('') }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi akun Anda</p>
      </div>

      {/* Profil */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#1a3a5c] rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {form.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{form.full_name || 'Pengguna'}</p>
            <p className="text-sm text-gray-500 capitalize">{profile?.role || 'viewer'} — Irban V</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">NIP</label>
              <input value={form.nip} onChange={e => setForm(p => ({ ...p, nip: e.target.value }))} placeholder="19800101..." className="input" />
            </div>
            <div>
              <label className="label">Jabatan</label>
              <input value={form.jabatan} onChange={e => setForm(p => ({ ...p, jabatan: e.target.value }))} placeholder="Auditor Muda" className="input" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Save className="w-4 h-4" />}
              Simpan Perubahan
            </button>
            {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Tersimpan!</span>}
          </div>
        </form>
      </div>

      {/* Ganti Password */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Ubah Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Password Baru</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimal 8 karakter" className="input" />
          </div>
          <div>
            <label className="label">Konfirmasi Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" className="input" />
          </div>
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Password berhasil diubah</p>}
          <button type="submit" className="btn-secondary">Ubah Password</button>
        </form>
      </div>
    </div>
  )
}
