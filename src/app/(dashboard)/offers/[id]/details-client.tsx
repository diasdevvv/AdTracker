'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteOffer, updateOfferStatus, toggleOfferFavorite, updateAdsCountForDate } from '../actions'
import { StatusBadge, statusMap } from '@/components/status-badge'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import { AdsCalendar } from '@/components/ads-calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Edit, 
  ExternalLink, 
  Trash2,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react'

const getSingleOfferEvolutionData = (adsHistory: Record<string, number> | null, currentAdsCount: number) => {
  const data: { date: string; formattedDate: string; count: number }[] = []
  const today = new Date()
  const history = adsHistory || {}
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateKey = d.toLocaleDateString('en-CA')
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    
    let count = 0
    if (history[dateKey] !== undefined) {
      count = history[dateKey]
    } else {
      const pastDates = Object.keys(history)
        .filter(k => k < dateKey)
        .sort()
      if (pastDates.length > 0) {
        const lastKey = pastDates[pastDates.length - 1]
        count = history[lastKey] || 0
      } else {
        count = currentAdsCount || 0
      }
    }
    
    data.push({ date: dateKey, formattedDate: label, count })
  }
  return data
}

interface DetailsClientProps {
  offer: any
}

export default function DetailsClient({ offer }: DetailsClientProps) {
  const router = useRouter()
  const [isDeletingOpen, setIsDeletingOpen] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isStatusPending, startStatusTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(offer.status)
  const [isFavorite, setIsFavorite] = useState(offer.is_favorite || false)
  const [, startFavoriteTransition] = useTransition()

  const handleToggleFavorite = () => {
    const nextState = !isFavorite
    setIsFavorite(nextState)
    startFavoriteTransition(async () => {
      await toggleOfferFavorite(offer.id)
      router.refresh()
    })
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteOffer(offer.id)
    })
  }

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus)
    startStatusTransition(async () => {
      await updateOfferStatus(offer.id, newStatus)
      router.refresh()
    })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-350 hover:text-white hover:bg-slate-800/80">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-white">{offer.title}</h1>
              <button
                onClick={handleToggleFavorite}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-450 hover:text-amber-400 hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-center"
                title={isFavorite ? 'Remover dos favoritos' : 'Favoritar oferta'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`} />
              </button>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="text-sm text-slate-405 mt-0.5">
              Detalhes do monitoramento da oferta
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href={`/offers/${offer.id}/edit`}>
            <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800/80">
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Editar Oferta
            </Button>
          </Link>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeletingOpen(true)}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Excluir Oferta
          </Button>

          <a href={offer.ad_library_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-indigo-650 hover:bg-indigo-550 text-white">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Abrir Meta Ad Library
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Main Info & Notes */}
        <div className="md:col-span-2 space-y-6">
          <div className="border border-slate-900 bg-slate-900/30 rounded-xl p-6 space-y-6 backdrop-blur-sm shadow-md">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">
              Informações Gerais
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Produto</span>
                <p className="text-sm font-medium text-white">{offer.product_name || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Nicho</span>
                <p className="text-sm font-medium text-white">{offer.niche || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Anunciante</span>
                <p className="text-sm font-medium text-white">{offer.advertiser_name || '-'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Nome da Página / Conta</span>
                <p className="text-sm font-medium text-white">{offer.page_name || '-'}</p>
              </div>
            </div>

            <div className="h-px bg-slate-900" />

            {/* Links Section */}
            <div className="space-y-3">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Links Cadastrados</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-900 text-sm">
                  <div className="truncate pr-4">
                    <span className="text-xs text-slate-400 block font-medium">Meta Ad Library</span>
                    <span className="text-indigo-400 truncate block text-xs">{offer.ad_library_url}</span>
                  </div>
                  <a href={offer.ad_library_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white shrink-0 p-1">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {offer.sales_page_url && (
                  <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-900 text-sm">
                    <div className="truncate pr-4">
                      <span className="text-xs text-slate-400 block font-medium">Página de Vendas</span>
                      <span className="text-indigo-400 truncate block text-xs">{offer.sales_page_url}</span>
                    </div>
                    <a href={offer.sales_page_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white shrink-0 p-1">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="border border-slate-900 bg-slate-900/30 rounded-xl p-6 space-y-3 backdrop-blur-sm shadow-md">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">
              Observações
            </h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {offer.notes || 'Nenhuma observação registrada para esta oferta.'}
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic updates & metadata */}
        <div className="space-y-6">
          {/* Quick Metrics & Controls */}
          <div className="border border-slate-900 bg-slate-900/30 rounded-xl p-6 space-y-6 backdrop-blur-sm shadow-md">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">
              Métricas & Controle
            </h3>

            {/* Ads Count */}
            <div className="bg-slate-950/60 rounded-lg border border-slate-900 p-4 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Anúncios Ativos</span>
              <p className="text-4xl font-extrabold text-white mt-1">{offer.current_ads_count}</p>
            </div>

            {/* Quick Status Control */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 block font-medium">Alterar Status</span>
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={isStatusPending}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white focus:ring-indigo-650 w-full">
                  <SelectValue placeholder="Selecione o status">
                    {statusMap[currentStatus as keyof typeof statusMap]?.label || currentStatus}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {Object.entries(statusMap).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="focus:bg-slate-800 focus:text-white">
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Technical metadata */}
          <div className="border border-slate-900 bg-slate-900/30 rounded-xl p-6 space-y-4 backdrop-blur-sm shadow-md text-xs text-slate-400">
            <h3 className="text-xs font-semibold text-slate-450 uppercase tracking-wider border-b border-slate-900 pb-2">
              Detalhes Técnicos
            </h3>

            <div className="flex justify-between">
              <span>País:</span>
              <span className="font-semibold text-slate-200">{offer.country || '-'}</span>
            </div>

            <div className="flex justify-between">
              <span>Plataforma:</span>
              <span className="font-semibold text-slate-200">{offer.platform || '-'}</span>
            </div>

            <div className="flex justify-between">
              <span>Tipo de Criativo:</span>
              <span className="font-semibold text-slate-200">{offer.creative_type || '-'}</span>
            </div>

            <div className="flex justify-between">
              <span>Anúncio Mais Antigo:</span>
              <span className="font-semibold text-slate-200">{formatDate(offer.oldest_ad_date)}</span>
            </div>

            <div className="h-px bg-slate-900 my-2" />

            <div className="flex justify-between">
              <span>Cadastrada em:</span>
              <span className="text-slate-350">{formatDateTime(offer.created_at)}</span>
            </div>

            <div className="flex justify-between">
              <span>Última atualização:</span>
              <span className="text-slate-350">{formatDateTime(offer.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar History Section */}
      <AdsCalendar 
        adsHistory={offer.ads_history} 
        currentAdsCount={offer.current_ads_count} 
        onUpdateAdsHistory={async (dateStr, count) => {
          await updateAdsCountForDate(offer.id, dateStr, count)
        }}
      />

      {/* Evolution Chart Section (7 Days) */}
      {(() => {
        const singleEvolutionData = getSingleOfferEvolutionData(offer.ads_history, offer.current_ads_count)
        const maxAds = Math.max(...singleEvolutionData.map(d => d.count), 10)
        
        const chartWidth = 800
        const chartHeight = 180
        const paddingLeft = 40
        const paddingRight = 20
        const paddingTop = 15
        const paddingBottom = 25
        const graphWidth = chartWidth - paddingLeft - paddingRight
        const graphHeight = chartHeight - paddingTop - paddingBottom

        const points = singleEvolutionData.map((d, idx) => {
          const x = paddingLeft + (idx / (singleEvolutionData.length - 1)) * graphWidth
          const y = paddingTop + graphHeight - (d.count / maxAds) * graphHeight
          return { x, y, count: d.count, label: d.formattedDate }
        })

        const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        const areaPath = `
          ${linePath} 
          L ${points[points.length - 1].x} ${paddingTop + graphHeight} 
          L ${points[0].x} ${paddingTop + graphHeight} 
          Z
        `

        return (
          <div className="border border-slate-900 bg-slate-900/30 rounded-xl p-6 backdrop-blur-sm shadow-md">
            <div className="flex justify-between items-center pb-4 border-b border-slate-900">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-450 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Evolução de Anúncios Ativos (7 Dias)
                </h3>
                <p className="text-xs text-slate-550">
                  Gráfico de histórico de veiculação desta oferta nos últimos 7 dias.
                </p>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="mt-6 w-full h-[180px] relative">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <defs>
                  <linearGradient id="singleAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="singleLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingTop + ratio * graphHeight
                  const countVal = Math.round(maxAds - ratio * maxAds)
                  return (
                    <g key={idx} className="opacity-40">
                      <line 
                        x1={paddingLeft} 
                        y1={y} 
                        x2={chartWidth - paddingRight} 
                        y2={y} 
                        stroke="#1e293b" 
                        strokeWidth="1" 
                        strokeDasharray="4 4"
                      />
                      <text 
                        x={paddingLeft - 8} 
                        y={y + 4} 
                        fill="#64748b" 
                        fontSize="9" 
                        fontWeight="600"
                        textAnchor="end"
                      >
                        {countVal}
                      </text>
                    </g>
                  )
                })}

                {/* Area Path */}
                <path d={areaPath} fill="url(#singleAreaGradient)" />

                {/* Line Path */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="url(#singleLineGradient)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
                />

                {/* Points & Labels */}
                {points.map((p, idx) => (
                  <g key={idx} className="group/node">
                    {/* Glowing Outer Dot */}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="6" 
                      className="fill-indigo-500/30 stroke-none scale-0 group-hover/node:scale-100 transition-transform duration-200 origin-center"
                    />
                    {/* Inner Dot */}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="3.5" 
                      className="fill-indigo-950 stroke-indigo-400 stroke-[2] cursor-pointer"
                    />
                    
                    {/* Date labels at baseline */}
                    <text 
                      x={p.x} 
                      y={chartHeight - 6} 
                      fill="#64748b" 
                      fontSize="8" 
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>

                    {/* Hover Value Tooltip inside SVG */}
                    <g className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <rect 
                        x={p.x - 22} 
                        y={p.y - 24} 
                        width="44" 
                        height="16" 
                        rx="4" 
                        fill="#0f172a" 
                        stroke="#334155" 
                        strokeWidth="1"
                      />
                      <text 
                        x={p.x} 
                        y={p.y - 13} 
                        fill="#f8fafc" 
                        fontSize="9" 
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {p.count} ads
                      </text>
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )
      })()}

      {/* Delete Modal */}
      <DeleteConfirmDialog
        isOpen={isDeletingOpen}
        onClose={() => setIsDeletingOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        offerTitle={offer.title}
      />
    </div>
  )
}
