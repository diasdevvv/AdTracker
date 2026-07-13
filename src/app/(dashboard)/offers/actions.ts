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

export async function generateTestOffers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  const countries = ['BR', 'US', 'ES', 'PT', 'FR']
  const statuses = ['discovery', 'watching', 'growing', 'scaling', 'stable']
  
  const products = [
    { title: 'Rosa Selvagem clareador', product: 'Rosa Selvagem', niche: 'estética', advertiser: 'Rosa Selvagem Oficial' },
    { title: 'Cápsula Thermo Slim emagrecedor', product: 'Thermo Slim', niche: 'saúde', advertiser: 'Thermo Slim Lab' },
    { title: 'Curso Completo de Tráfego Pago EAD', product: 'Tráfego Pago Pro', niche: 'infoproduto', advertiser: 'Escale Academy' },
    { title: 'Tenis Comfort Walk ortopédico', product: 'Comfort Walk', niche: 'e-commerce', advertiser: 'Lojas Comfort BR' },
    { title: 'Planilha Inteligente Gestão Financeira', product: 'Finanças Pro', niche: 'finanças', advertiser: 'Gestor Financeiro' },
    { title: 'SaaS CRM funil de vendas automático', product: 'Escale CRM', niche: 'saas', advertiser: 'Escale Tech' },
    { title: 'Sérum Rejuvenescedor Hialurônico 30ml', product: 'Hyaluron Serum', niche: 'estética', advertiser: 'DermaCare Brasil' },
    { title: 'Colágeno Hidrolisado Verisol pó', product: 'Verisol Max', niche: 'saúde', advertiser: 'NutriVit Lab' },
    { title: 'Dropshipping Smart Watch Series 9', product: 'SmartWatch S9', niche: 'e-commerce', advertiser: 'Importados Express' },
    { title: 'Método Renda Extra Home Office', product: 'Renda Home Office', niche: 'infoproduto', advertiser: 'Trabalho Digital' },
    { title: 'Curso Avançado Marketing de Afiliados', product: 'Afiliado Pro', niche: 'infoproduto', advertiser: 'Mestre Digital' },
    { title: 'Creme Antiacne Clean Skin 50g', product: 'Clean Skin Cream', niche: 'estética', advertiser: 'Skin Cosmetics' },
    { title: 'Whey Protein Isolado Gourmet 900g', product: 'Whey Gourmet', niche: 'saúde', advertiser: 'Fit Supps' },
    { title: 'ERP Nuvem para Pequenas Empresas', product: 'ERP Cloud', niche: 'saas', advertiser: 'Nuvem Soft' },
    { title: 'Curso Investimentos em Renda Fixa', product: 'InvestPro', niche: 'finanças', advertiser: 'Finanças Academy' },
    { title: 'Robô de Automação do Instagram API', product: 'InstaBot', niche: 'saas', advertiser: 'Social Automate' },
    { title: 'Calça Modeladora Shaper Up', product: 'Shaper Up', niche: 'e-commerce', advertiser: 'Moda Shapewear' },
    { title: 'Cápsulas Hair Force Crescimento Capilar', product: 'Hair Force', niche: 'saúde', advertiser: 'Hair Force Oficial' },
    { title: 'Sérum Anti-manchas Vitamina C pura', product: 'Vita C Serum', niche: 'estética', advertiser: 'DermaCare Brasil' },
    { title: 'Relógio Cronógrafo Masculino Titanium', product: 'Titanium Watch', niche: 'e-commerce', advertiser: 'Relojoaria Prime' },
  ]

  const today = new Date()
  const offersToInsert = []

  for (let i = 0; i < products.length; i++) {
    const item = products[i]
    
    // Gerar histórico nos últimos 15 dias
    const adsHistory: Record<string, number> = {}
    let currentAds = Math.floor(Math.random() * 80) + 10
    
    for (let j = 14; j >= 0; j--) {
      const d = new Date()
      d.setDate(today.getDate() - j)
      const dateKey = d.toLocaleDateString('en-CA')
      
      const change = Math.floor(Math.random() * 15) - 7 // flutuação de -7 a +7
      currentAds = Math.max(5, currentAds + change)
      adsHistory[dateKey] = currentAds
    }

    const randomCountry = countries[Math.floor(Math.random() * countries.length)]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const oldestAdDate = new Date()
    oldestAdDate.setDate(today.getDate() - (Math.floor(Math.random() * 60) + 15))

    offersToInsert.push({
      user_id: user.id,
      title: item.title,
      product_name: item.product,
      niche: item.niche,
      advertiser_name: item.advertiser,
      page_name: item.advertiser,
      ad_library_url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(item.product)}`,
      sales_page_url: `https://${item.product.toLowerCase().replace(/\s+/g, '')}.com.br`,
      current_ads_count: currentAds,
      oldest_ad_date: oldestAdDate.toLocaleDateString('en-CA'),
      country: randomCountry,
      platform: 'Facebook, Instagram',
      creative_type: Math.random() > 0.4 ? 'Imagem & Vídeo' : 'Vídeo',
      status: randomStatus,
      is_favorite: Math.random() > 0.7,
      notes: `Gerada automaticamente para demonstração de métricas de escala. Nicho ${item.niche}.`,
      ads_history: adsHistory,
    })
  }

  const { error } = await supabase
    .from('offers')
    .insert(offersToInsert)

  if (error) {
    throw new Error(`Erro ao gerar ofertas de teste: ${error.message}`)
  }

  revalidatePath('/')
  revalidatePath('/offers')
}

export async function updateUserProfile(values: {
  name?: string
  avatarUrl?: string
  email?: string
  password?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const updateData: any = {}
  
  if (values.name !== undefined || values.avatarUrl !== undefined) {
    const metadata = user.user_metadata || {}
    if (values.name !== undefined) metadata.name = values.name
    if (values.avatarUrl !== undefined) {
      metadata.avatarUrl = values.avatarUrl
      metadata.avatar_url = values.avatarUrl
    }
    updateData.data = metadata
  }

  if (values.email && values.email !== user.email) {
    updateData.email = values.email
  }

  if (values.password) {
    updateData.password = values.password
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase.auth.updateUser(updateData)
    if (error) {
      return { error: `Erro ao atualizar dados: ${error.message}` }
    }
  }

  revalidatePath('/')
  revalidatePath('/offers')
  return { success: true }
}

export async function resetDashboard(password: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { error: 'Usuário não autenticado.' }
  }

  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password
  })

  if (authErr) {
    return { error: 'Senha incorreta. Não foi possível redefinir o dashboard.' }
  }

  const { error: deleteErr } = await supabase
    .from('offers')
    .delete()
    .eq('user_id', user.id)

  if (deleteErr) {
    return { error: `Erro ao excluir ofertas: ${deleteErr.message}` }
  }

  revalidatePath('/')
  revalidatePath('/offers')
  return { success: true }
}
