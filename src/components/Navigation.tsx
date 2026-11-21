import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
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
  onLogout?: () => void
}

export function Sidebar({
  mode,
  activeTab,
  user,
  onSelectTab,
  onSwitchMode,
  onOpenNewDelivery,
  onLogout,
}: SidebarProps) {
  const driverTabs = [
    { id: 'tour', label: 'Ma Tournée', icon: Truck },
    { id: 'stock', label: 'Mon Stock', icon: Package },
    { id: 'wallet', label: 'Sacoche Caisse', icon: Wallet },
    { id: 'clients', label: 'Boutiques Clientes', icon: Store },
    { id: 'settings', label: 'Réglages', icon: Settings },
  ]

  const managerTabs = [
    { id: 'today', label: "Aujourd'hui", icon: LayoutDashboard },
    { id: 'history', label: 'Historique', icon: CalendarDays },
    { id: 'summary', label: 'Bilan & Gains', icon: BarChart3 },
    { id: 'products', label: 'Catalogue Produits', icon: Package },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]

  const currentTabs = mode === 'driver' ? driverTabs : managerTabs

  return (
    <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-zinc-200/80 bg-white p-5 shadow-xs">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSwitchMode('landing')}
            className="flex items-center gap-3 text-left transition hover:opacity-80"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
              <Truck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="block font-black text-lg tracking-tight text-zinc-900 leading-none">
                Vendor<span className="text-emerald-600">Tracker</span>
              </span>
              <span className="text-[11px] font-semibold text-zinc-400">Suivi Vendeurs & Invendus</span>
            </div>
          </button>
        </div>

        {/* Mode Selector Pill */}
        <div className="rounded-2xl bg-zinc-100 p-1.5 ring-1 ring-black/5">
          <div className="grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => onSwitchMode('driver')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                mode === 'driver'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Truck className="h-4 w-4 text-emerald-600" />
              Livreur
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('manager')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                mode === 'manager'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Store className="h-4 w-4 text-teal-600" />
              Gérant
            </button>
          </div>
        </div>

        {/* Quick Action Button */}
        {onOpenNewDelivery && (
          <button
            type="button"
            onClick={onOpenNewDelivery}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95"
          >
            <PlusCircle className="h-5 w-5" />
            Nouvelle Réception
          </button>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Navigation</p>
          {currentTabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                className={`flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600/20'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-700' : 'text-zinc-400'}`} />
                {label}
              </button>
            )
          })}

          {/* Super Admin Tab if Admin */}
          {user?.is_admin && (
            <div className="pt-3 mt-3 border-t border-zinc-100">
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-purple-700">Administration</p>
              <button
                type="button"
                onClick={() => onSwitchMode('admin')}
                className={`flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                  mode === 'admin'
                    ? 'bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-600/20'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                Super Admin
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="rounded-2xl bg-zinc-50 p-3.5 ring-1 ring-zinc-200/60">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-sm text-zinc-900">{user?.name || 'Mode Local'}</p>
            <p className="truncate text-xs text-zinc-500">{user?.phone || 'Non connecté'}</p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700 transition"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
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
    { id: 'settings', label: 'Réglages', icon: Settings },
  ]

  const managerTabs = [
    { id: 'today', label: "Aujourd'hui", icon: LayoutDashboard },
    { id: 'history', label: 'Historique', icon: CalendarDays },
    { id: 'summary', label: 'Bilan', icon: BarChart3 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'settings', label: 'Réglages', icon: Settings },
  ]

  const tabs = mode === 'driver' ? driverTabs : managerTabs

  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-[26px] bg-white/95 p-1.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur-md ring-1 ring-black/5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition active:scale-90 ${
                isActive ? 'text-emerald-700 font-extrabold' : 'text-zinc-400'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                  isActive ? 'bg-emerald-100 text-emerald-800 shadow-xs' : ''
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
