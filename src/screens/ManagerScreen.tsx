import { Package, PlusCircle, RotateCcw, Share2, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { GainHero } from '../components/GainHero'
import { HistoryCalendar } from '../components/HistoryCalendar'
import { ProductsView } from '../components/ProductsView'
import { SettingsView } from '../components/SettingsView'
import { SummaryView } from '../components/SummaryView'
import { formatFCFA, formatNumber } from '../lib/format'
import { generateReceiptCanvasBlob, generateWhatsAppMessage, openWhatsApp } from '../lib/share'
import type { DailySheet, DayTotals, Product, VendorUser } from '../types'

interface ManagerScreenProps {
  activeTab: string
  activeDate: string
  totals: DayTotals
  allSheets: DailySheet[]
  products: Product[]
  user: VendorUser | null
  syncing: boolean
  onSyncNow: () => void
  onChangePin: (newPin: string) => Promise<void>
  onOpenNewDelivery: () => void
  onOpenClosing: () => void
  onOpenProductModal: (p?: Product) => void
  onToggleProductActive: (p: Product) => Promise<void>
  onSelectDate: (date: string) => void
  onOpenAuth: () => void
  onLogout: () => void
  onImportBackup: (data: { products?: Product[]; sheets?: DailySheet[] }) => Promise<void>
  onNotify: (tone: 'success' | 'error' | 'info', title: string, detail?: string) => void
}

export function ManagerScreen({
  activeTab,
  activeDate,
  totals,
  allSheets,
  products,
  user,
  syncing,
  onSyncNow,
  onChangePin,
  onOpenNewDelivery,
  onOpenClosing,
  onOpenProductModal,
  onToggleProductActive,
  onSelectDate,
  onOpenAuth,
  onLogout,
  onImportBackup,
  onNotify,
}: ManagerScreenProps) {
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
            <button
              type="button"
              onClick={handleShareWhatsAppImage}
              disabled={sharing}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition active:scale-95 disabled:opacity-50"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{sharing ? 'Export...' : 'Ticket WhatsApp'}</span>
            </button>
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
              {totals.closing_done ? 'Clôturé' : 'En cours de journée'}
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

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewDelivery}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 px-5 font-bold text-xs sm:text-sm text-white shadow-md hover:bg-emerald-600 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>Ajouter Réception</span>
          </button>
          <button
            type="button"
            onClick={onOpenClosing}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 px-5 font-bold text-xs sm:text-sm text-slate-900 shadow-xs hover:bg-slate-50 transition active:scale-95"
          >
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span>Clôturer & Invendus</span>
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

  // --- TAB: HISTORY (Calendrier + Vue détaillée) ---
  if (activeTab === 'history') {
    return (
      <HistoryCalendar
        allSheets={allSheets}
        products={products}
        selectedDate={activeDate}
        onOpenDate={onSelectDate}
      />
    )
  }

  // --- TAB: SUMMARY (Bilan Jour / Semaine / Mois) ---
  if (activeTab === 'summary') {
    return (
      <SummaryView
        allSheets={allSheets}
        products={products}
        activeDate={activeDate}
        businessName={user?.name || 'Ma Boutique'}
      />
    )
  }

  // --- TAB: PRODUCTS (Catalogue + Recherche + Filtres) ---
  if (activeTab === 'products') {
    return (
      <ProductsView
        products={products}
        onOpenProductModal={onOpenProductModal}
        onToggleActive={onToggleProductActive}
      />
    )
  }

  // --- TAB: SETTINGS (Profil & Réglages complets) ---
  return (
    <SettingsView
      accountRole="vendor"
      user={user}
      products={products}
      allSheets={allSheets}
      syncing={syncing}
      onSyncNow={onSyncNow}
      onChangePin={onChangePin}
      onOpenAuth={onOpenAuth}
      onLogout={onLogout}
      onImportBackup={onImportBackup}
      onNotify={onNotify}
    />
  )
}
