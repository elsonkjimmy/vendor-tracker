import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
  Share2,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { calculateDailySheetTotals } from '../lib/calc'
import { formatDate, formatFCFA, formatNumber, formatShortDate } from '../lib/format'
import { openWhatsApp } from '../lib/share'
import type { DailySheet, Product } from '../types'

type PeriodMode = 'day' | 'week' | 'month'

interface SummaryViewProps {
  allSheets: DailySheet[]
  products: Product[]
  activeDate: string
  businessName: string
}

function addDays(isoDate: string, delta: number): string {
  const d = new Date(isoDate + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

function getMondayOfWeek(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  return d.toISOString().slice(0, 10)
}

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function SummaryView({ allSheets, products, activeDate, businessName }: SummaryViewProps) {
  const [period, setPeriod] = useState<PeriodMode>('month')
  const [dayCursor, setDayCursor] = useState(activeDate)
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(activeDate))
  const [monthCursor, setMonthCursor] = useState(() => activeDate.slice(0, 7))

  const { label, filteredSheets, chartDays } = useMemo(() => {
    if (period === 'day') {
      return {
        label: formatDate(dayCursor),
        filteredSheets: allSheets.filter((s) => s.date === dayCursor),
        chartDays: [dayCursor],
      }
    }

    if (period === 'week') {
      const weekEnd = addDays(weekStart, 6)
      const days: string[] = []
      for (let i = 0; i < 7; i++) days.push(addDays(weekStart, i))
      return {
        label: `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`,
        filteredSheets: allSheets.filter((s) => s.date >= weekStart && s.date <= weekEnd),
        chartDays: days,
      }
    }

    const [y, m] = monthCursor.split('-').map(Number)
    const daysInMonth = new Date(y, m, 0).getDate()
    const days: string[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(`${monthCursor}-${String(d).padStart(2, '0')}`)
    }
    const monthName = new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    return {
      label: monthName,
      filteredSheets: allSheets.filter((s) => s.date.startsWith(monthCursor)),
      chartDays: days,
    }
  }, [allSheets, period, dayCursor, weekStart, monthCursor])

  const aggregated = useMemo(() => {
    let totalRevenue = 0
    let totalProfit = 0
    let totalSupplierDue = 0
    let totalDelivered = 0
    let totalSold = 0
    let totalUnsold = 0
    let closedDays = 0

    const byDate = new Map<string, { revenue: number; profit: number; sold: number }>()
    const byProduct = new Map<
      string,
      { id: string; name: string; delivered: number; sold: number; unsold: number; revenue: number; profit: number }
    >()

    for (const s of filteredSheets) {
      const t = calculateDailySheetTotals(s, products)
      totalDelivered += t.total_delivered
      if (s.closing_done) {
        closedDays++
        totalRevenue += t.total_employee_revenue
        totalProfit += t.total_net_profit
        totalSupplierDue += t.total_supplier_due
        totalSold += t.total_sold
        totalUnsold += t.total_unsold
        byDate.set(s.date, {
          revenue: t.total_employee_revenue,
          profit: t.total_net_profit,
          sold: t.total_sold,
        })
      }

      for (const p of t.products) {
        if (p.delivered === 0 && p.unsold === 0) continue
        const prev = byProduct.get(p.product_id) || {
          id: p.product_id,
          name: p.product_name,
          delivered: 0,
          sold: 0,
          unsold: 0,
          revenue: 0,
          profit: 0,
        }
        prev.delivered += p.delivered
        if (s.closing_done) {
          prev.sold += p.sold
          prev.unsold += p.unsold
          prev.revenue += p.employee_revenue
          prev.profit += p.net_profit
        }
        byProduct.set(p.product_id, prev)
      }
    }

    const productBreakdown = Array.from(byProduct.values()).sort((a, b) => b.revenue - a.revenue)
    const avgPerDay = closedDays > 0 ? Math.round(totalRevenue / closedDays) : 0
    const marginRate = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 0
    const unsoldRate = totalDelivered > 0 ? Math.round((totalUnsold / totalDelivered) * 1000) / 10 : 0

    return {
      totalRevenue,
      totalProfit,
      totalSupplierDue,
      totalDelivered,
      totalSold,
      totalUnsold,
      closedDays,
      avgPerDay,
      marginRate,
      unsoldRate,
      byDate,
      productBreakdown,
    }
  }, [filteredSheets, products])

  const handleShift = (delta: number) => {
    if (period === 'day') setDayCursor((d) => addDays(d, delta))
    else if (period === 'week') setWeekStart((w) => addDays(w, delta * 7))
    else setMonthCursor((m) => shiftMonth(m, delta))
  }

  const handleSharePeriodWhatsApp = () => {
    const periodTitle = period === 'day' ? 'JOUR' : period === 'week' ? 'SEMAINE' : 'MOIS'
    const lines = [
      `📊 *BILAN ${periodTitle} (${label.toUpperCase()}) - ${businessName.toUpperCase()}*`,
      `----------------------------------------`,
      `💰 *Recette Totale : ${formatFCFA(aggregated.totalRevenue)}*`,
      `📈 *Bénéfice Net : +${formatFCFA(aggregated.totalProfit)}* (${aggregated.marginRate}%)`,
      `🏢 Dû Fournisseur : ${formatFCFA(aggregated.totalSupplierDue)}`,
      `✅ Vendus : ${formatNumber(aggregated.totalSold)} pcs | ⚠️ Invendus : ${formatNumber(aggregated.totalUnsold)} pcs (${aggregated.unsoldRate}%)`,
      `📅 Jours clôturés : ${aggregated.closedDays} (Moy. ${formatFCFA(aggregated.avgPerDay)}/j)`,
      `----------------------------------------`,
      ...aggregated.productBreakdown.map(
        (p) => `• *${p.name}* : ${p.sold}/${p.delivered} vendus | ${formatFCFA(p.revenue)} (+${formatFCFA(p.profit)})`
      ),
      `----------------------------------------`,
      `_Bilan généré sur VendorTracker_`,
    ]
    openWhatsApp(lines.join('\n'))
  }

  const chartSeries = chartDays.map((date) => ({
    date,
    ...(aggregated.byDate.get(date) || { revenue: 0, profit: 0, sold: 0 }),
  }))
  const maxChartRev = Math.max(...chartSeries.map((c) => c.revenue), 1)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Executive Header + Period Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-black text-2xl tracking-tight text-slate-950">Bilan & Performance</h2>
          <p className="text-xs font-medium text-slate-500">
            Analysez vos recettes, bénéfices nets et invendus par jour, semaine ou mois
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Pill */}
          <div className="inline-flex rounded-2xl border border-slate-200/80 bg-white p-1 text-xs font-bold shadow-2xs">
            {(
              [
                { id: 'day', label: 'Jour' },
                { id: 'week', label: 'Semaine' },
                { id: 'month', label: 'Mois' },
              ] as const
            ).map(({ id, label: tabLabel }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPeriod(id)}
                className={`rounded-xl px-4 py-2 transition ${
                  period === id ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tabLabel}
              </button>
            ))}
          </div>

          {/* Date Range Navigator */}
          <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => handleShift(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Période précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 text-xs font-extrabold text-slate-950 capitalize min-w-[130px] justify-center">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
              {label}
            </span>
            <button
              type="button"
              onClick={() => handleShift(1)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Période suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Executive Banner + 4 KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Dark Executive Summary */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl flex flex-col justify-between">
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                {period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : 'Mois'} • {label}
              </span>
              <span className="text-xs font-bold text-slate-400">{aggregated.closedDays} j. clôturé(s)</span>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Recette Totale Encaissée</p>
            <p className="mt-1 font-black text-3xl sm:text-4xl tracking-tight tabular-nums">
              {formatFCFA(aggregated.totalRevenue)}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span>
                Bénéfice net : +{formatFCFA(aggregated.totalProfit)} ({aggregated.marginRate}%)
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSharePeriodWhatsApp}
            className="relative z-10 mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            <span>Envoyer ce bilan sur WhatsApp</span>
          </button>
        </div>

        {/* Right 2x2 KPI Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="card-elevated rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Bénéfice Net</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-black text-2xl text-emerald-600 tabular-nums">+{formatFCFA(aggregated.totalProfit)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Taux de marge : {aggregated.marginRate}%</p>
            </div>
          </div>

          <div className="card-elevated rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Dû Fournisseur</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-black text-2xl text-slate-950 tabular-nums">
                {formatFCFA(aggregated.totalSupplierDue)}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">Moy. {formatFCFA(aggregated.avgPerDay)} / jour</p>
            </div>
          </div>

          <div className="card-elevated rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Articles Vendus</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-black text-2xl text-slate-950 tabular-nums">
                {formatNumber(aggregated.totalSold)}{' '}
                <span className="text-xs font-semibold text-slate-400">pcs</span>
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Sur {formatNumber(aggregated.totalDelivered)} reçues
              </p>
            </div>
          </div>

          <div className="card-elevated rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Invendus</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <RotateCcw className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-black text-2xl text-amber-600 tabular-nums">
                {formatNumber(aggregated.totalUnsold)}{' '}
                <span className="text-xs font-semibold text-amber-500">pcs</span>
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">Taux : {aggregated.unsoldRate}% du stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Bar Chart (Week & Month) */}
      {period !== 'day' && (
        <div className="card-elevated rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-950">
                Courbe des Recettes ({period === 'week' ? '7 jours' : 'Mois complet'})
              </h3>
              <p className="text-xs text-slate-500">Survolez chaque barre pour consulter le détail du jour</p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="relative pt-6">
            <div className="pointer-events-none absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between">
              <div className="border-b border-dashed border-slate-100" />
              <div className="border-b border-dashed border-slate-100" />
              <div className="border-b border-dashed border-slate-100" />
            </div>

            <div className="relative flex h-48 items-end gap-1.5 sm:gap-2.5 border-b border-slate-200 pb-2 overflow-x-auto">
              {chartSeries.map((c) => {
                const pct = c.revenue > 0 ? Math.max(10, Math.round((c.revenue / maxChartRev) * 100)) : 3
                return (
                  <div
                    key={c.date}
                    className="group relative flex flex-1 min-w-[18px] flex-col items-center justify-end h-full"
                  >
                    <div className="pointer-events-none absolute -top-12 hidden rounded-xl bg-slate-950 px-2.5 py-1.5 text-center text-[10px] font-bold text-white shadow-xl group-hover:block whitespace-nowrap z-20">
                      <div>{formatShortDate(c.date)}</div>
                      <div className="text-emerald-400">{formatFCFA(c.revenue)}</div>
                    </div>
                    <div
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                        c.revenue > 0
                          ? 'bg-gradient-to-t from-slate-900 via-emerald-700 to-emerald-400 group-hover:brightness-110'
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="mt-2 text-[9px] font-bold text-slate-400">
                      {period === 'week' ? formatShortDate(c.date).slice(0, 6) : c.date.slice(8)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Breakdown by Product */}
      <div className="card-elevated rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-black text-lg text-slate-950">Performance par Produit</h3>
            <p className="text-xs text-slate-500">Part de chaque référence dans la recette de la période</p>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {aggregated.productBreakdown.length} produit(s)
          </span>
        </div>

        {aggregated.productBreakdown.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Package className="mx-auto h-9 w-9 text-slate-300" />
            <p className="text-xs font-bold text-slate-500">Aucune vente clôturée sur cette période.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {aggregated.productBreakdown.map((p) => {
              const share = aggregated.totalRevenue > 0 ? Math.round((p.revenue / aggregated.totalRevenue) * 100) : 0
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-sm text-slate-950">{p.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Livré <b>{p.delivered}</b> • Vendu <b className="text-emerald-700">{p.sold}</b> • Invendu{' '}
                        <b className="text-amber-600">{p.unsold}</b>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-slate-950 tabular-nums">{formatFCFA(p.revenue)}</p>
                      <p className="text-[11px] font-bold text-emerald-600 tabular-nums">+{formatFCFA(p.profit)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-slate-200/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-500 tabular-nums w-9 text-right">
                      {share}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
