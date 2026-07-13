import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { DashboardCards } from '@/components/dashboard-cards'
import { OfferFilters } from '@/components/offer-filters'
import { OfferTable } from '@/components/offer-table'
import { Button } from '@/components/ui/button'
import { PlusCircle, Search, Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    niche?: string
    country?: string
    sortBy?: string
    sortOrder?: string
    favorites?: string
  }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const query = await searchParams
  const searchVal = query.search || ''
  const statusVal = query.status || 'all'
  const nicheVal = query.niche || ''
  const countryVal = query.country || ''
  const sortByVal = query.sortBy || 'created_at'
  const sortOrderVal = query.sortOrder || 'desc'
  const favoritesVal = query.favorites === 'true'

  let dbQuery = supabase
    .from('offers')
    .select('*')
    .eq('user_id', user.id)

  if (statusVal && statusVal !== 'all') {
    dbQuery = dbQuery.eq('status', statusVal)
  }

  if (nicheVal) {
    dbQuery = dbQuery.ilike('niche', `%${nicheVal}%`)
  }

  if (countryVal) {
    dbQuery = dbQuery.ilike('country', `%${countryVal}%`)
  }

  if (searchVal) {
    dbQuery = dbQuery.or(`title.ilike.%${searchVal}%,advertiser_name.ilike.%${searchVal}%`)
  }

  if (favoritesVal) {
    dbQuery = dbQuery.eq('is_favorite', true)
  }

  dbQuery = dbQuery.order(sortByVal, { ascending: sortOrderVal === 'asc' })

  const { data: offers } = await dbQuery
  const offersList = offers || []

  const { data: allOffers } = await supabase
    .from('offers')
    .select('status, updated_at')
    .eq('user_id', user.id)
  const allOffersList = allOffers || []

  const total = allOffersList.length
  const watching = allOffersList.filter((o) => o.status === 'watching').length
  const growing = allOffersList.filter((o) => o.status === 'growing').length
  const scaling = allOffersList.filter((o) => o.status === 'scaling').length

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const noRecentUpdate = allOffersList.filter((o) => {
    const updatedAt = new Date(o.updated_at)
    return updatedAt < sevenDaysAgo
  }).length

  const metrics = {
    total,
    watching,
    growing,
    scaling,
    noRecentUpdate,
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <DashboardCards metrics={metrics} />

      {/* Filters */}
      <Suspense fallback={
        <div className="flex items-center justify-center p-6 border border-slate-900 bg-slate-900/10 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      }>
        <OfferFilters />
      </Suspense>

      {/* Offers Table or Empty State */}
      {offersList.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-450 font-medium">
              Mostrando {offersList.length} de {total} ofertas registradas
            </span>
          </div>
          <OfferTable offers={offersList} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/10 backdrop-blur-sm space-y-4">
          <div className="p-4 bg-slate-900/80 rounded-full text-indigo-400 border border-slate-800">
            <Search className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-bold text-white">
              {total > 0 ? 'Nenhuma oferta encontrada' : 'Nenhuma oferta cadastrada'}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {total > 0
                ? 'Tente ajustar os termos de pesquisa ou os filtros selecionados para encontrar a oferta.'
                : 'Cadastre sua primeira oferta da Meta Ad Library para começar a monitorar e identificar escala.'}
            </p>
          </div>
          {total === 0 && (
            <Link href="/offers/new">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                <PlusCircle className="w-4 h-4 mr-2" />
                Cadastrar Primeira Oferta
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
