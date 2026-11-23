import { Package, Phone, PlusCircle, Receipt, RotateCcw, Share2, Store, Wallet } from 'lucide-react'
import { useState } from 'react'
import { GainHero } from '../components/GainHero'
import { SettingsView } from '../components/SettingsView'
import { formatFCFA, formatNumber } from '../lib/format'
import { generateReceiptCanvasBlob, generateWhatsAppMessage, openWhatsApp, shareImageBlob } from '../lib/share'
import type { ClientBoutique, DailySheet, DayTotals, Product, VendorUser } from '../types'

interface DriverScreenProps {
  activeTab: string
  totals: DayTotals
  todaySheet: DailySheet
  allSheets: DailySheet[]
  products: Product[]
  clients: ClientBoutique[]
  user: VendorUser | null
  syncing: boolean
  onSyncNow: () => void
  onOpenNewDelivery: () => void
  onOpenClosing: () => void
  onOpenAuth: () => void
  onLogout: () => void
  onImportBackup: (data: { products?: Product[]; sheets?: DailySheet[] }) => Promise<void>
  onNotify: (tone: 'success' | 'error' | 'info', title: string, detail?: string) => void
}

export function DriverScreen({
  activeTab,
  totals,
  todaySheet,
  allSheets,
  products,
  clients,
  user,
  syncing,
  onSyncNow,
  onOpenNewDelivery,
  onOpenClosing,
  onOpenAuth,
  onLogout,
  onImportBackup,
  onNotify,
}: DriverScreenProps) {
  const [sharing, setSharing] = useState(false)

  const handleShareWhatsAppImage = async () => {
    setSharing(true)
    try {
      const business = user?.name || 'Livreur Tournée'
      const blob = await generateReceiptCanvasBlob(totals, business)
      await shareImageBlob({
        blob,
        filename: `bilan-${totals.date}.png`,
        title: `Bilan Tournée ${totals.date}`,
        text: `Recette Caisse : ${formatFCFA(totals.total_employee_revenue)}`,
        fallbackMessage: generateWhatsAppMessage(totals, business),
        onDownloaded: () => onNotify('success', 'Image du reçu téléchargée', 'Prête à être envoyée sur WhatsApp.'),
      })
    } catch {
      onNotify('error', 'Partage impossible', 'Impossible de générer l’image du reçu.')
    } finally {
      setSharing(false)
    }
  }

  // --- TAB: TOUR (Ma Tournée) ---
  if (activeTab === 'tour') {
    return (
      <div className="space-y-6 animate-fade-up">
        <GainHero
          totals={totals}
          showNetProfit={false}
          bottomAction={
            <button
              type="button"
              onClick={handleShareWhatsAppImage}
              disabled={sharing}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition active:scale-95 disabled:opacity-50"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{sharing ? 'Génération...' : 'WhatsApp'}</span>
            </button>
          }
        />

        {/* Quick Driver Action Bar */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onOpenNewDelivery}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 p-4 font-extrabold text-xs sm:text-sm text-white shadow-lg active:scale-95 hover:bg-emerald-600 transition"
          >
            <PlusCircle className="h-5 w-5 text-emerald-400" />
            <span>Réception Matin</span>
          </button>

          <button
            type="button"
            onClick={onOpenClosing}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 font-extrabold text-xs sm:text-sm text-slate-900 shadow-xs active:scale-95 hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-5 w-5 text-amber-600" />
            <span>Clôturer / Invendus</span>
          </button>
        </div>

        {/* Deliveries Feed of the day */}
        <div className="card-elevated rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-950">Chargements & Réceptions du Jour</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {todaySheet.deliveries.length} lot(s)
            </span>
          </div>

          {todaySheet.deliveries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-slate-400">
              <Package className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold">Aucune réception enregistrée pour l'instant</p>
              <button
                type="button"
                onClick={onOpenNewDelivery}
                className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
              >
                + Enregistrer le chargement du matin
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySheet.deliveries.map((batch, idx) => (
                <div key={batch.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 mb-2">
                    <span className="font-bold text-xs text-slate-800">
                      Lot #{idx + 1} {batch.supplier_name ? `• ${batch.supplier_name}` : ''}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(batch.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {batch.items.map((item) => (
                      <span
                        key={item.product_id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <span>{item.product_name} :</span>
                        <span className="text-emerald-700">{item.quantity} pcs</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp Big Ticket Share Button */}
        <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-sm text-slate-950">Bilan Photo Certifié</p>
              <p className="text-xs text-slate-600">Envoyez l'image du point journalier au dépôt</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleShareWhatsAppImage}
            disabled={sharing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white shadow-md hover:bg-emerald-600 transition active:scale-95 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            <span>{sharing ? 'Génération...' : 'Envoyer Ticket WhatsApp'}</span>
          </button>
        </div>
      </div>
    )
  }

  // --- TAB: STOCK (Mon Stock Véhicule) ---
  if (activeTab === 'stock') {
    return (
      <div className="card-elevated rounded-3xl p-5 sm:p-6 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-xl text-slate-950">Stock dans le Véhicule</h2>
            <p className="text-xs text-slate-500">Quantités chargées vs invendus restants</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          {totals.products.map((p) => (
            <div
              key={p.product_id}
              className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
            >
              <div>
                <p className="font-bold text-sm text-slate-950">{p.product_name}</p>
                <p className="text-xs text-slate-500">Prix : {formatFCFA(p.selling_price)}/u</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-950 tabular-nums">
                  {p.delivered - p.unsold}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {p.delivered} pcs</span>
                </p>
                <p className="text-[11px] font-semibold text-emerald-600">
                  {totals.closing_done ? `${p.sold} vendus • ${p.unsold} invendus` : 'En tournée'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- TAB: WALLET (Sacoche Caisse) ---
  if (activeTab === 'wallet') {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sacoche Caisse</span>
            <Wallet className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-black text-3xl tracking-tight tabular-nums">
            {formatFCFA(totals.total_employee_revenue)}
          </p>
          <p className="mt-1 text-xs text-slate-300">Espèces théoriques à reverser au retour</p>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
            <div>
              <p className="text-slate-400">Marchandise vendue</p>
              <p className="font-extrabold text-sm text-white">{formatNumber(totals.total_sold)} articles</p>
            </div>
            <div>
              <p className="text-slate-400">Invendus retournés</p>
              <p className="font-extrabold text-sm text-amber-300">{formatNumber(totals.total_unsold)} articles</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: CLIENTS (Boutiques Clientes) ---
  if (activeTab === 'clients') {
    return (
      <div className="card-elevated rounded-3xl p-5 sm:p-6 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-xl text-slate-950">Boutiques Livrées</h2>
            <p className="text-xs text-slate-500">Carnet d'adresses et contacts de la tournée</p>
          </div>
          <Store className="h-5 w-5 text-slate-400" />
        </div>

        <div className="space-y-3">
          {clients.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
            >
              <div>
                <p className="font-bold text-sm text-slate-950">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {c.location} • Tél : {c.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${c.phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-2xs ring-1 ring-slate-200/70 hover:bg-slate-100 transition"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => openWhatsApp(`Bonjour ${c.name}, je suis en route pour la livraison.`, c.phone)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- TAB: SETTINGS (Profil Livreur complet, sans lien vers Gérant) ---
  return (
    <SettingsView
      accountRole="driver"
      user={user}
      products={products}
      allSheets={allSheets}
      syncing={syncing}
      onSyncNow={onSyncNow}
      onOpenAuth={onOpenAuth}
      onLogout={onLogout}
      onImportBackup={onImportBackup}
      onNotify={onNotify}
    />
  )
}
