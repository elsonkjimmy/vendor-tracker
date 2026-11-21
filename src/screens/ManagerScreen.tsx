import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit2,
  KeyRound,
  Package,
  PlusCircle,
  RotateCcw,
  Share2,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { GainHero } from '../components/GainHero'
import { calculateDailySheetTotals } from '../lib/calc'
import { exportDayTotalsCsv } from '../lib/exportCsv'
import { formatDate, formatFCFA, formatNumber, formatShortDate } from '../lib/format'
import { generateReceiptCanvasBlob, generateWhatsAppMessage, openWhatsApp } from '../lib/share'
import type { DailySheet, DayTotals, Product, VendorUser } from '../types'

interface ManagerScreenProps {
  activeTab: string
  totals: DayTotals
  allSheets: DailySheet[]
  products: Product[]
  user: VendorUser | null
  onChangePin: (newPin: string) => Promise<void>
  onOpenNewDelivery: () => void
  onOpenClosing: () => void
  onOpenProductModal: (p?: Product) => void
  onSelectDate: (date: string) => void
  onOpenAuth: () => void
  onLogout: () => void
  onNotify: (tone: 'success' | 'error' | 'info', title: string, detail?: string) => void
}

export function ManagerScreen({
  activeTab,
  totals,
  allSheets,
  products,
  user,
  onChangePin,
  onOpenNewDelivery,
  onOpenClosing,
  onOpenProductModal,
  onSelectDate,
  onOpenAuth,
  onLogout,
  onNotify,
}: ManagerScreenProps) {
  const [pinInput, setPinInput] = useState('')
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
        onNotify('success', 'Image du reçu téléchargée', 'Prête à être envoyée sur WhatsApp.')
      }
    } catch {
      handleShareWhatsAppText()
    } finally {
      setSharing(false)
    }
  }

  // --- TAB: TODAY (Aujourd'hui) ---
  if (activeTab === 'today') {
    const unsoldRate =
      totals.total_delivered > 0 ? Math.round((totals.total_unsold / totals.total_delivered) * 1000) / 10 : 0
    const marginRate =
      totals.total_employee_revenue > 0
        ? Math.round((totals.total_net_profit / totals.total_employee_revenue) * 1000) / 10
        : 0

    return (
      <div className="space-y-6 animate-fade-up">
        <GainHero
          totals={totals}
          showNetProfit={true}
          bottomAction={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShareWhatsAppImage}
                disabled={sharing}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition active:scale-95 disabled:opacity-50"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{sharing ? 'Export...' : 'Ticket WhatsApp'}</span>
              </button>
            </div>
          }
        />

        {/* Desktop 4-KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-elevated rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recette Caisse</span>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-black text-xl sm:text-2xl text-slate-950 tabular-nums">
              {formatFCFA(totals.total_employee_revenue)}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              Dû fournisseur : {formatFCFA(totals.total_supplier_due)}
            </p>
          </div>

          <div className="card-elevated rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bénéfice Net</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-black text-xl sm:text-2xl text-emerald-600 tabular-nums">
              +{formatFCFA(totals.total_net_profit)}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">Marge nette : {marginRate}%</p>
          </div>

          <div className="card-elevated rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Volume Vendu</span>
              <Package className="h-4 w-4 text-sky-600" />
            </div>
            <p className="mt-2 font-black text-xl sm:text-2xl text-slate-950 tabular-nums">
              {formatNumber(totals.total_sold)}{' '}
              <span className="text-xs font-semibold text-slate-400">/ {formatNumber(totals.total_delivered)}</span>
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              {totals.closing_done ? 'Clôturé' : 'En cours de tournée'}
            </p>
          </div>

          <div className="card-elevated rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Taux Invendus</span>
              <RotateCcw className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 font-black text-xl sm:text-2xl text-amber-600 tabular-nums">{unsoldRate}%</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              {formatNumber(totals.total_unsold)} pièce(s) restante(s)
            </p>
          </div>
        </div>

        {/* Quick Manager Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewDelivery}
            className="flex-1 min-w-[160px] flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 px-5 font-bold text-xs sm:text-sm text-white shadow-md hover:bg-emerald-600 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>Ajouter Réception</span>
          </button>
          <button
            type="button"
            onClick={onOpenClosing}
            className="flex-1 min-w-[160px] flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 px-5 font-bold text-xs sm:text-sm text-slate-900 shadow-xs hover:bg-slate-50 transition active:scale-95"
          >
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span>Clôturer & Invendus</span>
          </button>
          <button
            type="button"
            onClick={() => {
              exportDayTotalsCsv(totals)
              onNotify('success', 'Export CSV réussi', `Fichier bilan-${totals.date}.csv téléchargé.`)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 px-4 font-bold text-xs text-slate-700 hover:bg-slate-50 transition active:scale-95"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>CSV</span>
          </button>
        </div>

        {/* Breakdown Table by Product */}
        <div className="card-elevated rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-slate-950">Détail des Produits & Marges</h3>
              <p className="text-xs text-slate-500">Contrôle complet des quantités vendues, invendus et bénéfices</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {totals.products.length} réf.
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/70">
                <tr>
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-3 text-center">Prix Vente</th>
                  <th className="py-3 px-3 text-center">Reçu</th>
                  <th className="py-3 px-3 text-center">Invendu</th>
                  <th className="py-3 px-3 text-center">Vendu</th>
                  <th className="py-3 px-3 text-right">Recette Caisse</th>
                  <th className="py-3 px-4 text-right">Bénéfice Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {totals.products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{p.product_name}</p>
                        {p.returnable && (
                          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                            Repris
                          </span>
                        )}
                      </div>
                      {p.supplier_name && <p className="text-[10px] text-slate-400">{p.supplier_name}</p>}
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold tabular-nums text-slate-600">
                      {formatFCFA(p.selling_price)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900 tabular-nums">{p.delivered}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-700 tabular-nums">{p.unsold}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700 tabular-nums">{p.sold}</td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-950 tabular-nums">
                      {formatFCFA(p.employee_revenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 tabular-nums">
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
      <div className="space-y-5 animate-fade-up">
        <div className="card-elevated rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-xl text-slate-950">Historique des Journées</h2>
              <p className="text-xs text-slate-500">Cliquez sur une journée pour consulter ou modifier son bilan</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {allSheets.length} jour(s)
            </span>
          </div>

          <div className="space-y-2.5">
            {allSheets.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-400">Aucune journée enregistrée pour l'instant.</p>
            ) : (
              allSheets.map((s) => {
                const t = calculateDailySheetTotals(s, products)
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectDate(s.date)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 hover:bg-white hover:shadow-xs transition text-left"
                  >
                    <div>
                      <p className="font-extrabold text-sm text-slate-950">{formatDate(s.date)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.deliveries.length} réception(s) • {t.total_sold} vendus • {t.total_unsold} invendus
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-black text-sm text-slate-950 tabular-nums">
                          {formatFCFA(t.total_employee_revenue)}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            s.closing_done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.closing_done ? 'Clôturé' : 'En cours'}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: SUMMARY (Bilan & Gains) ---
  if (activeTab === 'summary') {
    const computedSheets = allSheets
      .filter((s) => s.closing_done)
      .map((s) => calculateDailySheetTotals(s, products))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalRevenues = computedSheets.reduce((sum, s) => sum + s.total_employee_revenue, 0)
    const totalProfit = computedSheets.reduce((sum, s) => sum + s.total_net_profit, 0)
    const totalSold = computedSheets.reduce((sum, s) => sum + s.total_sold, 0)
    const avgRevenue = computedSheets.length > 0 ? Math.round(totalRevenues / computedSheets.length) : 0
    const maxRev = Math.max(...computedSheets.map((s) => s.total_employee_revenue), 1)

    return (
      <div className="space-y-6 animate-fade-up">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Bilan Consolidé
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 font-black text-3xl sm:text-4xl tabular-nums">{formatFCFA(totalRevenues)}</p>
          <p className="text-xs text-slate-300 mt-1">Total des recettes encaissées sur {computedSheets.length} jour(s) clôturé(s)</p>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-xs">
            <div>
              <p className="text-slate-400">Bénéfice Net Cumulé</p>
              <p className="mt-0.5 font-black text-base text-emerald-400 tabular-nums">+{formatFCFA(totalProfit)}</p>
            </div>
            <div>
              <p className="text-slate-400">Moyenne / Jour</p>
              <p className="mt-0.5 font-black text-base text-white tabular-nums">{formatFCFA(avgRevenue)}</p>
            </div>
            <div>
              <p className="text-slate-400">Articles Vendus</p>
              <p className="mt-0.5 font-black text-base text-white tabular-nums">{formatNumber(totalSold)} pcs</p>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart of Closed Days */}
        <div className="card-elevated rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-950">Évolution des Recettes par Journée</h3>
              <p className="text-xs text-slate-500">Comparaison visuelle de vos journées clôturées</p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          {computedSheets.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              Clôturez au moins une journée pour voir apparaître le graphique des recettes.
            </p>
          ) : (
            <div className="flex h-48 items-end gap-3 pt-4 border-b border-slate-100 pb-2">
              {computedSheets.slice(-10).map((s) => {
                const h = Math.max(10, Math.round((s.total_employee_revenue / maxRev) * 100))
                return (
                  <div key={s.date} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                    <div className="pointer-events-none absolute -top-11 hidden rounded-xl bg-slate-950 px-2.5 py-1.5 text-center text-[10px] font-bold text-white shadow-lg group-hover:block whitespace-nowrap z-10">
                      <div>{formatFCFA(s.total_employee_revenue)}</div>
                      <div className="text-emerald-400">+{formatFCFA(s.total_net_profit)}</div>
                    </div>
                    <div
                      className="w-full max-w-[44px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-teal-400 transition-all group-hover:from-emerald-500"
                      style={{ height: `${h}%` }}
                    />
                    <span className="mt-2 text-[10px] font-bold text-slate-400">{formatShortDate(s.date)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- TAB: PRODUCTS (Catalogue Produits) ---
  if (activeTab === 'products') {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="card-elevated rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-xl text-slate-950">Catalogue des Produits</h2>
              <p className="text-xs text-slate-500">Configurez les prix de vente, coûts d'achat et fournisseurs</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenProductModal()}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition"
            >
              <PlusCircle className="h-4 w-4 text-emerald-400" />
              <span>Nouveau Produit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenProductModal(p)}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 hover:bg-white hover:border-emerald-500/40 hover:shadow-xs transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-slate-950 group-hover:text-emerald-800">{p.name}</p>
                    {p.returnable && (
                      <span className="rounded-md bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                        Repris
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Achat : <span className="font-semibold">{formatFCFA(p.cost_price)}</span> • Vente :{' '}
                    <span className="font-bold text-slate-900">{formatFCFA(p.selling_price)}</span>
                  </p>
                  <span className="mt-1 inline-block text-[10px] font-bold text-emerald-700">
                    Marge unitaire : +{formatFCFA(p.selling_price - p.cost_price)}/u
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 group-hover:text-emerald-700 ring-1 ring-slate-200/70">
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
    <div className="card-elevated rounded-3xl p-6 space-y-6 animate-fade-up">
      <div>
        <h2 className="font-black text-xl text-slate-950">Paramètres Gérant</h2>
        <p className="text-xs text-slate-500">Code PIN de sécurité et synchronisation Cloud Cloudflare</p>
      </div>

      {/* Change PIN section */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <KeyRound className="h-4 w-4 text-emerald-600" />
          <span>Code PIN de l'Espace Gérant</span>
        </div>
        <p className="text-xs text-slate-500">
          Code actuel à 4 chiffres (par défaut : <b>0000</b>). Modifiez-le pour protéger vos marges et prix d'achat.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="password"
            maxLength={4}
            placeholder="Nouveau PIN (4 chiffres)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            className="w-52 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold tracking-widest text-slate-900 focus:border-emerald-600 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={async () => {
              if (pinInput.length === 4) {
                await onChangePin(pinInput)
                setPinInput('')
                onNotify('success', 'Code PIN mis à jour', 'Votre nouveau code PIN à 4 chiffres est actif.')
              } else {
                onNotify('error', 'Code PIN invalide', 'Le code PIN doit comporter exactement 4 chiffres.')
              }
            }}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition"
          >
            Enregistrer
          </button>
        </div>
      </div>

      {/* Cloud Account Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 space-y-3">
        <p className="font-bold text-sm text-slate-900">Compte & Synchronisation Cloudflare D1</p>
        {user ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Connecté en tant que : <b>{user.name}</b> ({user.phone})
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
            >
              Se Déconnecter
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              Sauvegardez vos bilans dans le cloud et synchronisez vos données entre ordinateur et téléphone.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              Se Connecter / Créer un Compte
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
