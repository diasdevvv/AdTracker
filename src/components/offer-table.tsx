'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge, statusMap } from './status-badge'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { deleteOffer, updateOfferStatus, updateAdsCount, toggleOfferFavorite } from '@/app/(dashboard)/offers/actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, ExternalLink, Eye, EyeOff, Edit, Trash2, ShieldAlert, Star, PlusCircle } from 'lucide-react'

interface Offer {
  id: string
  title: string
  product_name: string | null
  niche: string | null
  advertiser_name: string | null
  current_ads_count: number
  status: string
  updated_at: string
  ad_library_url: string
  notes: string | null
  is_favorite?: boolean
}

interface OfferTableProps {
  offers: Offer[]
}

export function OfferTable({ offers }: OfferTableProps) {
  const router = useRouter()
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [, startStatusTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [favUpdatingId, setFavUpdatingId] = useState<string | null>(null)

  const handleToggleFavorite = async (id: string) => {
    setFavUpdatingId(id)
    await toggleOfferFavorite(id)
    setFavUpdatingId(null)
    router.refresh()
  }

  // Persistent hide sensitive state
  const [hideSensitive, setHideSensitive] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adtracker_hide_sensitive') === 'true'
    }
    return false
  })

  const toggleHideSensitive = () => {
    setHideSensitive((prev) => {
      const newVal = !prev
      localStorage.setItem('adtracker_hide_sensitive', String(newVal))
      return newVal
    })
  }

  const handleDeleteConfirm = () => {
    if (!selectedOffer) return
    startDeleteTransition(async () => {
      await deleteOffer(selectedOffer.id)
      setIsDeleteOpen(false)
      setSelectedOffer(null)
      router.refresh()
    })
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    startStatusTransition(async () => {
      await updateOfferStatus(id, newStatus)
      router.refresh()
    })
  }

  const handleAdsCountChange = async (id: string, count: number) => {
    if (count < 0 || isNaN(count)) return
    setUpdatingId(id)
    await updateAdsCount(id, count)
    setUpdatingId(null)
    router.refresh()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex justify-end gap-2.5">
        <Link href="/offers/new">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 h-8 rounded-xl font-semibold cursor-pointer">
            <PlusCircle className="w-3.5 h-3.5" />
            Adicionar Oferta
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleHideSensitive}
          className="border-border bg-card text-slate-350 hover:text-white hover:bg-secondary/60 text-xs gap-1.5 h-8 rounded-xl cursor-pointer"
        >
          {hideSensitive ? (
            <>
              <Eye className="w-3.5 h-3.5 text-primary" />
              Exibir Informações
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              Ocultar Informações
            </>
          )}
        </Button>
      </div>

      <div className="border border-border bg-gradient-to-br from-zinc-900/90 via-[#0d0d14]/95 to-[#161225]/95 rounded-2xl overflow-hidden shadow-lg">
        <Table>
          <TableHeader className="bg-background/40 border-b border-border">
            <TableRow className="border-b border-border hover:bg-background/40">
              <TableHead className="text-slate-400 font-semibold text-xs py-3.5">Título da Oferta</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs py-3.5">Anunciante</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs py-3.5 text-center">Nº Anúncios</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs py-3.5">Observações</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs py-3.5">Status</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs py-3.5">Última Atualização</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs py-3.5 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                <TableCell className="font-semibold text-slate-100 text-sm max-w-[280px] truncate">
                  <div className={hideSensitive ? 'blur-sm select-none pointer-events-none' : 'flex items-center gap-2 flex-wrap'}>
                    <button
                      onClick={() => handleToggleFavorite(offer.id)}
                      disabled={favUpdatingId === offer.id}
                      className="p-1 -ml-1 rounded text-slate-450 hover:text-amber-400 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      title={offer.is_favorite ? 'Remover dos favoritos' : 'Favoritar oferta'}
                    >
                      <Star className={`w-3.5 h-3.5 ${offer.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500 hover:text-slate-350'}`} />
                    </button>
                    <Link href={`/offers/${offer.id}`} className="hover:text-primary transition-colors">
                      {offer.title}
                    </Link>
                    {offer.product_name && (
                      <span className="text-[11px] font-normal text-slate-400 bg-secondary/80 border border-border px-1.5 py-0.5 rounded-md">
                        {offer.product_name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-slate-350 text-sm max-w-[120px] truncate">
                  <span className={hideSensitive ? 'blur-sm select-none' : ''}>
                    {offer.advertiser_name || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-center py-2.5">
                  <div className="flex items-center justify-center">
                    <input
                      type="number"
                      min="0"
                      key={offer.current_ads_count}
                      defaultValue={offer.current_ads_count}
                      onBlur={(e) => handleAdsCountChange(offer.id, Number(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        }
                      }}
                      disabled={updatingId === offer.id}
                      className="w-16 bg-background border border-border text-white text-center rounded px-1.5 py-0.5 focus:border-primary focus:outline-none text-xs disabled:opacity-50 font-bold"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 text-xs max-w-[180px] truncate">
                  <span className={hideSensitive ? 'blur-sm select-none' : ''}>
                    {offer.notes || '-'}
                  </span>
                </TableCell>
                <TableCell className="py-2.5">
                  <StatusBadge status={offer.status} />
                </TableCell>
                <TableCell className="text-slate-400 text-sm">{formatDate(offer.updated_at)}</TableCell>
                <TableCell className="text-right py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/offers/${offer.id}`} title="Visualizar Oferta">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-secondary/40">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    <Link href={`/offers/${offer.id}/edit`} title="Editar Oferta">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-secondary/40">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    <a href={offer.ad_library_url} target="_blank" rel="noopener noreferrer" title="Abrir Ad Library">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-secondary/40">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 text-slate-400 hover:text-white hover:bg-secondary/40 flex items-center justify-center rounded-md cursor-pointer outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border border-border text-white min-w-[160px] rounded-xl">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-slate-400">Opções</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border" />

                          {/* Submenu for changing status */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="focus:bg-secondary focus:text-white text-xs gap-2">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Alterar Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="bg-card border border-border text-white rounded-xl">
                              {Object.entries(statusMap).map(([key, val]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => handleStatusChange(offer.id, key)}
                                  className="focus:bg-secondary focus:text-white text-xs"
                                >
                                  {val.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOffer(offer)
                              setIsDeleteOpen(true)
                            }}
                            className="focus:bg-red-950/40 text-red-400 focus:text-red-300 text-xs gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DeleteConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false)
            setSelectedOffer(null)
          }}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          offerTitle={selectedOffer?.title}
        />
      </div>
    </div>
  )
}
