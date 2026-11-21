import { Lock, Package, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api'
import { formatFCFA } from '../lib/format'
import type { AccountType, DeliveryItem, MarginType, Product, RebateType, VendorUser } from '../types'

interface DeliveryModalProps {
  products: Product[]
  onSave: (items: DeliveryItem[], supplierName?: string) => Promise<void>
  onClose: () => void
}

export function DeliveryModal({ products, onSave, onClose }: DeliveryModalProps) {
  const [supplier, setSupplier] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const activeProducts = products.filter((p) => p.is_active && !p.deleted)

  const handleQtyChange = (productId: string, val: string) => {
    const num = parseInt(val, 10)
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(num) || num < 0 ? 0 : num,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const items: DeliveryItem[] = []
    for (const p of activeProducts) {
      const q = quantities[p.id] || 0
      if (q > 0) {
        items.push({
          product_id: p.id,
          product_name: p.name,
          quantity: q,
          selling_price: p.selling_price,
          cost_price: p.cost_price,
          returnable: p.returnable,
          margin_type: p.margin_type,
          rebate_type: p.rebate_type,
          rebate_value: p.rebate_value,
        })
      }
    }
    if (items.length === 0) {
      alert('Veuillez saisir au moins une quantité reçue.')
      return
    }

    setSaving(true)
    try {
      await onSave(items, supplier.trim() || undefined)
      onClose()
    } catch {
      alert("Erreur lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-up">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-zinc-900">Nouvelle Réception</h3>
              <p className="text-xs text-zinc-500">Chargement du matin ou réassort en journée</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">
              Nom du Fournisseur / Dépôt (optionnel)
            </label>
            <input
              type="text"
              placeholder="ex: Boulangerie Centrale, Dépôt Principal..."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Quantités Reçues</p>
            {activeProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-zinc-900">{p.name}</p>
                  <p className="text-xs text-zinc-500">Prix vente : {formatFCFA(p.selling_price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={quantities[p.id] ?? ''}
                    onChange={(e) => handleQtyChange(p.id, e.target.value)}
                    className="h-11 w-24 rounded-xl border border-zinc-300 bg-white px-3 text-center text-lg font-black text-zinc-900 shadow-2xs focus:border-emerald-600 focus:outline-hidden"
                  />
                  <span className="text-xs font-bold text-zinc-500">pcs</span>
                </div>
              </div>
            ))}
          </div>
        </form>

        <div className="border-t border-zinc-100 pt-3 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-zinc-200 py-3 font-bold text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-2xl bg-emerald-600 py-3 font-bold text-sm text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Valider la réception'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ClosingModalProps {
  products: Product[]
  deliveredTotals: Record<string, number>
  initialUnsolds?: Record<string, number>
  onSave: (unsolds: Record<string, number>, cashCollected?: number) => Promise<void>
  onClose: () => void
}

export function ClosingModal({
  products,
  deliveredTotals,
  initialUnsolds = {},
  onSave,
  onClose,
}: ClosingModalProps) {
  const [unsolds, setUnsolds] = useState<Record<string, number>>({ ...initialUnsolds })
  const [cashCollected, setCashCollected] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const activeDeliveredProducts = products.filter((p) => (deliveredTotals[p.id] || 0) > 0)

  // Calculate expected revenue in real time
  let expectedRevenue = 0
  let totalSold = 0
  let totalUnsold = 0

  for (const p of activeDeliveredProducts) {
    const deliv = deliveredTotals[p.id] || 0
    const uns = unsolds[p.id] || 0
    const s = Math.max(0, deliv - uns)
    totalSold += s
    totalUnsold += uns
    expectedRevenue += s * p.selling_price
  }

  const handleUnsoldChange = (productId: string, val: string) => {
    const num = parseInt(val, 10)
    setUnsolds((prev) => ({
      ...prev,
      [productId]: isNaN(num) || num < 0 ? 0 : num,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const cash = cashCollected ? parseFloat(cashCollected) : undefined
      await onSave(unsolds, cash)
      onClose()
    } catch {
      alert('Erreur lors de la clôture.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-up">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="font-black text-lg text-zinc-900">Clôture & Invendus du Soir</h3>
            <p className="text-xs text-zinc-500">Saisissez les invendus retournés pour calculer la caisse</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Calculation Banner */}
        <div className="my-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-4 text-white">
          <p className="text-[11px] font-bold uppercase text-emerald-200">Recette Caisse Calculée</p>
          <p className="font-black text-2xl mt-0.5 tabular-nums">{formatFCFA(expectedRevenue)}</p>
          <div className="mt-2 flex gap-4 text-xs">
            <span>✅ {totalSold} pcs vendues</span>
            <span className="text-amber-200">⚠️ {totalUnsold} invendus</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 py-2">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Invendus Restants</p>
            {activeDeliveredProducts.map((p) => {
              const delivered = deliveredTotals[p.id] || 0
              const currentUnsold = unsolds[p.id] || 0
              const sold = Math.max(0, delivered - currentUnsold)
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-zinc-900">{p.name}</p>
                      <p className="text-xs text-zinc-500">
                        Total reçu : {delivered} pcs • Vente : {formatFCFA(p.selling_price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={delivered}
                        placeholder="0"
                        value={unsolds[p.id] ?? ''}
                        onChange={(e) => handleUnsoldChange(p.id, e.target.value)}
                        className="h-11 w-20 rounded-xl border border-amber-300 bg-white px-2 text-center text-lg font-black text-amber-900 shadow-2xs focus:border-amber-500 focus:outline-hidden"
                      />
                      <span className="text-xs font-bold text-amber-700">inv.</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs border-t border-zinc-200/50 pt-1.5 text-zinc-600">
                    <span>Vendu calculé : <b className="text-emerald-700">{sold} pcs</b></span>
                    <span>Recette : <b className="text-zinc-900">{formatFCFA(sold * p.selling_price)}</b></span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-zinc-100 pt-3">
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Espèces réelles versées en caisse (si différent du théorique)
            </label>
            <input
              type="number"
              placeholder={String(expectedRevenue)}
              value={cashCollected}
              onChange={(e) => setCashCollected(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            />
          </div>
        </form>

        <div className="border-t border-zinc-100 pt-3 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-zinc-200 py-3 font-bold text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-2xl bg-zinc-900 py-3 font-bold text-sm text-white shadow-md hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? 'Validation...' : 'Valider la clôture du jour'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ProductModalProps {
  product?: Product | null
  onSave: (product: Partial<Product>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}

export function ProductModal({ product, onSave, onDelete, onClose }: ProductModalProps) {
  const [name, setName] = useState(product?.name || '')
  const [category, setCategory] = useState(product?.category || 'Boulangerie')
  const [sellingPrice, setSellingPrice] = useState(String(product?.selling_price || ''))
  const [costPrice, setCostPrice] = useState(String(product?.cost_price || ''))
  const [supplier, setSupplier] = useState(product?.supplier_name || '')
  const [returnable, setReturnable] = useState(product?.returnable ?? true)
  const [marginType] = useState<MarginType>(product?.margin_type || 'direct')
  const [rebateType] = useState<RebateType>(product?.rebate_type || 'fixed')
  const [rebateValue] = useState(String(product?.rebate_value || ''))
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return alert('Nom du produit requis')
    const sp = parseFloat(sellingPrice)
    const cp = parseFloat(costPrice)
    if (isNaN(sp) || sp < 0) return alert('Prix de vente invalide')
    if (isNaN(cp) || cp < 0) return alert("Prix d'achat invalide")

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        category: category.trim() || undefined,
        selling_price: sp,
        cost_price: cp,
        supplier_name: supplier.trim() || undefined,
        returnable,
        margin_type: marginType,
        rebate_type: marginType === 'rebate' ? rebateType : undefined,
        rebate_value: marginType === 'rebate' ? parseFloat(rebateValue) || 0 : undefined,
      })
      onClose()
    } catch {
      alert('Erreur lors de la sauvegarde du produit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-up">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-black text-lg text-zinc-900">
            {product ? 'Modifier le Produit' : 'Ajouter un Produit'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 py-3">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">Désignation du produit</label>
            <input
              type="text"
              placeholder="ex: Pain 125 F, Croissant..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">Prix de Vente (F)</label>
              <input
                type="number"
                placeholder="100"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">Prix Achat / Revient (F)</label>
              <input
                type="number"
                placeholder="85"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">Catégorie</label>
            <input
              type="text"
              placeholder="ex: Boulangerie, Viennoiserie, Pâtisserie..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">Fournisseur</label>
            <input
              type="text"
              placeholder="ex: Boulangerie Centrale"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <input
              type="checkbox"
              id="returnable"
              checked={returnable}
              onChange={(e) => setReturnable(e.target.checked)}
              className="h-5 w-5 rounded-md border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="returnable" className="text-xs font-semibold text-zinc-700">
              Invendus repris par le fournisseur (non facturés si retournés)
            </label>
          </div>
        </form>

        <div className="border-t border-zinc-100 pt-3 flex gap-2">
          {product && onDelete && (
            <button
              type="button"
              onClick={async () => {
                if (confirm('Supprimer ce produit ?')) {
                  await onDelete(product.id)
                  onClose()
                }
              }}
              className="rounded-2xl border border-red-200 p-3 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-zinc-200 py-3 font-bold text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-2xl bg-emerald-600 py-3 font-bold text-sm text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface AuthModalProps {
  onSuccess: (token: string, user: VendorUser) => void
  onClose: () => void
}

export function AuthModal({ onSuccess, onClose }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [accountType, setAccountType] = useState<AccountType>('vendor')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isRegister) {
        const res = await api.register(name, phone, password, email || undefined, accountType)
        onSuccess(res.token, { ...res.user, account_type: res.user.account_type || accountType })
      } else {
        const res = await api.login(phone || email, password)
        onSuccess(res.token, res.user)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-up">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center mb-5">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="font-black text-xl text-zinc-900">
            {isRegister ? 'Créer un Compte Vendeur' : 'Connexion VendorTracker'}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            {isRegister ? 'Enregistrez votre point de vente' : 'Accédez à votre espace synchronisé'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Type de compte</label>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAccountType('vendor')}
                    className={`rounded-xl py-2 transition ${
                      accountType === 'vendor' ? 'bg-slate-950 text-white shadow-xs' : 'text-zinc-600'
                    }`}
                  >
                    Vendeur / Boutique
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('driver')}
                    className={`rounded-xl py-2 transition ${
                      accountType === 'driver' ? 'bg-slate-950 text-white shadow-xs' : 'text-zinc-600'
                    }`}
                  >
                    Livreur Terrain
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Nom / Enseigne</label>
                <input
                  type="text"
                  placeholder="ex: Boutique Jimmy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">Numéro de Téléphone</label>
            <input
              type="tel"
              placeholder="621614204"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">Email (optionnel)</label>
              <input
                type="email"
                placeholder="vendeur@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">Mot de Passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-2xl bg-emerald-600 py-3 font-bold text-sm text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {loading ? 'Chargement...' : isRegister ? "S'inscrire" : 'Se Connecter'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            {isRegister ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}
