import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardCards } from '@/components/dashboard-cards'
import { Button } from '@/components/ui/button'
import { PlusCircle, BarChart2, TrendingUp, Award, Calendar } from 'lucide-react'

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
          <Button className="bg-indigo-650 hover:bg-indigo-550 text-white font-medium">
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

  // 2. Anúncios por nicho (para o gráfico Pizza/Rosca)
  const nicheMap: Record<string, number> = {}
  offersList.forEach(offer => {
    const n = offer.niche || 'Outros'
    nicheMap[n] = (nicheMap[n] || 0) + (offer.current_ads_count || 0)
  })
  const nichesData = Object.entries(nicheMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 nichos

  const totalNicheAdsCount = nichesData.reduce((sum, n) => sum + n.count, 0) || 1

  // Configuração das cores para o gráfico Donut
  const colors = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#ec4899']
  const tailwindBgColors = ['bg-[#6366f1]', 'bg-[#10b981]', 'bg-[#06b6d4]', 'bg-[#f59e0b]', 'bg-[#ec4899]']

  const r = 40
  const circ = 2 * Math.PI * r // ~251.327
  let accumulatedOffset = 0

  const pieSegments = nichesData.map((niche, idx) => {
    const percentage = niche.count / totalNicheAdsCount
    const strokeLength = percentage * circ
    const strokeOffset = -accumulatedOffset
    accumulatedOffset += strokeLength

    return {
      name: niche.name,
      count: niche.count,
      percentage: (percentage * 100).toFixed(0),
      strokeDasharray: `${strokeLength} ${circ}`,
      strokeDashoffset: strokeOffset,
      color: colors[idx % colors.length],
      bgColor: tailwindBgColors[idx % colors.length],
    }
  })

  // 3. Top 3 ofertas ativas por volume de anúncios
  const topOffers = [...offersList]
    .sort((a, b) => (b.current_ads_count || 0) - (a.current_ads_count || 0))
    .slice(0, 3)

  // 4. Evolução de anúncios de 7 dias (Gráfico de área corrigido)
  const evolutionData = getEvolutionData(offersList)
  const maxAds = Math.max(...evolutionData.map(d => d.count), 10)
  
  // Widescreen proportions to prevent stretching
  const chartWidth = 800
  const chartHeight = 180
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
        {/* Niche Pie/Donut Chart */}
        <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Distribuição de Anúncios por Nicho
            </h3>
            <p className="text-xs text-slate-450">
              Proporção de anúncios ativos divididos pelos top nichos de mercado.
            </p>
          </div>

          <div className="flex flex-row items-center gap-6 mt-6 min-h-[140px]">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="40" stroke="#111116" strokeWidth="12" fill="transparent" />
                {pieSegments.map((seg, idx) => (
                  <circle 
                    key={idx}
                    cx="70" 
                    cy="70" 
                    r="40" 
                    stroke={seg.color} 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    transform="rotate(-90 70 70)"
                    strokeLinecap="round"
                    className="transition-all duration-300 hover:stroke-[14] cursor-pointer"
                  />
                ))}
              </svg>
              {/* Center total */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Anúncios</span>
                <span className="text-base font-black text-white leading-none mt-1">{totalAds}</span>
              </div>
            </div>

            {/* Color Legend */}
            <div className="flex-1 flex flex-col gap-2">
              {pieSegments.map((seg) => (
                <div key={seg.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${seg.bgColor} shrink-0`} />
                    <span className="font-semibold text-slate-350 capitalize truncate">{seg.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-500 shrink-0 ml-1">
                    {seg.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Active Offers */}
        <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Top 3 Ofertas Ativas
            </h3>
            <p className="text-xs text-slate-450">
              Ofertas com o maior volume de anúncios ativos veiculando no momento.
            </p>
          </div>

          <div className="space-y-3 mt-6">
            {topOffers.map((offer, idx) => {
              const rankColors = [
                'text-amber-400 bg-amber-500/10 border-amber-500/20',
                'text-slate-300 bg-slate-300/10 border-slate-300/20',
                'text-amber-700 bg-amber-700/10 border-amber-700/20',
              ]
              return (
                <Link 
                  key={offer.id} 
                  href={`/offers/${offer.id}`}
                  className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-900 hover:border-slate-800 rounded-xl transition-all group/offer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg border text-xs font-black flex items-center justify-center shrink-0 ${rankColors[idx % rankColors.length]}`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate group-hover/offer:text-white transition-colors">{offer.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate capitalize mt-0.5">
                        {offer.advertiser_name || 'Anunciante'} • <span className="text-slate-450">{offer.niche || 'Geral'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                      {offer.current_ads_count || 0} ads
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* SVG Evolution Chart */}
      <div className="border border-slate-900 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-900/50">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
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

        {/* Custom SVG Line Chart (Correct Aspect Ratio - No preserveAspectRatio=none) */}
        <div className="mt-6 w-full h-[180px] relative">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
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
