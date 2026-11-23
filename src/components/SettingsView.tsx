import {
  CalendarCheck,
  CheckCircle2,
  Cloud,
  CloudOff,
  Download,
  HardDrive,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  Store,
  Truck,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { formatDate } from '../lib/format'
import type { DailySheet, Product, VendorUser } from '../types'

interface SettingsViewProps {
  accountRole: 'vendor' | 'driver'
  user: VendorUser | null
  products: Product[]
  allSheets: DailySheet[]
  syncing: boolean
  onSyncNow: () => void
  onChangePin?: (newPin: string) => Promise<void>
  onOpenAuth: () => void
  onLogout: () => void
  onImportBackup: (data: { products?: Product[]; sheets?: DailySheet[] }) => Promise<void>
  onNotify: (tone: 'success' | 'error' | 'info', title: string, detail?: string) => void
}

export function SettingsView({
  accountRole,
  user,
  products,
  allSheets,
  syncing,
  onSyncNow,
  onChangePin,
  onOpenAuth,
  onLogout,
  onImportBackup,
  onNotify,
}: SettingsViewProps) {
  const [pinInput, setPinInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const closedCount = allSheets.filter((s) => s.closing_done).length
  const isDriver = accountRole === 'driver'

  const handleExportJson = () => {
    const payload = {
      app: 'VendorTracker',
      exported_at: new Date().toISOString(),
      account_role: accountRole,
      products,
      sheets: allSheets,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendortracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    onNotify('success', 'Sauvegarde JSON exportée', 'Votre fichier de sauvegarde a été téléchargé.')
  }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { products?: Product[]; sheets?: DailySheet[] }
      await onImportBackup(parsed)
      onNotify('success', 'Sauvegarde restaurée', 'Vos produits et journées ont été importés.')
    } catch {
      onNotify('error', 'Fichier invalide', 'Impossible de lire ce fichier de sauvegarde JSON.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="font-black text-2xl tracking-tight text-slate-950">Mon Profil & Réglages</h2>
        <p className="text-xs font-medium text-slate-500">
          Identité du compte, synchronisation Cloud Cloudflare et sécurité
        </p>
      </div>

      {/* Profile Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-7 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
              {(user?.name || (isDriver ? 'LV' : 'VD')).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-xl tracking-tight">
                  {user?.name || (isDriver ? 'Compte Livreur Local' : 'Compte Vendeur Local')}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  {isDriver ? <Truck className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                  {isDriver ? 'Livreur' : 'Vendeur / Boutique'}
                </span>
                {user?.is_admin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/25 px-2.5 py-0.5 text-[10px] font-bold text-purple-200">
                    <ShieldCheck className="h-3 w-3" />
                    Super Admin
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  {user?.phone || 'Non connecté'}
                </span>
                {user?.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-400" />
                    {user.email}
                  </span>
                )}
                {user?.created_at && (
                  <span className="text-slate-400">Membre depuis le {formatDate(user.created_at.slice(0, 10))}</span>
                )}
              </div>
            </div>
          </div>

          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-rose-300 ring-1 ring-white/15 hover:bg-rose-500/20 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Se connecter / S'inscrire</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Produits</span>
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 font-black text-2xl text-slate-950 tabular-nums">{products.length}</p>
          <p className="text-[11px] text-slate-500">Au catalogue</p>
        </div>

        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Journées</span>
            <CalendarCheck className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-1.5 font-black text-2xl text-slate-950 tabular-nums">{allSheets.length}</p>
          <p className="text-[11px] font-semibold text-emerald-600">{closedCount} clôturée(s)</p>
        </div>

        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Hors-ligne</span>
            <HardDrive className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-1.5 font-black text-lg text-slate-950 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> IndexedDB
          </p>
          <p className="text-[11px] text-slate-500">Stockage local actif</p>
        </div>

        <div className="card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Cloud D1</span>
            {user ? <Cloud className="h-4 w-4 text-emerald-600" /> : <CloudOff className="h-4 w-4 text-slate-400" />}
          </div>
          <p className="mt-1.5 font-black text-lg text-slate-950">{user ? 'Connecté' : 'Local'}</p>
          <p className="text-[11px] text-slate-500">{user ? 'Cloudflare Workers' : 'Non synchronisé'}</p>
        </div>
      </div>

      {/* Two-Column Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cloud Sync & JSON Backup */}
        <div className="card-elevated rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="font-black text-base text-slate-950">Synchronisation & Sauvegarde</h3>
            <p className="text-xs text-slate-500">
              Synchronisez avec Cloudflare D1 ou créez une copie de secours JSON sur votre appareil.
            </p>
          </div>

          <button
            type="button"
            onClick={user ? onSyncNow : onOpenAuth}
            disabled={syncing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-xs font-extrabold text-white hover:bg-emerald-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>
              {syncing
                ? 'Synchronisation en cours...'
                : user
                  ? 'Synchroniser maintenant'
                  : 'Connecter mon compte Cloud'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-800 hover:bg-white transition"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              <span>Sauvegarde JSON</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-800 hover:bg-white transition"
            >
              <Upload className="h-4 w-4 text-sky-600" />
              <span>Restaurer JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={(e) => void handleFileImport(e)}
              className="hidden"
            />
          </div>
        </div>

        {/* Security / PIN Card */}
        {!isDriver && onChangePin ? (
          <div className="card-elevated rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-950">Code PIN de Sécurité</h3>
                <p className="text-xs text-slate-500">Protège vos marges et paramètres (défaut : 0000)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="password"
                maxLength={4}
                placeholder="Nouveau PIN (4 chiffres)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold tracking-widest text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
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
                className="shrink-0 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white hover:bg-emerald-600 transition"
              >
                Modifier
              </button>
            </div>
          </div>
        ) : (
          <div className="card-elevated rounded-3xl p-6 space-y-3">
            <h3 className="font-black text-base text-slate-950">Espace Livreur Isolé</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Votre compte Livreur est entièrement dédié à vos tournées, votre stock véhicule, votre sacoche et vos
              boutiques clientes. Vos données sont stockées en local et synchronisées sur votre compte personnel.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
