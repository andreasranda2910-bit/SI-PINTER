'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email atau password salah: ' + error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      window.location.href = '/dashboard'
    } else {
      setError('Login gagal, session tidak terbentuk')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a3a5c] via-[#1e4d7a] to-[#1a3a5c] px-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Dekorasi lingkaran */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-white/5" />

      <div className="relative w-full max-w-md z-10">

        {/* Header dengan Logo */}
        <div className="text-center mb-6">
          {/* Logo & Judul berdampingan */}
          <div className="flex items-center justify-center gap-5 mb-4">
            {/* Logo Kabupaten Sumba Barat */}
            <div className="relative w-20 h-20 shrink-0 drop-shadow-lg">
              <Image
                src="/logo-sumba-barat.png"
                alt="Logo Kabupaten Sumba Barat"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Divider vertikal */}
            <div className="w-px h-14 bg-white/30" />

            {/* Teks SI PINTER */}
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">SI PINTER</h1>
              <p className="text-blue-200 text-xs leading-snug mt-0.5">Sistem Penyimpanan Dokumen</p>
              <p className="text-blue-200 text-xs leading-snug">Perencanaan & Penganggaran</p>
            </div>
          </div>

          {/* Instansi */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            <p className="text-white text-xs font-medium">Irban V — Inspektorat Kabupaten Sumba Barat</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header form */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-[#1a3a5c] rounded-xl flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">Masuk ke Sistem</h2>
              <p className="text-xs text-gray-400">Gunakan akun yang diberikan administrator</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email / Username</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pegawai@sumbabarat.go.id"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="input pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 text-base">
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Masuk
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100">
            Belum punya akun? Hubungi Administrator SI PINTER
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-5 space-y-1">
          <p className="text-blue-200 text-xs font-medium">Pemerintah Kabupaten Sumba Barat</p>
          <p className="text-blue-300 text-xs">© 2025 Inspektorat Kabupaten Sumba Barat</p>
          <p className="text-blue-400 text-[10px] italic">"Pada Eweta Manda Elu"</p>
        </div>
      </div>
    </div>
  )
}
