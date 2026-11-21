import {
  CheckCircle2,
  Edit2,
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
    const avgMargin =
      active.length > 0
        ? Math.round(active.reduce((sum, p) => sum + (p.selling_price - p.cost_price), 0) / active.length)
        : 0
    return { total: products.length, active: active.length, returnable: returnable.length, avgMargin }
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
            Gérez vos références, prix d'achat, prix de vente, marges et conditions de reprise
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenProductModal()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white shadow-md hover:bg-emerald-600 transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4 text-emerald-400" />
          <span>Ajouter un Produit</span>
        </button>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Références</span>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-1 font-black text-2xl text-slate-950 tabular-nums">{stats.total}</p>
          <p className="text-[11px] font-medium text-emerald-600">{stats.active} actif(s)</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Repris Fournisseur</span>
            <RotateCcw className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 font-black text-2xl text-slate-950 tabular-nums">{stats.returnable}</p>
          <p className="text-[11px] font-medium text-slate-500">Invendus déductibles</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Marge Moyenne</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 font-black text-2xl text-emerald-600 tabular-nums">+{formatFCFA(stats.avgMargin)}</p>
          <p className="text-[11px] font-medium text-slate-500">Par unité vendue</p>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Catégories</span>
            <Tag className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-1 font-black text-2xl text-slate-950 tabular-nums">{categories.length}</p>
          <p className="text-[11px] font-medium text-slate-500">Familles actives</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-elevated rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit, un fournisseur ou une catégorie..."
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

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1 text-xs font-bold">
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

        {/* Category Chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes catégories
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

      {/* Product Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card-elevated rounded-3xl py-14 text-center space-y-2">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="font-bold text-sm text-slate-700">Aucun produit trouvé</p>
          <p className="text-xs text-slate-400">Essayez un autre mot-clé ou ajoutez une nouvelle référence.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const margin = p.selling_price - p.cost_price
            const marginPct = p.selling_price > 0 ? Math.round((margin / p.selling_price) * 100) : 0
            return (
              <div
                key={p.id}
                className={`card-elevated rounded-3xl p-5 flex flex-col justify-between gap-4 transition hover:border-emerald-500/40 ${
                  !p.is_active ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-base text-slate-950 truncate">{p.name}</h3>
                      {p.category && (
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {p.category}
                        </span>
                      )}
                      {p.returnable ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Repris
                        </span>
                      ) : (
                        <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Non repris
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Fournisseur : <b className="text-slate-700">{p.supplier_name || 'Non renseigné'}</b>
                    </p>
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
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-950 transition"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Pricing Breakdown Bar */}
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-200/60 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Prix Achat</p>
                    <p className="mt-0.5 font-extrabold text-sm text-slate-700 tabular-nums">
                      {formatFCFA(p.cost_price)}
                    </p>
                  </div>
                  <div className="border-x border-slate-200/80">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Prix Vente</p>
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
