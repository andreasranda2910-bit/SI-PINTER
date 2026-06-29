'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Shield, Eye, Edit2, CheckCircle, XCircle } from 'lucide-react'
import { Profile, UserRole } from '@/lib/types'

export default function PenggunaPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at').then(({ data }) => {
      setUsers(data || [])
      setLoading(false)
    })
  }, [])

  async function updateRole(id: string, role: UserRole) {
    await supabase.from('profiles').update({ role }).eq('id', id)
    setUsers(u => u.map(p => p.id === id ? { ...p, role } : p))
    setEditing(null)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', id)
    setUsers(u => u.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  const roleBadge: Record<UserRole, string> = {
    admin:    'bg-red-100 text-red-700',
    operator: 'bg-blue-100 text-blue-700',
    viewer:   'bg-gray-100 text-gray-600',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} pengguna terdaftar</p>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Nama', 'NIP', 'Jabatan', 'Peran', 'Status', 'Tgl Daftar', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{u.nip || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{u.jabatan || '-'}</td>
                <td className="px-4 py-3">
                  {editing === u.id ? (
                    <select defaultValue={u.role} autoFocus
                      onChange={e => updateRole(u.id, e.target.value as UserRole)}
                      onBlur={() => setEditing(null)}
                      className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="viewer">Viewer</option>
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`badge ${roleBadge[u.role]} cursor-pointer`} onClick={() => setEditing(u.id)}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u.id, u.is_active)}
                    className="text-gray-400 hover:text-gray-600" title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                    {u.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
