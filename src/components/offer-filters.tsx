'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { statusMap } from './status-badge'
import { Search, X, Loader2, SlidersHorizontal, Star } from 'lucide-react'

export function OfferFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [niche, setNiche] = useState(searchParams.get('niche') || '')
  const [country, setCountry] = useState(searchParams.get('country') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')
  const [onlyFavorites, setOnlyFavorites] = useState(searchParams.get('favorites') === 'true')

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (niche) params.set('niche', niche)
      if (country) params.set('country', country)
      if (status && status !== 'all') params.set('status', status)
      if (onlyFavorites) params.set('favorites', 'true')
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      router.push(`/?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setSearch('')
    setNiche('')
    setCountry('')
    setStatus('all')
    setSortBy('created_at')
    setSortOrder('desc')
    setOnlyFavorites(false)
    startTransition(() => {
      router.push('/')
    })
  }

  const getStatusLabel = (val: string) => {
    if (val === 'all') return 'Todos os Status'
    return statusMap[val as keyof typeof statusMap]?.label || val
  }

  const getSortByLabel = (val: string) => {
    if (val === 'created_at') return 'Data de Criação'
    if (val === 'updated_at') return 'Última Atualização'
    if (val === 'current_ads_count') return 'Nº de Anúncios'
    return val
  }

  return (
    <div className="border border-border bg-gradient-to-br from-zinc-900/90 via-[#0d0d14]/95 to-[#161225]/95 rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-250 font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Filtros e Pesquisa
        </div>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {/* Search */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <label className="text-xs text-slate-400 font-medium">Pesquisar</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Título ou anunciante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border text-white placeholder-slate-500 text-xs focus-visible:ring-primary h-9 rounded-xl"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">Status</label>
          <Select value={status} onValueChange={(val) => setStatus(val || 'all')}>
            <SelectTrigger className="bg-background border-border text-white text-xs h-9 rounded-xl w-full">
              <span className="flex flex-1 text-left">{getStatusLabel(status)}</span>
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-white rounded-xl">
              <SelectItem value="all" className="focus:bg-secondary focus:text-white text-xs">Todos os Status</SelectItem>
              {Object.entries(statusMap).map(([key, val]) => (
                <SelectItem key={key} value={key} className="focus:bg-secondary focus:text-white text-xs">
                  {val.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nicho */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">Nicho</label>
          <Input
            placeholder="Ex: Saúde"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="bg-background border-border text-white placeholder-slate-500 text-xs focus-visible:ring-primary h-9 rounded-xl"
          />
        </div>

        {/* País */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">País</label>
          <Input
            placeholder="Ex: Brasil"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-background border-border text-white placeholder-slate-500 text-xs focus-visible:ring-primary h-9 rounded-xl"
          />
        </div>

        {/* Ordenar Por */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">Ordenar por</label>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'created_at')}>
            <SelectTrigger className="bg-background border-border text-white text-xs h-9 rounded-xl w-full">
              <span className="flex flex-1 text-left">{getSortByLabel(sortBy)}</span>
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-white rounded-xl">
              <SelectItem value="created_at" className="focus:bg-secondary focus:text-white text-xs">Data de Criação</SelectItem>
              <SelectItem value="updated_at" className="focus:bg-secondary focus:text-white text-xs">Última Atualização</SelectItem>
              <SelectItem value="current_ads_count" className="focus:bg-secondary focus:text-white text-xs">Nº de Anúncios</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-border">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="text-[11px] h-8 border-border bg-background text-slate-350 hover:text-white hover:bg-secondary px-3 rounded-xl"
          >
            Ordem: {sortOrder === 'desc' ? 'Decrescente' : 'Crescente'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`text-[11px] h-8 border px-3 rounded-xl transition-all gap-1.5 flex items-center cursor-pointer ${
              onlyFavorites 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30' 
                : 'border-border bg-background text-slate-350 hover:text-white hover:bg-secondary'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`} />
            Apenas Favoritas
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-white hover:bg-secondary/50 h-8 px-3 rounded-xl"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Limpar
          </Button>

          <Button
            size="sm"
            onClick={applyFilters}
            className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-4 font-semibold rounded-xl"
          >
            Filtrar
          </Button>
        </div>
      </div>
    </div>
  )
}
