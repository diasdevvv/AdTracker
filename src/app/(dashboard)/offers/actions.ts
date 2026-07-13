'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { offerFormSchema, OfferFormValues } from '@/lib/schemas'

export async function createOffer(values: OfferFormValues) {
  const parsed = offerFormSchema.safeParse(values)
  if (!parsed.success) {
    return { error: 'Dados inválidos. Verifique as informações fornecidas.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const todayStr = new Date().toLocaleDateString('en-CA')
  const offerData = {
    user_id: user.id,
    title: parsed.data.title,
    product_name: parsed.data.product_name || null,
    niche: parsed.data.niche || null,
    advertiser_name: parsed.data.advertiser_name || null,
    page_name: parsed.data.page_name || null,
    ad_library_url: parsed.data.ad_library_url,
    sales_page_url: parsed.data.sales_page_url || null,
    current_ads_count: parsed.data.current_ads_count,
    oldest_ad_date: parsed.data.oldest_ad_date || null,
    country: parsed.data.country || null,
    platform: parsed.data.platform || null,
    creative_type: parsed.data.creative_type || null,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
    ads_history: { [todayStr]: parsed.data.current_ads_count },
  }

  const { error } = await supabase
    .from('offers')
    .insert(offerData)

  if (error) {
    return { error: `Erro ao criar oferta: ${error.message}` }
  }

  revalidatePath('/')
  redirect('/')
}

export async function updateOffer(id: string, values: OfferFormValues) {
  const parsed = offerFormSchema.safeParse(values)
  if (!parsed.success) {
    return { error: 'Dados inválidos. Verifique as informações fornecidas.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const todayStr = new Date().toLocaleDateString('en-CA')

  // Buscar histórico existente para fazer o merge
  const { data: currentOffer, error: fetchErr } = await supabase
    .from('offers')
    .select('ads_history')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr) {
    return { error: `Erro ao buscar oferta para atualização: ${fetchErr.message}` }
  }

  const existingHistory = currentOffer?.ads_history || {}
  const updatedHistory = {
    ...existingHistory,
    [todayStr]: parsed.data.current_ads_count
  }

  const offerData = {
    title: parsed.data.title,
    product_name: parsed.data.product_name || null,
    niche: parsed.data.niche || null,
    advertiser_name: parsed.data.advertiser_name || null,
    page_name: parsed.data.page_name || null,
    ad_library_url: parsed.data.ad_library_url,
    sales_page_url: parsed.data.sales_page_url || null,
    current_ads_count: parsed.data.current_ads_count,
    oldest_ad_date: parsed.data.oldest_ad_date || null,
    country: parsed.data.country || null,
    platform: parsed.data.platform || null,
    creative_type: parsed.data.creative_type || null,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
    ads_history: updatedHistory,
  }

  const { error } = await supabase
    .from('offers')
    .update(offerData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: `Erro ao atualizar oferta: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath(`/offers/${id}`)
  redirect(`/offers/${id}`)
}

export async function deleteOffer(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: `Erro ao excluir oferta: ${error.message}` }
  }

  revalidatePath('/')
  redirect('/')
}

export async function updateOfferStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: `Erro ao alterar status: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath(`/offers/${id}`)
  return { success: true }
}

export async function updateAdsCount(id: string, count: number) {
  if (count < 0) {
    return { error: 'A quantidade de anúncios não pode ser negativa.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const todayStr = new Date().toLocaleDateString('en-CA')

  // Buscar histórico existente para fazer o merge
  const { data: currentOffer, error: fetchErr } = await supabase
    .from('offers')
    .select('ads_history')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr) {
    return { error: `Erro ao buscar histórico: ${fetchErr.message}` }
  }

  const existingHistory = currentOffer?.ads_history || {}
  const updatedHistory = {
    ...existingHistory,
    [todayStr]: count
  }

  const { error } = await supabase
    .from('offers')
    .update({ 
      current_ads_count: count,
      ads_history: updatedHistory
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: `Erro ao atualizar quantidade: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath(`/offers/${id}`)
  return { success: true }
}

export async function toggleOfferFavorite(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { data, error: fetchErr } = await supabase
    .from('offers')
    .select('is_favorite')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr) return { error: `Erro ao buscar oferta: ${fetchErr.message}` }

  const nextState = !data?.is_favorite
  const { error } = await supabase
    .from('offers')
    .update({ is_favorite: nextState })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: `Erro ao atualizar favorito: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath(`/offers/${id}`)
  return { success: true }
}

export async function updateAdsCountForDate(id: string, dateStr: string, count: number) {
  if (count < 0) {
    return { error: 'A quantidade de anúncios não pode ser negativa.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { data: currentOffer, error: fetchErr } = await supabase
    .from('offers')
    .select('ads_history, current_ads_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr) {
    return { error: `Erro ao buscar oferta: ${fetchErr.message}` }
  }

  const existingHistory = currentOffer?.ads_history || {}
  const updatedHistory = {
    ...existingHistory,
    [dateStr]: count
  }

  const todayStr = new Date().toLocaleDateString('en-CA')
  const updatePayload: any = { ads_history: updatedHistory }
  if (dateStr === todayStr) {
    updatePayload.current_ads_count = count
  }

  const { error } = await supabase
    .from('offers')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: `Erro ao atualizar histórico: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath(`/offers/${id}`)
  return { success: true }
}
