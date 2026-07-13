import { createClient } from '@/lib/supabase/server'
import DashboardLayoutClient from '@/components/dashboard-layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const metadata = user?.user_metadata || {}
  const userName = metadata.name || (user?.email ? user.email.split('@')[0] : 'Visitante')
  const userEmail = user?.email || 'visitante@adtracker.com'
  const avatarUrl = metadata.avatarUrl || metadata.avatar_url || ''

  return (
    <DashboardLayoutClient userName={userName} userEmail={userEmail} avatarUrl={avatarUrl}>
      {children}
    </DashboardLayoutClient>
  )
}
