import { Calendar, ChevronLeft, ChevronRight, Cloud, CloudOff, RefreshCw, ShieldCheck, Store, Truck } from 'lucide-react'
import { formatShortDate } from '../lib/format'
import type { VendorUser } from '../types'
import type { AppMode } from './Navigation'

interface TopBarProps {
  mode: AppMode
  activeDate: string
  user: VendorUser | null
  syncing: boolean
  onDateChange: (date: string) => void
  onSyncNow: () => void
  onSwitchMode: (mode: AppMode) => void
  onOpenAuth: () => void
}

function shiftDate(iso: string, delta: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

export function TopBar({
  mode,
  activeDate,
  user,
  syncing,
  onDateChange,
  onSyncNow,
  onSwitchMode,
  onOpenAuth,
}: TopBarProps) {
  const today = new Date().toISOString().slice(0, 10)
  const isToday = activeDate === today

  const displayName = user?.name?.trim()

  const desktopTitle =
    mode === 'admin'
      ? 'Supervision Super Admin'
      : displayName || (mode === 'driver' ? 'Espace Livreur • Tournée' : 'Espace Vendeur • Boutique')

  const mobileTitle =
    mode === 'admin'
      ? 'Super Admin'
      : displayName || (mode === 'driver' ? 'Livreur' : 'Ma Boutique')

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-3.5 py-2.5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand + Title (handles long names cleanly without overflow) */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          <button
            type="button"
            onClick={() => onSwitchMode('landing')}
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-emerald-400 shadow-xs"
            title="Accueil"
          >
            {mode === 'driver' ? <Truck className="h-4 w-4" /> : <Store className="h-4 w-4" />}
          </button>
          <div className="min-w-0 flex-1">
            <h1
              className="sm:hidden truncate font-black text-[15px] tracking-tight text-slate-950"
              title={mobileTitle}
            >
              {mobileTitle}
            </h1>
            <h1
              className="hidden sm:block truncate font-black text-base tracking-tight text-slate-950"
              title={desktopTitle}
            >
              {desktopTitle}
            </h1>
            <p className="hidden sm:block truncate text-[11px] font-medium text-slate-500">
              {user
                ? `${mode === 'admin' ? 'Super Admin' : mode === 'driver' ? 'Compte Livreur' : 'Compte Vendeur'} • ${user.phone}`
                : 'Mode local hors-ligne'}
            </p>
          </div>
        </div>

        {/* Right: Day Selector & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {mode !== 'admin' && (
            <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => onDateChange(shiftDate(activeDate, -1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-950 transition"
                title="Jour précédent"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <label className="relative flex items-center gap-1.5 px-2 py-1 text-xs font-extrabold text-slate-800 cursor-pointer hover:text-emerald-700 transition">
                <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">
                  {isToday ? "Aujourd'hui" : formatShortDate(activeDate)}
                </span>
                <input
                  type="date"
                  value={activeDate}
                  onChange={(e) => e.target.value && onDateChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Choisir une date"
                />
              </label>

              <button
                type="button"
                onClick={() => onDateChange(shiftDate(activeDate, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-950 transition"
                title="Jour suivant"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {!isToday && (
                <button
                  type="button"
                  onClick={() => onDateChange(today)}
                  className="hidden md:inline-flex ml-0.5 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-extrabold text-white hover:bg-emerald-500 transition"
                >
                  Auj.
                </button>
              )}
            </div>
          )}

          {/* Sync button */}
          <button
            type="button"
            onClick={user ? onSyncNow : onOpenAuth}
            disabled={syncing}
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
              user
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title={user ? 'Synchroniser avec Cloudflare D1' : 'Se connecter'}
          >
            {syncing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : user ? (
              <Cloud className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">{syncing ? 'Synchro...' : user ? 'Synchro' : 'Connexion'}</span>
          </button>

          {/* Mobile Quick Switch to Admin — ONLY if user is Super Admin */}
          {user?.is_admin && (
            <button
              type="button"
              onClick={() => onSwitchMode(mode === 'admin' ? 'manager' : 'admin')}
              className={`lg:hidden flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                mode === 'admin'
                  ? 'border-purple-500 bg-purple-600 text-white'
                  : 'border-purple-200 bg-purple-50 text-purple-700'
              }`}
              title="Super Admin"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
