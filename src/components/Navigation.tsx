import {
  BarChart3,
  CalendarDays,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from 'lucide-react'
import type { VendorUser } from '../types'

export type AppMode = 'driver' | 'manager' | 'admin' | 'landing'
export type DriverTab = 'tour' | 'stock' | 'wallet' | 'clients' | 'settings'
export type ManagerTab = 'today' | 'history' | 'summary' | 'products' | 'settings'

interface SidebarProps {
  mode: AppMode
  activeTab: string
  user: VendorUser | null
  onSelectTab: (tab: string) => void
  onSwitchMode: (mode: AppMode) => void
  onOpenNewDelivery?: () => void
  onOpenAuth?: () => void
  onLogout?: () => void
}

export function Sidebar({
  mode,
  activeTab,
  user,
  onSelectTab,
  onSwitchMode,
  onOpenNewDelivery,
  onOpenAuth,
  onLogout,
}: SidebarProps) {
  const driverTabs = [
    { id: 'tour', label: 'Ma Tournée', icon: Truck },
    { id: 'stock', label: 'Mon Stock', icon: Package },
    { id: 'wallet', label: 'Sacoche Caisse', icon: Wallet },
    { id: 'clients', label: 'Boutiques Clientes', icon: Store },
    { id: 'settings', label: 'Profil & Réglages', icon: Settings },
  ]

  const managerTabs = [
    { id: 'today', label: "Aujourd'hui", icon: LayoutDashboard },
    { id: 'history', label: 'Historique', icon: CalendarDays },
    { id: 'summary', label: 'Bilan & Gains', icon: BarChart3 },
    { id: 'products', label: 'Catalogue Produits', icon: Package },
    { id: 'settings', label: 'Profil & Réglages', icon: Settings },
  ]

  const isDriverAccount = mode === 'driver'
  const currentTabs = isDriverAccount ? driverTabs : managerTabs

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col justify-between bg-[#0b1120] p-5 text-slate-300 border-r border-slate-800/80 sticky top-0 h-screen">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSwitchMode('landing')}
            className="flex items-center gap-3 text-left transition hover:opacity-90"
            title="Retour à l'accueil"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20">
              {isDriverAccount ? (
                <Truck className="h-5 w-5 stroke-[2.4]" />
              ) : (
                <Store className="h-5 w-5 stroke-[2.4]" />
              )}
            </div>
            <div>
              <span className="block font-black text-base tracking-tight text-white leading-none">
                Vendor<span className="text-emerald-400">Tracker</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {isDriverAccount ? 'Compte Livreur' : 'Compte Vendeur'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSwitchMode('landing')}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200 transition"
            title="Accueil"
          >
            <Home className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Action Button */}
        {onOpenNewDelivery && mode !== 'admin' && (
          <button
            type="button"
            onClick={onOpenNewDelivery}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            Nouvelle Réception
          </button>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            {isDriverAccount ? 'Espace Livreur' : 'Gestion Boutique'}
          </p>
          {currentTabs.map(({ id, label, icon: Icon }) => {
            const isActive = mode !== 'admin' && activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (mode === 'admin') onSwitchMode('manager')
                  onSelectTab(id)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white/10 text-white font-bold ring-1 ring-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {label}
              </button>
            )
          })}

          {/* Super Admin — STRICTLY ONLY visible if authenticated as Super Admin */}
          {user?.is_admin && (
            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
                Administration
              </p>
              <button
                type="button"
                onClick={() => onSwitchMode('admin')}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  mode === 'admin'
                    ? 'bg-purple-500/20 text-purple-200 font-bold ring-1 ring-purple-400/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck className={`h-4 w-4 ${mode === 'admin' ? 'text-purple-400' : 'text-slate-500'}`} />
                  Super Admin
                </span>
                <span className="h-2 w-2 rounded-full bg-purple-400" />
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="rounded-2xl bg-slate-900/90 p-3.5 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 font-black text-xs text-emerald-400 ring-1 ring-emerald-500/20">
            {(user?.name || (isDriverAccount ? 'LV' : 'VD')).slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-xs text-white">
              {user?.name || (isDriverAccount ? 'Livreur Local' : 'Vendeur Local')}
            </p>
            <p className="truncate text-[11px] text-slate-400">{user?.phone || 'Non connecté'}</p>
          </div>
          {user && onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/15 transition"
                title="Se connecter"
              >
                <LogIn className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </div>
    </aside>
  )
}

interface BottomNavProps {
  mode: AppMode
  activeTab: string
  onSelectTab: (tab: string) => void
}

export function BottomNav({ mode, activeTab, onSelectTab }: BottomNavProps) {
  const driverTabs = [
    { id: 'tour', label: 'Tournée', icon: Truck },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'wallet', label: 'Sacoche', icon: Wallet },
    { id: 'clients', label: 'Boutiques', icon: Store },
    { id: 'settings', label: 'Profil', icon: Settings },
  ]

  const managerTabs = [
    { id: 'today', label: "Aujourd'hui", icon: LayoutDashboard },
    { id: 'history', label: 'Historique', icon: CalendarDays },
    { id: 'summary', label: 'Bilan', icon: BarChart3 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'settings', label: 'Profil', icon: Settings },
  ]

  const tabs = mode === 'driver' ? driverTabs : managerTabs

  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-[24px] bg-slate-950/95 p-1.5 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.45)] backdrop-blur-xl ring-1 ring-white/10">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-90 ${
                isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                  isActive ? 'bg-emerald-500/15 text-emerald-400' : ''
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
