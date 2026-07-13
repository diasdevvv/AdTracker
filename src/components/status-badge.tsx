import { Badge } from '@/components/ui/badge'

export const statusMap = {
  discovery: { label: 'Descoberta', styles: 'bg-blue-950/40 text-blue-300 border-blue-800/80 hover:bg-blue-950/40' },
  watching: { label: 'Em observação', styles: 'bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-950/40' },
  growing: { label: 'Crescendo', styles: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-950/40' },
  stable: { label: 'Estável', styles: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/80 hover:bg-indigo-950/40' },
  scaling: { label: 'Escalando', styles: 'bg-violet-950/40 text-violet-300 border-violet-800/80 hover:bg-violet-950/40' },
  declining: { label: 'Caindo', styles: 'bg-orange-950/40 text-orange-300 border-orange-800/80 hover:bg-orange-950/40' },
  ended: { label: 'Encerrada', styles: 'bg-red-950/40 text-red-300 border-red-800/80 hover:bg-red-950/40' },
  archived: { label: 'Arquivada', styles: 'bg-slate-850/50 text-slate-400 border-slate-700/80 hover:bg-slate-850/50' },
}

export type OfferStatus = keyof typeof statusMap

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status as OfferStatus] || {
    label: status,
    styles: 'bg-slate-850 text-slate-300 border-slate-700',
  }

  return (
    <Badge variant="outline" className={`font-medium px-2.5 py-0.5 rounded-full ${config.styles}`}>
      {config.label}
    </Badge>
  )
}
