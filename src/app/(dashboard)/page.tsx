import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardCards } from '@/components/dashboard-cards'
import { Button } from '@/components/ui/button'
import { PlusCircle, BarChart2, TrendingUp, Award, Layers, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

const getEvolutionData = (offers: any[]) => {
  const data: { date: string; formattedDate: string; count: number }[] = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateKey = d.toLocaleDateString('en-CA')
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    
    let sum = 0
    offers.forEach(offer => {
      const history = offer.ads_history || {}
      if (history[dateKey] !== undefined) {
        sum += history[dateKey]
      } else {
        // Encontrar a data mais próxima no passado
        const pastDates = Object.keys(history)
          .filter(k => k < dateKey)
          .sort()
        if (pastDates.length > 0) {
          const lastKey = pastDates[pastDates.length - 1]
          sum += history[lastKey] || 0
        } else {
          sum += 0
        }
      }
    })
    
    data.push({ date: dateKey, formattedDate: label, count: sum })
  }
  return data
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obter todas as ofertas do usuário
  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', user.id)
  const offersList = offers || []

  // Se não houver ofertas cadastradas
  if (offersList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/10 backdrop-blur-sm space-y-4">
        <div className="p-4 bg-slate-900/80 rounded-full text-indigo-400 border border-slate-800">
          <BarChart2 className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-lg font-bold text-white">Nenhum dado analítico disponível</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Cadastre suas primeiras ofertas da Meta Ad Library para começarmos a consolidar as estatísticas, médias e gráficos de evolução.
          </p>
        </div>
        <Link href="/offers/new">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
            <PlusCircle className="w-4 h-4 mr-2" />
            Cadastrar Primeira Oferta
          </Button>
        </Link>
      </div>
    )
  }

  // 1. Cálculos de métricas gerais
  const totalOffers = offersList.length
  const totalAds = offersList.reduce((sum, o) => sum + (o.current_ads_count || 0), 0)
  const scalingOffersCount = offersList.filter(o => o.status === 'scaling').length
  const growingOffersCount = offersList.filter(o => o.status === 'growing').length
  const watchingOffersCount = offersList.filter(o => o.status === 'watching').length
  const stableOffersCount = offersList.filter(o => o.status === 'stable').length
  const favoriteOffersCount = offersList.filter(o => o.is_favorite).length
  
  // Taxa de escala e favoritos
  const scalingRate = ((scalingOffersCount / totalOffers) * 100).toFixed(0)
  const favoriteRate = ((favoriteOffersCount / totalOffers) * 100).toFixed(0)
  const avgAdsPerOffer = (totalAds / totalOffers).toFixed(1)

  // Verificação de última atualização há mais de 7 dias
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const noRecentUpdate = offersList.filter(o => new Date(o.updated_at) < sevenDaysAgo).length

  const metrics = {
    total: totalOffers,
    watching: watchingOffersCount,
    growing: growingOffersCount,
    scaling: scalingOffersCount,
    noRecentUpdate,
  }

  // 2. Anúncios por nicho
  const nicheMap: Record<string, number> = {}
  offersList.forEach(offer => {
    const n = offer.niche || 'Outros'
    nicheMap[n] = (nicheMap[n] || 0) + (offer.current_ads_count || 0)
  })
  const nichesData = Object.entries(nicheMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 nichos

  const maxNicheAds = Math.max(...nichesData.map(n => n.count), 1)

  // 3. Evolução de anúncios de 7 dias
  const evolutionData = getEvolutionData(offersList)
  const maxAds = Math.max(...evolutionData.map(d => d.count), 10)
  
  // Coordenadas para o gráfico SVG
  const chartWidth = 500
  const chartHeight = 160
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 15
  const paddingBottom = 25
  const graphWidth = chartWidth - paddingLeft - paddingRight
  const graphHeight = chartHeight - paddingTop - paddingBottom

  const points = evolutionData.map((d, idx) => {
    const x = paddingLeft + (idx / (evolutionData.length - 1)) * graphWidth
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
    <div className="space-y-8">
      {/* Metric Cards */}
      <DashboardCards metrics={metrics} />

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Niche Breakdown */}
        <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Distribuição de Anúncios por Nicho
            </h3>
            <p className="text-xs text-slate-450">
              Top 5 nichos com maior volume de anúncios ativos acumulados.
            </p>
          </div>

          <div className="space-y-4.5 mt-6">
            {nichesData.map((niche, idx) => {
              const pct = (niche.count / maxNicheAds) * 100
              const colors = [
                'bg-indigo-500',
                'bg-emerald-500',
                'bg-cyan-500',
                'bg-amber-500',
                'bg-pink-500',
              ]
              return (
                <div key={niche.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200 capitalize">{niche.name}</span>
                    <span className="font-extrabold text-slate-400">{niche.count} ads</span>
                  </div>
                  <div className="w-full bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Statistical Averages & Insights */}
        <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Estatísticas & Médias Avançadas
            </h3>
            <p className="text-xs text-slate-450">
              Indicadores consolidados das campanhas sob monitoramento.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Avg Ads per Offer */}
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">Média p/ Oferta</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-white">{avgAdsPerOffer}</span>
                <span className="text-[10px] text-slate-500 font-medium">anúncios</span>
              </div>
            </div>

            {/* Total Active Ads */}
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-455 font-semibold uppercase tracking-wider">Total de Anúncios</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-emerald-400">{totalAds}</span>
                <span className="text-[10px] text-slate-500 font-medium">ativos</span>
              </div>
            </div>

            {/* Scaling Rate */}
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-455 font-semibold uppercase tracking-wider">Taxa de Escala</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-indigo-400">{scalingRate}%</span>
                <span className="text-[10px] text-slate-500 font-medium">das ofertas</span>
              </div>
            </div>

            {/* Favorite Rate */}
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-455 font-semibold uppercase tracking-wider">Taxa de Favoritas</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-amber-400">{favoriteRate}%</span>
                <span className="text-[10px] text-slate-500 font-medium">favoritadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Evolution Chart */}
      <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-900/50">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Evolução de Anúncios Ativos
            </h3>
            <p className="text-xs text-slate-450">
              Total de anúncios ativos monitorados nos últimos 7 dias.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-900/30 border border-slate-900 px-3 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5" />
            <span>Últimos 7 dias</span>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="mt-6 w-full h-[180px] relative">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.00" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
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
            <path d={areaPath} fill="url(#areaGradient)" />

            {/* Line Path */}
            <path 
              d={linePath} 
              fill="none" 
              stroke="url(#lineGradient)" 
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
    </div>
  )
}
