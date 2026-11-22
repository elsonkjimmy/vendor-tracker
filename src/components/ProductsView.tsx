import {
  CheckCircle2,
  Edit2,
  LayoutGrid,
  List,
  Package,
  PlusCircle,
  Power,
  RotateCcw,
  Search,
  Tag,
  TrendingUp,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatFCFA } from '../lib/format'
import type { Product } from '../types'

interface ProductsViewProps {
  products: Product[]
  onOpenProductModal: (p?: Product) => void
  onToggleActive: (p: Product) => Promise<void>
}

export function ProductsView({ products, onOpenProductModal, onToggleActive }: ProductsViewProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'returnable' | 'non_returnable' | 'inactive'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      if (p.category?.trim()) set.add(p.category.trim())
    }
    return Array.from(set).sort()
  }, [products])

  const stats = useMemo(() => {
    const active = products.filter((p) => p.is_active)
    const returnable = products.filter((p) => p.returnable)
    const avgMarginPct =
      active.length > 0
        ? Math.round(
            active.reduce(
              (sum, p) => sum + (p.selling_price > 0 ? ((p.selling_price - p.cost_price) / p.selling_price) * 100 : 0),
              0
            ) / active.length
          )
        : 0
    return { total: products.length, active: active.length, returnable: returnable.length, avgMarginPct }
  }, [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))

      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'returnable'
            ? p.returnable
            : filter === 'non_returnable'
              ? !p.returnable
              : !p.is_active

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      return matchesSearch && matchesFilter && matchesCategory
    })
  }, [products, search, filter, selectedCategory])

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header + CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-black text-2xl tracking-tight text-slate-950">Catalogue Produits</h2>
          <p className="text-xs font-medium text-slate-500">
            Pilotez vos références, marges unitaires et règles de reprise fournisseur
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                viewMode === 'grid' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Vue Grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                viewMode === 'table' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Vue Tableau"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenProductModal()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white shadow-md hover:bg-emerald-600 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>Nouveau Produit</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Catalogue</span>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-1.5 font-black text-2xl text-slate-950 tabular-nums">{stats.total}</p>
          <p className="text-[11px] font-semibold text-emerald-600">{stats.active} actif(s)</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Repris</span>
            <RotateCcw className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 font-black text-2xl text-slate-950 tabular-nums">{stats.returnable}</p>
          <p className="text-[11px] font-medium text-slate-500">Invendus déductibles</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Marge Moyenne</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 font-black text-2xl text-emerald-600 tabular-nums">{stats.avgMarginPct}%</p>
          <p className="text-[11px] font-medium text-slate-500">Taux moyen catalogue</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Familles</span>
            <Tag className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-1.5 font-black text-2xl text-slate-950 tabular-nums">{categories.length}</p>
          <p className="text-[11px] font-medium text-slate-500">Catégories actives</p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="card-elevated rounded-3xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, fournisseur ou catégorie..."
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-hidden transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-bold">
            {(
              [
                { id: 'all', label: 'Tous' },
                { id: 'returnable', label: 'Repris' },
                { id: 'non_returnable', label: 'Non repris' },
                { id: 'inactive', label: 'Inactifs' },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`rounded-xl px-3 py-2 transition ${
                  filter === id ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="card-elevated rounded-3xl py-14 text-center space-y-2">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="font-bold text-sm text-slate-700">Aucun produit ne correspond à votre recherche</p>
          <p className="text-xs text-slate-400">Modifiez vos filtres ou ajoutez une nouvelle référence.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="card-elevated rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-5">Produit</th>
                  <th className="py-3.5 px-3">Fournisseur</th>
                  <th className="py-3.5 px-3 text-right">Achat</th>
                  <th className="py-3.5 px-3 text-right">Vente</th>
                  <th className="py-3.5 px-3 text-right">Marge</th>
                  <th className="py-3.5 px-3 text-center">Reprise</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const margin = p.selling_price - p.cost_price
                  const marginPct = p.selling_price > 0 ? Math.round((margin / p.selling_price) * 100) : 0
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/80 transition ${!p.is_active ? 'opacity-55' : ''}`}>
                      <td className="py-3.5 px-5">
                        <p className="font-extrabold text-slate-950">{p.name}</p>
                        {p.category && <span className="text-[10px] font-semibold text-slate-400">{p.category}</span>}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">{p.supplier_name || '—'}</td>
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-600 tabular-nums">
                        {formatFCFA(p.cost_price)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-slate-950 tabular-nums">
                        {formatFCFA(p.selling_price)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-emerald-600 tabular-nums">
                        +{formatFCFA(margin)} ({marginPct}%)
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            p.returnable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {p.returnable ? 'Repris' : 'Ferme'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void onToggleActive(p)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                            title={p.is_active ? 'Désactiver' : 'Activer'}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenProductModal(p)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                            title="Modifier"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Modern Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const margin = p.selling_price - p.cost_price
            const marginPct = p.selling_price > 0 ? Math.round((margin / p.selling_price) * 100) : 0
            return (
              <div
                key={p.id}
                className={`card-elevated group rounded-3xl p-5 flex flex-col justify-between gap-4 transition hover:border-emerald-500/40 ${
                  !p.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-emerald-400 font-black text-sm shadow-xs">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-black text-base text-slate-950 truncate">{p.name}</h3>
                        {p.returnable ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Repris
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Non repris
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 truncate">
                        {p.category || 'Général'} • {p.supplier_name || 'Fournisseur non défini'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => void onToggleActive(p)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                        p.is_active
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title={p.is_active ? 'Désactiver ce produit' : 'Réactiver ce produit'}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProductModal(p)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-950 hover:text-slate-950 transition"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Pricing Strip */}
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-200/60 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Achat</p>
                    <p className="mt-0.5 font-extrabold text-sm text-slate-700 tabular-nums">
                      {formatFCFA(p.cost_price)}
                    </p>
                  </div>
                  <div className="border-x border-slate-200/80">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Vente</p>
                    <p className="mt-0.5 font-black text-sm text-slate-950 tabular-nums">
                      {formatFCFA(p.selling_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-emerald-700">Marge</p>
                    <p className="mt-0.5 font-black text-sm text-emerald-600 tabular-nums">
                      +{formatFCFA(margin)} <span className="text-[10px]">({marginPct}%)</span>
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
