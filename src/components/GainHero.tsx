import { AlertCircle, CheckCircle2, RefreshCw, Truck } from 'lucide-react'
import type { DayTotals } from '../types'
import { formatDate, formatFCFA, formatNumber, formatWeekday } from '../lib/format'

interface GainHeroProps {
  totals: DayTotals
  onOpenSync?: () => void
  onSwitchMode?: () => void
  showNetProfit?: boolean
  bottomAction?: React.ReactNode
}

export function GainHero({
  totals,
  onOpenSync,
  onSwitchMode,
  showNetProfit = true,
  bottomAction,
}: GainHeroProps) {
  const isClosed = totals.closing_done

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-sky-900 p-6 text-white shadow-xl shadow-teal-950/20 ring-1 ring-white/15">
      {/* Decorative Blur Spheres */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-teal-300/15 blur-2xl" />

      {/* Top bar inside card */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
            {formatWeekday(totals.date)}
          </p>
          <p className="font-extrabold text-xl tracking-tight">{formatDate(totals.date)}</p>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchMode && (
            <button
              type="button"
              onClick={onSwitchMode}
              className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/30 active:scale-95"
            >
              <Truck className="h-3.5 w-3.5 text-emerald-200" />
              <span>Changer Mode</span>
            </button>
          )}

          {onOpenSync && (
            <button
              type="button"
              onClick={onOpenSync}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition hover:bg-white/25 active:scale-95"
              title="Synchronisation"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Metric */}
      {isClosed ? (
        <div className="relative z-10 space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200/90">
            Recette Caisse à Verser
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[clamp(2.15rem,9.5vw,3rem)] font-black tracking-tight tabular-nums drop-shadow-xs">
              {formatFCFA(totals.total_employee_revenue)}
            </span>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/25 p-3 text-center backdrop-blur-md shadow-inner">
            <div>
              <p className="text-[10px] font-bold uppercase text-white/70">Vendus</p>
              <p className="mt-0.5 text-sm font-extrabold tabular-nums">
                {formatNumber(totals.total_sold)} pcs
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-white/70">Invendus</p>
              <p className="mt-0.5 text-sm font-extrabold tabular-nums text-amber-300">
                {formatNumber(totals.total_unsold)} pcs
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-white/70">
                {showNetProfit ? 'Bénéfice Net' : 'Dû Fournisseur'}
              </p>
              <p className="mt-0.5 truncate text-sm font-extrabold tabular-nums text-emerald-300">
                {showNetProfit
                  ? `+${formatFCFA(totals.total_net_profit)}`
                  : formatFCFA(totals.total_supplier_due)}
              </p>
              {showNetProfit && totals.total_rebate_profit > 0 && (
                <p className="text-[9px] font-bold text-purple-200">
                  dont +{formatFCFA(totals.total_rebate_profit)} rist.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 space-y-3 py-1">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200/90">
            Total Marchandises Reçues
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[clamp(2.25rem,9.5vw,3.25rem)] font-black tracking-tight tabular-nums">
              {formatNumber(totals.total_delivered)}
            </span>
            <span className="text-lg font-bold text-emerald-100">pièces</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white/95">
            <AlertCircle className="h-4 w-4 animate-pulse text-amber-300" />
            <span>En attente de la clôture du soir</span>
          </div>
        </div>
      )}

      {/* Footer Inside Card */}
      <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/15 pt-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/85">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span>
            {isClosed ? 'Point du soir validé' : `${totals.products.length} produit(s) au catalogue`}
          </span>
        </div>
        {bottomAction}
      </div>
    </div>
  )
}
