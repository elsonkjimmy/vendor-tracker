import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  PlusCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { calculateDailySheetTotals } from '../lib/calc'
import { formatDate, formatFCFA, formatNumber } from '../lib/format'
import type { DailySheet, Product } from '../types'

interface HistoryCalendarProps {
  allSheets: DailySheet[]
  products: Product[]
  selectedDate: string
  onOpenDate: (date: string) => void
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function HistoryCalendar({ allSheets, products, selectedDate, onOpenDate }: HistoryCalendarProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [viewMonth, setViewMonth] = useState(() => selectedDate.slice(0, 7))
  const [focusedDate, setFocusedDate] = useState(selectedDate)

  // Map date -> { sheet, totals }
  const sheetByDate = useMemo(() => {
    const map = new Map<string, { sheet: DailySheet; totals: ReturnType<typeof calculateDailySheetTotals> }>()
    for (const sheet of allSheets) {
      map.set(sheet.date, { sheet, totals: calculateDailySheetTotals(sheet, products) })
    }
    return map
  }, [allSheets, products])

  const [year, month] = viewMonth.split('-').map(Number)
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  const goMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setViewMonth(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`)
  }

  // Build calendar grid cells (Monday-first)
  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const startOffset = (firstDay.getDay() + 6) % 7 // 0 = Monday
    const cells: Array<{ date: string | null; dayNum: number | null }> = []
    for (let i = 0; i < startOffset; i++) cells.push({ date: null, dayNum: null })
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ date: `${year}-${pad2(month)}-${pad2(day)}`, dayNum: day })
    }
    return cells
  }, [year, month])

  // Month aggregates
  const monthEntries = useMemo(
    () =>
      allSheets
        .filter((s) => s.date.startsWith(viewMonth))
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((s) => ({ sheet: s, totals: calculateDailySheetTotals(s, products) })),
    [allSheets, products, viewMonth]
  )

  const monthStats = useMemo(() => {
    let revenue = 0
    let profit = 0
    let closed = 0
    for (const item of monthEntries) {
      if (item.sheet.closing_done) {
        closed++
        revenue += item.totals.total_employee_revenue
        profit += item.totals.total_net_profit
      }
    }
    return { count: monthEntries.length, closed, revenue, profit }
  }, [monthEntries])

  const focusedEntry = sheetByDate.get(focusedDate)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Month Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card-elevated rounded-2xl p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Jours tracés</p>
          <p className="mt-1 font-black text-2xl text-slate-950 tabular-nums">{monthStats.count}</p>
          <p className="text-[11px] font-medium text-emerald-600">{monthStats.closed} clôturé(s)</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recette du mois</p>
          <p className="mt-1 font-black text-2xl text-slate-950 tabular-nums">{formatFCFA(monthStats.revenue)}</p>
          <p className="text-[11px] font-medium text-slate-500 capitalize">{monthLabel}</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Bénéfice net mois</p>
          <p className="mt-1 font-black text-2xl text-emerald-600 tabular-nums">+{formatFCFA(monthStats.profit)}</p>
          <p className="text-[11px] font-medium text-slate-500">Sur fiches clôturées</p>
        </div>
        <div className="card-elevated rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Jour oublié ?</p>
          <button
            type="button"
            onClick={() => onOpenDate(focusedDate)}
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Saisir ce jour</span>
          </button>
        </div>
      </div>

      {/* Main Split: Calendar (left) + Selected Day Inspector (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Card */}
        <div className="lg:col-span-7 card-elevated rounded-3xl p-4 sm:p-6 space-y-5">
          {/* Month Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-base sm:text-lg text-slate-950 capitalize">{monthLabel}</h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Cliquez sur une date pour inspecter la journée
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMonth(today.slice(0, 7))
                  setFocusedDate(today)
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={() => goMonth(1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarCells.map((cell, idx) => {
              if (!cell.date || !cell.dayNum) return <div key={idx} className="h-14 sm:h-16" />
              const entry = sheetByDate.get(cell.date)
              const isSelected = cell.date === focusedDate
              const isToday = cell.date === today
              const isClosed = entry?.sheet.closing_done
              const hasDeliveries = (entry?.sheet.deliveries.length || 0) > 0

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setFocusedDate(cell.date!)}
                  className={`relative flex h-14 sm:h-16 flex-col items-center justify-between rounded-2xl p-1.5 sm:p-2 text-xs transition active:scale-95 ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-md ring-2 ring-emerald-500'
                      : isClosed
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/80 hover:bg-emerald-100/70'
                        : hasDeliveries
                          ? 'bg-amber-50 text-amber-950 border border-amber-200/80 hover:bg-amber-100/70'
                          : 'bg-slate-50/80 text-slate-700 border border-slate-200/50 hover:bg-white'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className={`font-extrabold text-xs ${isToday && !isSelected ? 'text-emerald-600' : ''}`}>
                      {cell.dayNum}
                    </span>
                    {isClosed ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    ) : hasDeliveries ? (
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    ) : null}
                  </div>
                  {isClosed && entry ? (
                    <span
                      className={`w-full truncate text-center text-[9px] font-bold tabular-nums ${
                        isSelected ? 'text-emerald-300' : 'text-emerald-700'
                      }`}
                    >
                      {formatNumber(Math.round(entry.totals.total_employee_revenue / 1000))}k
                    </span>
                  ) : (
                    <span className="text-[9px] opacity-40">—</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Journée clôturée
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> En cours (non clôturée)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-950" /> Sélectionnée
            </span>
          </div>
        </div>

        {/* Selected Day Inspector */}
        <div className="lg:col-span-5 card-elevated rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  Vue détaillée du jour
                </p>
                <h3 className="mt-0.5 font-black text-lg text-slate-950 capitalize">{formatDate(focusedDate)}</h3>
              </div>
              {focusedEntry ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    focusedEntry.sheet.closing_done
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {focusedEntry.sheet.closing_done ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {focusedEntry.sheet.closing_done ? 'Clôturé' : 'En cours'}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                  Aucune saisie
                </span>
              )}
            </div>

            {focusedEntry ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/70">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Recette Caisse</p>
                    <p className="mt-1 font-black text-lg text-slate-950 tabular-nums">
                      {formatFCFA(focusedEntry.totals.total_employee_revenue)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-200/70">
                    <p className="text-[10px] font-bold uppercase text-emerald-700">Bénéfice Net</p>
                    <p className="mt-1 font-black text-lg text-emerald-700 tabular-nums">
                      +{formatFCFA(focusedEntry.totals.total_net_profit)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold">Reçus</p>
                    <p className="font-black text-slate-900">{focusedEntry.totals.total_delivered}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold">Vendus</p>
                    <p className="font-black text-emerald-700">{focusedEntry.totals.total_sold}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold">Invendus</p>
                    <p className="font-black text-amber-600">{focusedEntry.totals.total_unsold}</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Produits du jour</p>
                  {focusedEntry.totals.products
                    .filter((p) => p.delivered > 0 || p.unsold > 0)
                    .map((p) => (
                      <div
                        key={p.product_id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"
                      >
                        <span className="font-bold text-slate-800">{p.product_name}</span>
                        <span className="text-slate-500 tabular-nums">
                          {p.sold}/{p.delivered} • <b className="text-slate-950">{formatFCFA(p.employee_revenue)}</b>
                        </span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="py-10 text-center space-y-2">
                <Package className="mx-auto h-10 w-10 text-slate-300" />
                <p className="font-bold text-sm text-slate-700">Aucune opération ce jour-là</p>
                <p className="text-xs text-slate-400">
                  Vous pouvez ouvrir cette date pour rattraper une saisie oubliée.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenDate(focusedDate)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-600 transition active:scale-95"
          >
            <span>{focusedEntry ? 'Ouvrir / Modifier cette journée' : 'Ajouter une saisie sur cette date'}</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Month Chronological List */}
      <div className="card-elevated rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-black text-base text-slate-950 capitalize">Toutes les journées — {monthLabel}</h3>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {monthEntries.length} entrée(s)
          </span>
        </div>

        {monthEntries.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">Aucune journée enregistrée sur ce mois.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {monthEntries.map(({ sheet, totals }) => (
              <button
                key={sheet.id}
                type="button"
                onClick={() => onOpenDate(sheet.date)}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 hover:bg-white hover:border-emerald-500/40 transition text-left"
              >
                <div>
                  <p className="font-extrabold text-sm text-slate-950 capitalize">{formatDate(sheet.date)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totals.total_sold} vendus • {totals.total_unsold} invendus • +{formatFCFA(totals.total_net_profit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-slate-950 tabular-nums">
                    {formatFCFA(totals.total_employee_revenue)}
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      sheet.closing_done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sheet.closing_done ? 'Clôturé' : 'En cours'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
