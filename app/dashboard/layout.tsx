import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/auth/login')
    }

    let profile = null
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    } catch {}

    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar profile={profile} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar profile={profile} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    )
  } catch {
    redirect('/auth/login')
  }
}
