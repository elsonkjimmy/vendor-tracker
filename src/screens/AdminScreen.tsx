import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { formatDate, formatFCFA, formatNumber, formatShortDate, timeAgo } from '../lib/format'
import type { AdminOverviewResponse, AdminVendorEnriched } from '../types'

interface AdminScreenProps {
  token: string | null
  onBack: () => void
  onLoginRequest: () => void
}

export function AdminScreen({ token, onBack, onLoginRequest }: AdminScreenProps) {
  const [data, setData] = useState<AdminOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'new' | 'dormant'>('all')
  const [selectedVendor, setSelectedVendor] = useState<AdminVendorEnriched | null>(null)

  const fetchData = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.adminOverview(token)
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  if (!token) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-fade-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-inner">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-zinc-900">Espace Super Administrateur</h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-500 font-medium">
          Vous devez être connecté avec un compte administrateur autorisé pour consulter les données consolidées.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 transition"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={onLoginRequest}
            className="rounded-2xl bg-purple-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-purple-700/20 hover:bg-purple-800 transition"
          >
            Se Connecter
          </button>
        </div>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm font-bold text-zinc-500">Chargement de la supervision globale...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-bold text-lg text-zinc-900">Accès Refusé ou Erreur</h3>
        <p className="mt-1 text-sm text-zinc-500">{error || 'Impossible de charger les données'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-700"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={fetchData}
            className="rounded-2xl bg-purple-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const { stats, vendors, recent_activity, daily_trends } = data

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search) ||
      (v.email && v.email.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Max revenue in daily trends for bar scaling
  const maxTrendRevenue = Math.max(...daily_trends.map((t) => t.revenue), 1)

  return (
    <div className="space-y-8 pb-16 animate-fade-up">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-zinc-200/80 hover:bg-zinc-50 transition active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-700" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-2xl tracking-tight text-zinc-950">Supervision Globale</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-black text-purple-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Super Admin
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-500">
              Vue consolidée de l'ensemble des vendeurs et tournées actives
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-xs ring-1 ring-zinc-200/80 hover:bg-zinc-50 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Recette Totale</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-zinc-900 tabular-nums">
            {formatFCFA(stats.total_revenue_recorded)}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Sur {stats.closed_sheets_count} fiches clôturées</span>
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Vendeurs & Dépôts</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-zinc-900 tabular-nums">
            {stats.total_vendors}
          </p>
          <p className="mt-1 text-xs font-medium text-blue-600">
            {stats.active_vendors_7d} actifs ces 7 derniers jours
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Articles Vendus</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-zinc-900 tabular-nums">
            {formatNumber(stats.total_items_sold)} <span className="text-base font-bold text-zinc-400">pcs</span>
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            {stats.total_products_count} références au catalogue
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Taux de Clôture</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-black text-2xl sm:text-3xl tracking-tight text-zinc-900 tabular-nums">
            {stats.closing_rate_percent}%
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{ width: `${stats.closing_rate_percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7-Days Trend Chart & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Trends Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-zinc-900">Activité des 7 derniers jours</h2>
              <p className="text-xs text-zinc-500">Évolution quotidienne des recettes enregistrées</p>
            </div>
            <BarChart3 className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="mt-6 flex h-48 items-end gap-3 sm:gap-6 pt-4 border-b border-zinc-100 pb-2">
            {daily_trends.map((trend) => {
              const heightPercent = Math.max(8, Math.round((trend.revenue / maxTrendRevenue) * 100))
              return (
                <div key={trend.date} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-12 z-20 hidden rounded-xl bg-zinc-900 px-2.5 py-1.5 text-center text-[10px] font-bold text-white shadow-lg group-hover:block whitespace-nowrap">
                    <div>{formatShortDate(trend.date)}</div>
                    <div className="text-emerald-400">{formatFCFA(trend.revenue)}</div>
                    <div className="text-zinc-300">{trend.items_sold} pcs</div>
                  </div>

                  <div
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-teal-500 transition-all duration-300 group-hover:from-emerald-700 group-hover:to-teal-600"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="mt-2 text-[10px] font-bold text-zinc-400 truncate">
                    {formatShortDate(trend.date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity Stream */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-zinc-900">Derniers Points Réalisés</h2>
            <Clock className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {recent_activity.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Aucune activité récente</p>
            ) : (
              recent_activity.slice(0, 5).map((act, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-zinc-900 truncate">{act.vendor_name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {formatShortDate(act.date)} • {act.items_sold} pcs vendues
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

      {/* Vendors Table Section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-xl text-zinc-900 tracking-tight">Répertoire des Vendeurs & Dépôts</h2>
            <p className="text-xs text-zinc-500">Consultez les bilans, caisses et régularité de chaque utilisateur</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou tél..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-2xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-purple-600 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex rounded-2xl bg-zinc-100 p-1 text-xs font-bold text-zinc-600">
              {(['all', 'active', 'new', 'dormant'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-2.5 py-1.5 transition ${
                    statusFilter === status ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-zinc-900'
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

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="py-3 px-4">Vendeur / Dépôt</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">CA Réalisé</th>
                <th className="py-3 px-4 text-center">Fiches / Clôtures</th>
                <th className="py-3 px-4 text-right">Dernière Activité</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">
                    Aucun vendeur ne correspond aux critères
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-black">
                          {v.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{v.name}</p>
                          {v.is_admin && (
                            <span className="text-[10px] font-bold text-purple-700">Super Admin</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600">
                      <div>{v.phone}</div>
                      {v.email && <div className="text-[10px] text-zinc-400">{v.email}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          v.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'new'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {v.status === 'active' ? 'Actif' : v.status === 'new' ? 'Nouveau' : 'Dormant'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-zinc-900 tabular-nums">
                      {formatFCFA(v.total_revenue)}
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums">
                      <span className="font-bold text-emerald-700">{v.closed_sheets_count}</span>
                      <span className="text-zinc-400"> / {v.sheets_count}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-500 text-[11px]">
                      {v.last_active_at ? timeAgo(v.last_active_at) : 'Aucune'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedVendor(v)}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-bold text-purple-700 shadow-2xs hover:bg-purple-50 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-up">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-zinc-900">{selectedVendor.name}</h3>
                <p className="text-xs text-zinc-500">Tél: {selectedVendor.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVendor(null)}
                className="rounded-full bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5">
                <p className="text-[10px] font-bold uppercase text-zinc-400">Total Encaissé</p>
                <p className="font-black text-sm text-zinc-900 mt-1">{formatFCFA(selectedVendor.total_revenue)}</p>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5">
                <p className="text-[10px] font-bold uppercase text-zinc-400">Articles Vendus</p>
                <p className="font-black text-sm text-zinc-900 mt-1">{selectedVendor.total_sold_units} pcs</p>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5">
                <p className="text-[10px] font-bold uppercase text-zinc-400">Produits au catalogue</p>
                <p className="font-black text-sm text-zinc-900 mt-1">{selectedVendor.products_count}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Dernières Fiches de Tournée
              </h4>
              {selectedVendor.recent_sheets.length === 0 ? (
                <p className="text-xs text-zinc-400 py-3 text-center">Aucune fiche enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {selectedVendor.recent_sheets.map((sheet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-zinc-50 px-3.5 py-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-zinc-900">{formatShortDate(sheet.date)}</span>
                        <span className="ml-2 text-zinc-400">{sheet.items_sold} pcs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700">{formatFCFA(sheet.revenue)}</span>
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
              className="w-full rounded-2xl bg-zinc-900 py-3 font-bold text-white transition hover:bg-zinc-800"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
