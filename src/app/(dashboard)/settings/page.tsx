import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './settings-client'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const metadata = user.user_metadata || {}
  const initialData = {
    name: metadata.name || '',
    avatarUrl: metadata.avatarUrl || metadata.avatar_url || '',
    email: user.email || '',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Configurações da Conta</h2>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie seus dados pessoais, credenciais de segurança e preferências da plataforma.
        </p>
      </div>

      <SettingsClient initialData={initialData} />
    </div>
  )
}
