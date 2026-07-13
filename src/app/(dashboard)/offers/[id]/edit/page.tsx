import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditOfferClient from './edit-client'

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: offer } = await supabase
    .from('offers')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!offer) {
    notFound()
  }

  return <EditOfferClient offer={offer} />
}
