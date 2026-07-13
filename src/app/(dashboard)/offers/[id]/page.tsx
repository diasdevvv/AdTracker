import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DetailsClient from './details-client'

export default async function OfferDetailsPage({
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

  return <DetailsClient offer={offer} />
}
