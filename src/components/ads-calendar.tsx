'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUp, ArrowDown } from 'lucide-react'

interface AdsCalendarProps {
  adsHistory?: Record<string, number>
  currentAdsCount?: number
  onUpdateAdsHistory?: (dateStr: string, count: number) => Promise<any>
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const getPrevDayKey = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function AdsCalendar({ adsHistory = {}, currentAdsCount = 0, onUpdateAdsHistory }: AdsCalendarProps) {
  // Use current system date (2026-07-13) as default
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Helper to format date key YYYY-MM-DD
  const formatDateKey = (dayNum: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
  }

  // Get number of days in the current month
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate()
  }

  // Get day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayIndex = getFirstDayOfMonth(year, month)

  // Get previous month info to fill start of grid
  const prevMonthIndex = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonthIndex)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const todayKey = today.toLocaleDateString('en-CA')

  const [editingDateKey, setEditingDateKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  const handleCellClick = (dateKey: string, currentCount: number) => {
    setEditingDateKey(dateKey)
    setEditValue(currentCount)
  }

  const handleSave = async (dateKey: string, value: number) => {
    setEditingDateKey(null)
    if (onUpdateAdsHistory) {
      await onUpdateAdsHistory(dateKey, value)
    }
  }

  // Generate calendar days
  const calendarCells = []

  // 1. Previous month days (muted)
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateKey: `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`,
    })
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateKey: formatDateKey(d),
    })
  }

  // 3. Next month days (muted) to fill grid (assuming 6 rows = 42 cells)
  const remainingCells = 42 - calendarCells.length
  const nextMonthIndex = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  for (let d = 1; d <= remainingCells; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      dateKey: `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    })
  }

  return (
    <div className="border border-slate-900 bg-slate-900/30 rounded-xl p-6 backdrop-blur-sm shadow-md space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-semibold text-white">Histórico de Anúncios Ativos</h3>
            <p className="text-xs text-slate-400">Quantidade de anúncios ativos cadastrados por dia</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-lg p-1.5 min-w-[200px]">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-200">
            {MONTH_NAMES[month]} de {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Titles */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((cell, idx) => {
          const isToday = cell.dateKey === todayKey
          const adsCount = cell.isCurrentMonth ? adsHistory[cell.dateKey] : undefined
          const countToShow = adsCount !== undefined ? adsCount : (isToday && cell.isCurrentMonth ? currentAdsCount : undefined)
          const hasData = countToShow !== undefined

          // Calculate trend compared to previous calendar day
          let trend: 'up' | 'down' | null = null
          if (cell.isCurrentMonth && hasData) {
            const prevKey = getPrevDayKey(cell.dateKey)
            const prevCount = adsHistory[prevKey]
            if (prevCount !== undefined) {
              if (countToShow > prevCount) {
                trend = 'up'
              } else {
                trend = 'down'
              }
            }
          }

          return (
            <div
              key={`${cell.dateKey}-${idx}`}
              className={`min-h-[72px] sm:min-h-[84px] rounded-lg p-2 border flex flex-col justify-between transition-all relative ${
                cell.isCurrentMonth
                  ? isToday
                    ? 'border-indigo-500/80 bg-indigo-950/30 ring-1 ring-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                    : 'border-slate-900 bg-slate-950/40 hover:bg-slate-900/40'
                  : 'border-slate-950/10 bg-slate-950/5 text-slate-650 opacity-30'
              }`}
            >
              {/* Day Header */}
              <div className="flex justify-between items-start">
                <span
                  className={`text-xs font-medium ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'text-indigo-400 font-bold'
                        : 'text-slate-350'
                      : 'text-slate-600'
                  }`}
                >
                  {cell.day}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {trend === 'up' && (
                    <span title="Aumentou em relação ao dia anterior" className="shrink-0 flex items-center">
                      <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                  )}
                  {trend === 'down' && (
                    <span title="Diminuiu ou manteve-se estável em relação ao dia anterior" className="shrink-0 flex items-center">
                      <ArrowDown className="w-3.5 h-3.5 text-rose-500" />
                    </span>
                  )}
                  {isToday && cell.isCurrentMonth && (
                    <span className="text-[9px] font-semibold bg-indigo-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90 sm:scale-100 origin-top-right">
                      Hoje
                    </span>
                  )}
                </div>
              </div>

              {/* Day Body (Ads Count) */}
              <div className="mt-1 flex flex-col justify-end items-stretch">
                {editingDateKey === cell.dateKey ? (
                  <input
                    type="number"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    onBlur={() => handleSave(cell.dateKey, editValue)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSave(cell.dateKey, editValue)
                      } else if (e.key === 'Escape') {
                        setEditingDateKey(null)
                      }
                    }}
                    className="w-full bg-slate-900 border border-indigo-500/50 text-white text-center rounded px-1 py-1 text-xs font-bold focus:outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : cell.isCurrentMonth && adsCount !== undefined ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCellClick(cell.dateKey, countToShow ?? 0)
                    }}
                    className={`text-[10px] sm:text-xs font-extrabold text-center px-1 py-1 rounded border transition-colors cursor-pointer ${
                      isToday
                        ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500/45 hover:bg-indigo-500/40'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                    title="Clique para editar a quantidade de anúncios"
                  >
                    <span className="block sm:inline">{countToShow}</span>
                    <span className="hidden sm:inline font-normal text-slate-450 ml-1">
                      anúncios
                    </span>
                  </div>
                ) : cell.isCurrentMonth && isToday ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCellClick(cell.dateKey, countToShow ?? 0)
                    }}
                    className="text-[10px] sm:text-xs font-extrabold text-center px-1 py-1 rounded border bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-pointer"
                    title="Clique para editar a quantidade de anúncios de hoje"
                  >
                    <span className="block sm:inline">{countToShow}</span>
                    <span className="hidden sm:inline font-normal text-slate-450 ml-1">
                      anúncios
                    </span>
                  </div>
                ) : cell.isCurrentMonth ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCellClick(cell.dateKey, 0)
                    }}
                    className="text-[10px] text-center text-slate-500 hover:text-slate-350 hover:bg-slate-950/60 border border-dashed border-slate-800 rounded py-1 transition-colors cursor-pointer w-full font-medium"
                    title="Clique para registrar anúncios neste dia"
                  >
                    + Registrar
                  </button>
                ) : (
                  <div className="h-4 sm:h-5" /> // Empty placeholder to keep layout stable
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend / Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-450 pt-2 border-t border-slate-900/60 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30 inline-block" />
            <span>Dias com dados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-950/30 border border-indigo-500/80 ring-1 ring-indigo-500/50 inline-block" />
            <span>Dia atual (Hoje)</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Aumento vs. dia anterior</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Queda/Estável vs. dia anterior</span>
          </div>
        </div>
        <p className="text-slate-500 mt-1 sm:mt-0">
          Nota: Novos anúncios são registrados na data atual ao atualizar a oferta.
        </p>
      </div>
    </div>
  )
}
