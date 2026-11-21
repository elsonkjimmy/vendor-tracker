import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Edit2,
  KeyRound,
  Package,
  PlusCircle,
  Receipt,
  RotateCcw,
  Share2,
  TrendingUp,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { GainHero } from '../components/GainHero'
import { formatDate, formatFCFA, formatNumber, formatShortDate } from '../lib/format'
import { generateReceiptCanvasBlob, generateWhatsAppMessage, openWhatsApp } from '../lib/share'
import type { DailySheet, DayTotals, Product, VendorUser } from '../types'

interface ManagerScreenProps {
  activeTab: string
  totals: DayTotals
  todaySheet: DailySheet
  allSheets: DailySheet[]
  products: Product[]
  user: VendorUser | null
  currentPin: string
  onChangePin: (newPin: string) => Promise<void>
  onOpenNewDelivery: () => void
  onOpenClosing: () => void
  onOpenProductModal: (p?: Product) => void
  onSelectDate: (date: string) => void
  onOpenAuth: () => void
  onLogout: () => void
}

export function ManagerScreen({
  activeTab,
  totals,
  todaySheet,
  allSheets,
  products,
  user,
  currentPin,
  onChangePin,
  onOpenNewDelivery,
  onOpenClosing,
  onOpenProductModal,
  onSelectDate,
  onOpenAuth,
  onLogout,
}: ManagerScreenProps) {
  const [pinInput, setPinInput] = useState('')
  const [pinSuccess, setPinSuccess] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleShareWhatsAppText = () => {
    const msg = generateWhatsAppMessage(totals, user?.name || 'Mon Point de Vente')
    openWhatsApp(msg)
  }

  const handleShareWhatsAppImage = async () => {
    setSharing(true)
    try {
      const blob = await generateReceiptCanvasBlob(totals, user?.name || 'Mon Point de Vente')
      const file = new File([blob], `bilan-${totals.date}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Bilan Journalier ${totals.date}`,
          text: `Recette Caisse : ${formatFCFA(totals.total_employee_revenue)}`,
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bilan-${totals.date}.png`
        a.click()
        URL.revokeObjectURL(url)
        alert('Image du reçu téléchargée !')
      }
    } catch {
      handleShareWhatsAppText()
    } finally {
      setSharing(false)
    }
  }

  // --- TAB: TODAY (Aujourd'hui) ---
  if (activeTab === 'today') {
    return (
      <div className="space-y-6">
        <GainHero
          totals={totals}
          showNetProfit={true}
          bottomAction={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShareWhatsAppImage}
                disabled={sharing}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition active:scale-95 disabled:opacity-50"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{sharing ? 'Export...' : 'Partager Ticket'}</span>
              </button>
            </div>
          }
        />

        {/* Quick Manager Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenNewDelivery}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 px-4 font-bold text-xs sm:text-sm text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Ajouter Réception</span>
          </button>
          <button
            type="button"
            onClick={onOpenClosing}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 px-4 font-bold text-xs sm:text-sm text-white shadow-md hover:bg-zinc-800 transition active:scale-95"
          >
            <RotateCcw className="h-4 w-4 text-amber-300" />
            <span>Clôturer le Point</span>
          </button>
        </div>

        {/* Breakdown Table by Product */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-zinc-900">Détail des Produits & Marges</h3>
              <p className="text-xs text-zinc-500">Contrôle complet des quantités vendues et bénéfices</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700">
              {totals.products.length} réf.
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-3.5">Produit</th>
                  <th className="py-3 px-3 text-center">Prix Vente</th>
                  <th className="py-3 px-3 text-center">Reçu</th>
                  <th className="py-3 px-3 text-center">Invendu</th>
                  <th className="py-3 px-3 text-center">Vendu</th>
                  <th className="py-3 px-3 text-right">Recette Caisse</th>
                  <th className="py-3 px-3 text-right">Bénéfice Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                {totals.products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-zinc-50/70 transition">
                    <td className="py-3 px-3.5">
                      <p className="font-bold text-zinc-900">{p.product_name}</p>
                      {p.supplier_name && (
                        <p className="text-[10px] text-zinc-400">{p.supplier_name}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold tabular-nums text-zinc-600">
                      {formatFCFA(p.selling_price)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-zinc-900 tabular-nums">
                      {p.delivered}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-700 tabular-nums">
                      {p.unsold}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700 tabular-nums">
                      {p.sold}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-zinc-900 tabular-nums">
                      {formatFCFA(p.employee_revenue)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-600 tabular-nums">
                      +{formatFCFA(p.net_profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: HISTORY (Historique) ---
  if (activeTab === 'history') {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="font-black text-xl text-zinc-900">Historique des Journées</h2>
            <p className="text-xs text-zinc-500">Consultez et révisez les fiches journalières passées</p>
          </div>

          <div className="space-y-3">
            {allSheets.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-400">Aucune journée enregistrée</p>
            ) : (
              allSheets.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectDate(s.date)}
                  className="flex w-full items-center justify-between rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 hover:bg-zinc-100/70 transition text-left"
                >
                  <div>
                    <p className="font-extrabold text-sm text-zinc-900">{formatDate(s.date)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {s.deliveries.length} livraison(s) • {Object.values(s.unsold).reduce((a, b) => a + b, 0)} invendus
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        s.closing_done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.closing_done ? 'Clôturé' : 'En cours'}
                    </span>
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: SUMMARY (Bilan & Gains) ---
  if (activeTab === 'summary') {
    const closedSheets = allSheets.filter((s) => s.closing_done)
    const totalRevenues = closedSheets.reduce((sum, s) => sum + (s.cash_collected || 0), 0)
    const avgRevenue = closedSheets.length > 0 ? Math.round(totalRevenues / closedSheets.length) : 0

    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-zinc-900 p-6 text-white shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Bilan Consolidé</span>
          <p className="mt-2 font-black text-3xl tabular-nums">{formatFCFA(totalRevenues)}</p>
          <p className="text-xs text-emerald-100/80 mt-1">Total des recettes encaissées</p>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
            <div>
              <p className="text-white/70">Jours clôturés</p>
              <p className="font-extrabold text-base text-white">{closedSheets.length} jours</p>
            </div>
            <div>
              <p className="text-white/70">Moyenne / jour</p>
              <p className="font-extrabold text-base text-emerald-300">{formatFCFA(avgRevenue)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: PRODUCTS (Catalogue Produits) ---
  if (activeTab === 'products') {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-xl text-zinc-900">Catalogue des Produits</h2>
              <p className="text-xs text-zinc-500">Configurez les prix de vente, coûts et fournisseurs</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenProductModal()}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nouveau Produit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenProductModal(p)}
                className="group flex items-center justify-between rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 hover:bg-emerald-50/50 hover:ring-emerald-600/20 transition cursor-pointer"
              >
                <div>
                  <p className="font-extrabold text-sm text-zinc-900 group-hover:text-emerald-900">
                    {p.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Achat: <span className="font-semibold">{formatFCFA(p.cost_price)}</span> • Vente:{' '}
                    <span className="font-bold text-zinc-900">{formatFCFA(p.selling_price)}</span>
                  </p>
                  <span className="mt-1 inline-block text-[10px] font-bold text-emerald-700">
                    Marge: +{formatFCFA(p.selling_price - p.cost_price)}/u
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-zinc-400 group-hover:text-emerald-700 shadow-2xs">
                  <Edit2 className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: SETTINGS (Paramètres) ---
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-6">
      <div>
        <h2 className="font-black text-xl text-zinc-900">Paramètres Gérant</h2>
        <p className="text-xs text-zinc-500">Code PIN de sécurité et synchronisation Cloud</p>
      </div>

      {/* Change PIN section */}
      <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 space-y-3">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
          <KeyRound className="h-4 w-4 text-emerald-600" />
          <span>Code PIN de l'Espace Gérant</span>
        </div>
        <p className="text-xs text-zinc-500">
          Code actuel à 4 chiffres (par défaut : <b>0000</b>). Modifiez-le pour protéger vos bilans.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            maxLength={4}
            placeholder="Nouveau PIN (4 chiffres)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            className="w-48 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-bold tracking-widest text-zinc-900 focus:border-emerald-600 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={async () => {
              if (pinInput.length === 4) {
                await onChangePin(pinInput)
                setPinSuccess(true)
                setPinInput('')
                setTimeout(() => setPinSuccess(false), 2000)
              } else {
                alert('Le code PIN doit comporter exactement 4 chiffres.')
              }
            }}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition"
          >
            Changer
          </button>
        </div>
        {pinSuccess && <p className="text-xs font-bold text-emerald-600">Code PIN mis à jour avec succès !</p>}
      </div>

      {/* Cloud Account Section */}
      <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 space-y-3">
        <p className="font-bold text-xs text-zinc-900">Compte & Synchronisation en Ligne</p>
        {user ? (
          <div className="space-y-2">
            <p className="text-xs text-zinc-600">
              Connecté en tant que : <b>{user.name}</b> ({user.phone})
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
            >
              Se Déconnecter
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-zinc-500 mb-3">
              Sauvegardez vos bilans et synchronisez vos données entre plusieurs appareils.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              Se Connecter / Créer un Compte
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
