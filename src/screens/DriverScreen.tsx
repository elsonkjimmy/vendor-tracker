import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Package,
  Phone,
  PlusCircle,
  Receipt,
  RotateCcw,
  Share2,
  Store,
  Truck,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { GainHero } from '../components/GainHero'
import { formatFCFA, formatNumber } from '../lib/format'
import { generateReceiptCanvasBlob, generateWhatsAppMessage, openWhatsApp } from '../lib/share'
import type { ClientBoutique, DailySheet, DayTotals, Product } from '../types'

interface DriverScreenProps {
  activeTab: string
  totals: DayTotals
  todaySheet: DailySheet
  products: Product[]
  clients: ClientBoutique[]
  onOpenNewDelivery: () => void
  onOpenClosing: () => void
  onSwitchToManager: () => void
}

export function DriverScreen({
  activeTab,
  totals,
  todaySheet,
  products,
  clients,
  onOpenNewDelivery,
  onOpenClosing,
  onSwitchToManager,
}: DriverScreenProps) {
  const [sharing, setSharing] = useState(false)

  const handleShareWhatsAppText = () => {
    const msg = generateWhatsAppMessage(totals, 'Livreur Tournée')
    openWhatsApp(msg)
  }

  const handleShareWhatsAppImage = async () => {
    setSharing(true)
    try {
      const blob = await generateReceiptCanvasBlob(totals, 'Livreur Tournée')
      const file = new File([blob], `bilan-${totals.date}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Bilan Tournée ${totals.date}`,
          text: `Recette Caisse : ${formatFCFA(totals.total_employee_revenue)}`,
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bilan-${totals.date}.png`
        a.click()
        URL.revokeObjectURL(url)
        alert('Image du reçu téléchargée ! Vous pouvez la partager sur WhatsApp.')
      }
    } catch (e) {
      handleShareWhatsAppText()
    } finally {
      setSharing(false)
    }
  }

  // --- TAB: TOUR (Ma Tournée) ---
  if (activeTab === 'tour') {
    return (
      <div className="space-y-6">
        <GainHero
          totals={totals}
          onSwitchMode={onSwitchToManager}
          bottomAction={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShareWhatsAppText}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition active:scale-95"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          }
        />

        {/* Quick Driver Action Bar */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onOpenNewDelivery}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-4 font-extrabold text-white shadow-lg shadow-emerald-600/20 active:scale-95 hover:bg-emerald-700 transition"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Réception Matin</span>
          </button>

          <button
            type="button"
            onClick={onOpenClosing}
            className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 p-4 font-extrabold text-white shadow-md active:scale-95 hover:bg-zinc-800 transition"
          >
            <RotateCcw className="h-5 w-5 text-amber-300" />
            <span>Clôturer / Invendus</span>
          </button>
        </div>

        {/* Deliveries Feed of the day */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-zinc-900">Chargements & Réceptions du Jour</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {todaySheet.deliveries.length} lot(s)
            </span>
          </div>

          {todaySheet.deliveries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center text-zinc-400">
              <Package className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
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
                <div key={batch.id} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5">
                  <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2 mb-2">
                    <span className="font-bold text-xs text-zinc-800">
                      Lot #{idx + 1} {batch.supplier_name ? `• ${batch.supplier_name}` : ''}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-400">
                      {new Date(batch.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {batch.items.map((item) => (
                      <span
                        key={item.product_id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-zinc-800 shadow-2xs"
                      >
                        <span>{item.product_name}:</span>
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
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-sm text-zinc-900">Bilan Photo Certifié</p>
              <p className="text-xs text-zinc-500">Envoyez l'image du point journalier au dépôt</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleShareWhatsAppImage}
            disabled={sharing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-xs font-extrabold text-white shadow-md hover:bg-emerald-800 transition active:scale-95 disabled:opacity-50"
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
      <div className="space-y-5">
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-xl text-zinc-900">Stock dans le Véhicule</h2>
              <p className="text-xs text-zinc-500">Quantités chargées vs invendus restants</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            {totals.products.map((p) => (
              <div
                key={p.product_id}
                className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5"
              >
                <div>
                  <p className="font-bold text-sm text-zinc-900">{p.product_name}</p>
                  <p className="text-xs text-zinc-500">Prix : {formatFCFA(p.selling_price)}/u</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-zinc-900 tabular-nums">
                    {p.delivered - p.unsold} <span className="text-xs font-normal text-zinc-400">/ {p.delivered} pcs</span>
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600">
                    {totals.closing_done ? `${p.sold} vendus • ${p.unsold} invendus` : 'En tournée'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: WALLET (Sacoche Caisse) ---
  if (activeTab === 'wallet') {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sacoche Caisse</span>
            <Wallet className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-black text-3xl tracking-tight tabular-nums">
            {formatFCFA(totals.total_employee_revenue)}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Espèces théoriques à reverser au retour</p>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-700/60 pt-4 text-xs">
            <div>
              <p className="text-zinc-400">Marchandise vendue</p>
              <p className="font-extrabold text-sm text-white">{formatNumber(totals.total_sold)} articles</p>
            </div>
            <div>
              <p className="text-zinc-400">Invendus retournés</p>
              <p className="font-extrabold text-sm text-amber-300">{formatNumber(totals.total_unsold)} articles</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <h3 className="font-bold text-sm text-zinc-900 mb-3">Répartition Théorique de la Recette</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center rounded-xl bg-zinc-50 p-3">
              <span className="text-zinc-600">Dû Fournisseur (prix de revient) :</span>
              <span className="font-extrabold text-zinc-900">{formatFCFA(totals.total_supplier_due)}</span>
            </div>
            <div className="flex justify-between items-center rounded-xl bg-emerald-50 p-3">
              <span className="font-bold text-emerald-900">Bénéfice Net :</span>
              <span className="font-black text-sm text-emerald-700">+{formatFCFA(totals.total_net_profit)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: CLIENTS (Boutiques Clientes) ---
  if (activeTab === 'clients') {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-xl text-zinc-900">Boutiques Livrées</h2>
              <p className="text-xs text-zinc-500">Carnet d'adresses et contacts de la tournée</p>
            </div>
            <Store className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="space-y-3">
            {clients.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5"
              >
                <div>
                  <p className="font-bold text-sm text-zinc-900">{c.name}</p>
                  <p className="text-xs text-zinc-500">{c.location} • Tél: {c.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${c.phone}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-700 shadow-2xs hover:bg-zinc-100 transition"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => openWhatsApp(`Bonjour ${c.name}, je suis en route pour la livraison.`, c.phone)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs hover:bg-emerald-200 transition"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- TAB: SETTINGS (Réglages) ---
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-5">
      <div>
        <h2 className="font-black text-xl text-zinc-900">Espace Livreur</h2>
        <p className="text-xs text-zinc-500">Options du terminal et bascule vers l'administration</p>
      </div>

      <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 space-y-3">
        <p className="font-bold text-xs text-zinc-800">Accès Gérant Sécurisé</p>
        <p className="text-xs text-zinc-500">
          Pour modifier les prix de vente, consulter les bilans globaux ou modifier le catalogue, basculez en mode Gérant.
        </p>
        <button
          type="button"
          onClick={onSwitchToManager}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 font-bold text-xs text-white hover:bg-zinc-800 transition"
        >
          <Store className="h-4 w-4 text-teal-400" />
          <span>Déverrouiller le Mode Gérant (Code PIN)</span>
        </button>
      </div>
    </div>
  )
}
