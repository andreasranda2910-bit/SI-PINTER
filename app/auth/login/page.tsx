'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react'

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
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) {
      setError('Email atau password salah: ' + error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      // Gunakan window.location untuk hard redirect
      window.location.href = '/dashboard'
    } else {
      setError('Login gagal, session tidak terbentuk')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a3a5c] via-[#1e4d7a] to-[#1a3a5c] px-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <Shield className="w-10 h-10 text-[#1a3a5c]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SI PINTER</h1>
          <p className="text-blue-200 text-sm mt-1">Sistem Penyimpanan Dokumen Perencanaan</p>
          <p className="text-blue-300 text-xs mt-0.5">Irban V — Inspektorat Kab. Sumba Barat</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Masuk ke Sistem</h2>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <LogIn className="w-4 h-4" />}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-6">
            Belum punya akun? Hubungi Administrator SI PINTER
          </p>
        </div>
        <p className="text-center text-blue-300 text-xs mt-6">
          © 2025 Irban V Inspektorat Kabupaten Sumba Barat
        </p>
      </div>
    </div>
  )
}
