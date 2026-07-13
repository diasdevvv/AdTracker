import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Eye, TrendingUp, Zap, Clock } from 'lucide-react'

interface DashboardCardsProps {
  metrics: {
    total: number
    watching: number
    growing: number
    scaling: number
    noRecentUpdate: number
  }
}

export function DashboardCards({ metrics }: DashboardCardsProps) {
  const cardData = [
    {
      title: 'Total de Ofertas',
      value: metrics.total,
      description: 'Ofertas cadastradas no total',
      icon: FolderKanban,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-900/40',
      isGradient: false,
    },
    {
      title: 'Em Observação',
      value: metrics.watching,
      description: 'Ofertas sendo monitoradas',
      icon: Eye,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40',
      isGradient: false,
    },
    {
      title: 'Crescendo',
      value: metrics.growing,
      description: 'Ofertas com tração inicial',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40',
      isGradient: false,
    },
    {
      title: 'Escalando',
      value: metrics.scaling,
      description: 'Ofertas em escala agressiva',
      icon: Zap,
      color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 border-violet-200/60 dark:border-violet-900/40',
      isGradient: false,
    },
    {
      title: 'Sem Atualização',
      value: metrics.noRecentUpdate,
      description: 'Sem alterações há + de 7 dias',
      icon: Clock,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40',
      isGradient: false,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cardData.map((card, index) => {
        const Icon = card.icon
        return (
          <Card
            key={index}
            className="border-border bg-card dark:bg-gradient-to-br dark:from-zinc-900/90 dark:via-[#0d0d14]/95 dark:to-[#161225]/95 text-foreground shadow-lg rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-default"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <div className={`p-1.5 rounded-xl border ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tracking-tight">{card.value}</div>
              <p className="text-[10px] text-slate-400 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
