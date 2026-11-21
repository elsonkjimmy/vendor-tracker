import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  LogIn,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { exportAdminVendorsCsv } from '../lib/exportCsv'
import { formatFCFA, formatNumber, formatShortDate, timeAgo } from '../lib/format'
import type { AdminOverviewResponse, AdminVendorEnriched } from '../types'

interface AdminScreenProps {
  token: string | null
  onBack: () => void
  onLoginRequest: () => void
  onNotify: (tone: 'success' | 'error' | 'info', title: string, detail?: string) => void
}

function buildDemoOverview(): AdminOverviewResponse {
  const now = new Date()
  const day = (offset: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  return {
    ok: true,
    stats: {
      total_vendors: 6,
      active_vendors_7d: 5,
      total_sheets_count: 42,
      closed_sheets_count: 39,
      closing_rate_percent: 93,
      total_revenue_recorded: 2_845_000,
      total_items_sold: 28_450,
      total_products_count: 24,
      records_breakdown: [],
    },
    daily_trends: [
      { date: day(6), revenue: 310_000, items_sold: 3100, sheets_count: 5 },
      { date: day(5), revenue: 385_000, items_sold: 3850, sheets_count: 6 },
      { date: day(4), revenue: 360_000, items_sold: 3600, sheets_count: 6 },
      { date: day(3), revenue: 420_000, items_sold: 4200, sheets_count: 6 },
      { date: day(2), revenue: 465_000, items_sold: 4650, sheets_count: 6 },
      { date: day(1), revenue: 415_000, items_sold: 4150, sheets_count: 6 },
      { date: day(0), revenue: 490_000, items_sold: 4900, sheets_count: 5 },
    ],
    vendors: [
      {
        id: 'demo_1',
        name: 'Boutique Jimmy (Centre)',
        phone: '621614204',
        email: 'elsonkjimmy@gmail.com',
        is_admin: true,
        created_at: new Date(Date.now() - 45 * 86400_000).toISOString(),
        products_count: 6,
        sheets_count: 14,
        closed_sheets_count: 14,
        total_revenue: 945_000,
        total_sold_units: 9450,
        last_active_at: new Date(Date.now() - 25 * 60_000).toISOString(),
        status: 'active',
        recent_sheets: [
          { date: day(0), closing_done: true, revenue: 132_000, items_sold: 1320 },
          { date: day(1), closing_done: true, revenue: 118_500, items_sold: 1185 },
          { date: day(2), closing_done: true, revenue: 141_000, items_sold: 1410 },
        ],
      },
      {
        id: 'demo_2',
        name: 'Alimentation Oumar',
        phone: '677036805',
        is_admin: false,
        created_at: new Date(Date.now() - 30 * 86400_000).toISOString(),
        products_count: 5,
        sheets_count: 12,
        closed_sheets_count: 11,
        total_revenue: 780_000,
        total_sold_units: 7800,
        last_active_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
        status: 'active',
        recent_sheets: [
          { date: day(0), closing_done: true, revenue: 112_000, items_sold: 1120 },
          { date: day(1), closing_done: true, revenue: 105_000, items_sold: 1050 },
        ],
      },
      {
        id: 'demo_3',
        name: 'Tournée Nord — Moussa',
        phone: '699123456',
        is_admin: false,
        created_at: new Date(Date.now() - 20 * 86400_000).toISOString(),
        products_count: 4,
        sheets_count: 10,
        closed_sheets_count: 9,
        total_revenue: 640_000,
        total_sold_units: 6400,
        last_active_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
        status: 'active',
        recent_sheets: [{ date: day(0), closing_done: false, revenue: 88_000, items_sold: 880 }],
      },
      {
        id: 'demo_4',
        name: 'Dépôt Marché Est',
        phone: '655443322',
        is_admin: false,
        created_at: new Date(Date.now() - 12 * 86400_000).toISOString(),
        products_count: 5,
        sheets_count: 6,
        closed_sheets_count: 5,
        total_revenue: 480_000,
        total_sold_units: 4800,
        last_active_at: new Date(Date.now() - 9 * 86400_000).toISOString(),
        status: 'dormant',
        recent_sheets: [],
      },
      {
        id: 'demo_5',
        name: 'Kiosque Carrefour Sud',
        phone: '680998877',
        is_admin: false,
        created_at: new Date(Date.now() - 2 * 86400_000).toISOString(),
        products_count: 4,
        sheets_count: 0,
        closed_sheets_count: 0,
        total_revenue: 0,
        total_sold_units: 0,
        last_active_at: null,
        status: 'new',
        recent_sheets: [],
      },
    ],
    recent_activity: [
      {
        vendor_id: 'demo_1',
        vendor_name: 'Boutique Jimmy (Centre)',
        date: day(0),
        closing_done: true,
        revenue: 132_000,
        items_sold: 1320,
        updated_at: new Date(Date.now() - 25 * 60_000).toISOString(),
      },
      {
        vendor_id: 'demo_2',
        vendor_name: 'Alimentation Oumar',
        date: day(0),
        closing_done: true,
        revenue: 112_000,
        items_sold: 1120,
        updated_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
      },
      {
        vendor_id: 'demo_3',
        vendor_name: 'Tournée Nord — Moussa',
        date: day(0),
        closing_done: false,
        revenue: 88_000,
        items_sold: 880,
        updated_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
      },
    ],
  }
}

export function AdminScreen({ token, onBack, onLoginRequest, onNotify }: AdminScreenProps) {
  const [data, setData] = useState<AdminOverviewResponse | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'new' | 'dormant'>('all')
  const [selectedVendor, setSelectedVendor] = useState<AdminVendorEnriched | null>(null)

  const fetchData = async () => {
    if (!token) {
      setData(buildDemoOverview())
      setIsDemoMode(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.adminOverview(token)
      setData(res)
      setIsDemoMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      setData(buildDemoOverview())
      setIsDemoMode(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-slate-500">Chargement de la supervision globale...</p>
      </div>
    )
  }

  if (!data) return null

  const { stats, vendors, recent_activity, daily_trends } = data

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search) ||
      (v.email && v.email.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const maxTrendRevenue = Math.max(...daily_trends.map((t) => t.revenue), 1)

  return (
    <div className="space-y-6 pb-16 animate-fade-up">
      {/* Demo Mode Banner if not authenticated */}
      {isDemoMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            {error ? (
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
            )}
            <span className="font-semibold">
              {error
                ? `Aperçu Démo (${error}). Connectez votre compte Super Admin pour voir les données D1 réelles.`
                : 'Mode Aperçu Démo actif. Connectez-vous avec votre compte Super Admin pour charger les données Cloudflare D1 en direct.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onLoginRequest}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 font-bold text-white hover:bg-emerald-600 transition"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Connexion Admin</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-2xl tracking-tight text-slate-950">Supervision Globale</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-extrabold text-purple-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Super Admin
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Vue consolidée des vendeurs, recettes et taux de clôture du réseau
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              exportAdminVendorsCsv(filteredVendors)
              onNotify('success', 'Export CSV téléchargé', `${filteredVendors.length} vendeur(s) exporté(s).`)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">CA Consolidé</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-slate-950 tabular-nums">
            {formatFCFA(stats.total_revenue_recorded)}
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{stats.closed_sheets_count} fiches clôturées</span>
          </p>
        </div>

        <div className="card-elevated rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Vendeurs & Dépôts</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-slate-950 tabular-nums">
            {stats.total_vendors}
          </p>
          <p className="mt-1 text-xs font-semibold text-sky-600">
            {stats.active_vendors_7d} actifs ces 7 derniers jours
          </p>
        </div>

        <div className="card-elevated rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Articles Vendus</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-slate-950 tabular-nums">
            {formatNumber(stats.total_items_sold)} <span className="text-sm font-bold text-slate-400">pcs</span>
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {stats.total_products_count} produits actifs
          </p>
        </div>

        <div className="card-elevated rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Taux de Clôture</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-slate-950 tabular-nums">
            {stats.closing_rate_percent}%
          </p>
          <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all duration-500"
              style={{ width: `${stats.closing_rate_percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7-Days Trend Chart & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-950">Activité des 7 derniers jours</h2>
              <p className="text-xs text-slate-500">Évolution quotidienne des recettes enregistrées</p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 flex h-52 items-end gap-3 sm:gap-5 pt-4 border-b border-slate-100 pb-2">
            {daily_trends.map((trend) => {
              const heightPercent = Math.max(8, Math.round((trend.revenue / maxTrendRevenue) * 100))
              return (
                <div key={trend.date} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                  <div className="pointer-events-none absolute -top-14 z-20 hidden rounded-xl bg-slate-950 px-3 py-1.5 text-center text-[10px] font-bold text-white shadow-xl group-hover:block whitespace-nowrap">
                    <div>{formatShortDate(trend.date)}</div>
                    <div className="text-emerald-400">{formatFCFA(trend.revenue)}</div>
                    <div className="text-slate-300">{formatNumber(trend.items_sold)} pcs</div>
                  </div>
                  <div
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-slate-900 via-emerald-700 to-emerald-400 transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="mt-2 text-[10px] font-bold text-slate-400 truncate">
                    {formatShortDate(trend.date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-elevated rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-950">Derniers Points</h2>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {recent_activity.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucune activité récente</p>
            ) : (
              recent_activity.slice(0, 6).map((act, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-950 truncate">{act.vendor_name}</p>
                    <p className="text-[10px] text-slate-500">
                      {formatShortDate(act.date)} • {formatNumber(act.items_sold)} pcs
                    </p>
                  </div>
                  <div className="text-right pl-2">
                    <p className="font-extrabold text-xs text-emerald-700 tabular-nums">{formatFCFA(act.revenue)}</p>
                    <span
                      className={`text-[9px] font-bold ${
                        act.closing_done ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {act.closing_done ? 'Clôturé' : 'En cours'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="card-elevated rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-xl text-slate-950 tracking-tight">Répertoire des Vendeurs & Dépôts</h2>
            <p className="text-xs text-slate-500">Consultez les bilans, caisses et régularité de chaque point de vente</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher nom, tél..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
              {(['all', 'active', 'new', 'dormant'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-2.5 py-1.5 transition ${
                    statusFilter === status ? 'bg-white text-slate-950 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  {status === 'all'
                    ? 'Tous'
                    : status === 'active'
                      ? 'Actifs'
                      : status === 'new'
                        ? 'Nouveaux'
                        : 'Dormants'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4">Vendeur / Dépôt</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">CA Réalisé</th>
                <th className="py-3 px-4 text-center">Clôtures</th>
                <th className="py-3 px-4 text-right">Dernière Activité</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun vendeur ne correspond aux critères
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-emerald-400 font-black text-xs">
                          {v.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-950">{v.name}</p>
                          {v.is_admin && <span className="text-[10px] font-bold text-purple-700">Super Admin</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{v.phone}</div>
                      {v.email && <div className="text-[10px] text-slate-400">{v.email}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          v.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'new'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {v.status === 'active' ? 'Actif' : v.status === 'new' ? 'Nouveau' : 'Dormant'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-950 tabular-nums">
                      {formatFCFA(v.total_revenue)}
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums">
                      <span className="font-bold text-emerald-700">{v.closed_sheets_count}</span>
                      <span className="text-slate-400"> / {v.sheets_count}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">
                      {v.last_active_at ? timeAgo(v.last_active_at) : 'Aucune'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedVendor(v)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 transition"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-up">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-950">{selectedVendor.name}</h3>
                <p className="text-xs text-slate-500">Tél : {selectedVendor.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVendor(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/70">
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Encaissé</p>
                <p className="font-black text-sm text-slate-950 mt-1 tabular-nums">
                  {formatFCFA(selectedVendor.total_revenue)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/70">
                <p className="text-[10px] font-bold uppercase text-slate-400">Vendus</p>
                <p className="font-black text-sm text-slate-950 mt-1 tabular-nums">
                  {formatNumber(selectedVendor.total_sold_units)} pcs
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/70">
                <p className="text-[10px] font-bold uppercase text-slate-400">Catalogue</p>
                <p className="font-black text-sm text-slate-950 mt-1 tabular-nums">
                  {selectedVendor.products_count} réf.
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Dernières Fiches de Tournée
              </h4>
              {selectedVendor.recent_sheets.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Aucune fiche enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {selectedVendor.recent_sheets.map((sheet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50 px-3.5 py-2.5 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-950">{formatShortDate(sheet.date)}</span>
                        <span className="ml-2 text-slate-500">{formatNumber(sheet.items_sold)} pcs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-700 tabular-nums">{formatFCFA(sheet.revenue)}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            sheet.closing_done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sheet.closing_done ? 'Clôturé' : 'En cours'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedVendor(null)}
              className="w-full rounded-2xl bg-slate-950 py-3 font-bold text-white hover:bg-slate-800 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
