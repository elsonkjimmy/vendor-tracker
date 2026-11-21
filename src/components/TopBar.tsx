import { Calendar, Cloud, CloudOff, Home, RefreshCw, ShieldCheck, Truck } from 'lucide-react'
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
  const modeLabel =
    mode === 'admin'
      ? 'Supervision Super Admin'
      : mode === 'driver'
        ? 'Espace Livreur • Tournée'
        : 'Espace Gérant • Boutique'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        {/* Left: Mobile Brand or Desktop Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onSwitchMode('landing')}
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-emerald-400"
            title="Accueil"
          >
            <Truck className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-black text-sm sm:text-base tracking-tight text-slate-950">
              {modeLabel}
            </h1>
            <p className="hidden sm:block text-[11px] font-medium text-slate-500">
              {user ? `Connecté : ${user.name}` : 'Mode local hors-ligne (données sauvegardées sur cet appareil)'}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Date selector (hidden in admin mode) */}
          {mode !== 'admin' && (
            <label className="relative flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-white transition cursor-pointer">
              <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <input
                type="date"
                value={activeDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              />
            </label>
          )}

          {/* Sync button */}
          <button
            type="button"
            onClick={user ? onSyncNow : onOpenAuth}
            disabled={syncing}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
              user
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title={user ? 'Synchroniser avec Cloudflare D1' : 'Se connecter pour activer la synchro cloud'}
          >
            {syncing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : user ? (
              <Cloud className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">{syncing ? 'Synchro...' : user ? 'Synchro Cloud' : 'Hors-ligne'}</span>
          </button>

          {/* Mobile Quick Switch to Admin / Home */}
          <button
            type="button"
            onClick={() => onSwitchMode(mode === 'admin' ? 'manager' : 'admin')}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-purple-700"
            title="Super Admin"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onSwitchMode('landing')}
            className="hidden sm:inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
            title="Page de présentation"
          >
            <Home className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
