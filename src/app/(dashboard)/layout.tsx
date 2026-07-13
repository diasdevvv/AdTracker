import { createClient } from '@/lib/supabase/server'
import DashboardLayoutClient from '@/components/dashboard-layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userName = user?.email ? user.email.split('@')[0] : 'Visitante'
  const userEmail = user?.email || 'visitante@adtracker.com'

  return (
    <DashboardLayoutClient userName={userName} userEmail={userEmail}>
      {children}
    </DashboardLayoutClient>
  )
}
