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
  Star
} from 'lucide-react'

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
