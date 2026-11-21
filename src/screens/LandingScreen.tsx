import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  LayoutDashboard,
  Lock,
  Package,
  Receipt,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Wallet,
  WifiOff,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

interface LandingScreenProps {
  onStartApp: () => void
  onOpenAdmin: () => void
  onOpenDriver: () => void
  onOpenAuth: () => void
}

const FAQ_ITEMS = [
  {
    q: "L'application fonctionne-t-elle vraiment sans connexion Internet ?",
    a: "Oui. VendorTracker utilise une base locale IndexedDB (PWA). Vos livreurs peuvent enregistrer les réceptions du matin et les invendus en zone blanche ; tout se synchronise automatiquement sur Cloudflare D1 dès que le réseau revient.",
  },
  {
    q: 'Comment sont calculés les invendus et la recette caisse ?',
    a: "À la clôture du soir, le vendeur saisit uniquement les quantités invendues. VendorTracker déduit automatiquement les invendus repris par le fournisseur, calcule le nombre exact vendu, la recette caisse à verser, le dû fournisseur et votre bénéfice net.",
  },
  {
    q: 'Un employé peut-il voir mes marges ou modifier les prix ?',
    a: "Non. Le mode Livreur n'affiche que les quantités, le stock véhicule et la recette à verser. L'accès au mode Gérant (prix d'achat, bénéfices nets, catalogue, historique complet) est verrouillé par un code PIN à 4 chiffres.",
  },
  {
    q: 'Puis-je superviser plusieurs livreurs ou boutiques en même temps ?',
    a: "Oui, grâce au Dashboard Super Admin inclus. Vous visualisez en temps réel le chiffre d'affaires consolidé, le taux de clôture de chaque vendeur et l'évolution sur 7 jours depuis votre ordinateur ou téléphone.",
  },
]

export function LandingScreen({ onStartApp, onOpenAdmin, onOpenDriver, onOpenAuth }: LandingScreenProps) {
  const [previewTab, setPreviewTab] = useState<'manager' | 'driver' | 'admin'>('manager')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Floating Glass Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-emerald-400 shadow-sm ring-1 ring-slate-900/10">
              <Truck className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="block font-black text-lg tracking-tight text-slate-950 leading-none">
                Vendor<span className="text-emerald-600">Tracker</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Distribution OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-950 transition">
              Fonctionnalités
            </a>
            <a href="#workflow" className="hover:text-slate-950 transition">
              Fonctionnement
            </a>
            <a href="#pricing" className="hover:text-slate-950 transition">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-slate-950 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Super Admin
            </button>
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={onStartApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-slate-950/15 hover:bg-emerald-600 transition active:scale-95"
            >
              <span>Ouvrir l'App</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-grid-slate px-4 pt-14 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        {/* Ambient lighting */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-1.5 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Plateforme SaaS de suivi terrain, invendus & caisse</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
              v2.0 Desktop & Mobile
            </span>
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl font-black text-4xl sm:text-5xl lg:text-[3.75rem] tracking-[-0.03em] text-slate-950 leading-[1.06]">
            Pilotez vos <span className="text-emerald-600">livraisons</span>, invendus et{' '}
            <span className="underline decoration-emerald-400/60 decoration-4 underline-offset-4">
              caisses vendeurs
            </span>{' '}
            au franc près.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            L'outil professionnel pensé pour les dépôts, boulangeries et équipes de distribution.
            Saisie rapide sur mobile hors-ligne, clôture du soir en 30 secondes et supervision grand écran en temps réel.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onStartApp}
              className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-slate-950 px-7 py-4 text-sm sm:text-base font-extrabold text-white shadow-xl shadow-slate-950/20 hover:bg-emerald-600 transition active:scale-95"
            >
              <Store className="h-5 w-5 text-emerald-400 group-hover:text-white transition" />
              <span>Lancer l'Espace Gérant</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={onOpenDriver}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm sm:text-base font-bold text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition active:scale-95"
            >
              <Truck className="h-5 w-5 text-emerald-600" />
              <span>Mode Livreur Terrain</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-6 py-4 text-sm sm:text-base font-bold text-emerald-900 hover:bg-emerald-100/70 transition active:scale-95"
            >
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* Interactive Workspace Showcase */}
          <div className="mt-14">
            {/* Switcher Tabs */}
            <div className="inline-flex rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-sm backdrop-blur-md mb-5">
              {(
                [
                  { id: 'manager', label: 'Vue Gérant Desktop', icon: LayoutDashboard },
                  { id: 'driver', label: 'Tournée Livreur', icon: Truck },
                  { id: 'admin', label: 'Supervision Admin', icon: ShieldCheck },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPreviewTab(id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    previewTab === id
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Realistic Browser Window Frame */}
            <div className="relative mx-auto max-w-5xl rounded-3xl border border-slate-200/90 bg-slate-950 p-2 sm:p-3 shadow-[0_32px_80px_-20px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10">
              {/* Window Top Chrome */}
              <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="rounded-lg bg-slate-900 px-4 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-white/10">
                  vendor-tracker.elsonkjimmy.workers.dev
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synchronisé
                </div>
              </div>

              {/* Inner App Mockup */}
              <div className="overflow-hidden rounded-2xl bg-[#f8fafc] text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
                  {/* Mock Sidebar */}
                  <div className="hidden lg:flex lg:col-span-3 flex-col justify-between bg-[#0b1120] p-4 text-slate-300">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 px-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
                          <Truck className="h-4 w-4" />
                        </div>
                        <span className="font-black text-sm text-white">VendorTracker</span>
                      </div>
                      <div className="space-y-1 text-xs font-semibold">
                        <div
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${
                            previewTab === 'manager' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          <LayoutDashboard className="h-4 w-4" /> Aujourd'hui
                        </div>
                        <div
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${
                            previewTab === 'driver' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          <Truck className="h-4 w-4" /> Ma Tournée
                        </div>
                        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-400">
                          <BarChart3 className="h-4 w-4" /> Bilans & Gains
                        </div>
                        <div
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${
                            previewTab === 'admin' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          <ShieldCheck className="h-4 w-4" /> Super Admin
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                      <p className="text-[11px] font-bold text-white">Dépôt Principal</p>
                      <p className="text-[10px] text-emerald-400">Cloudflare D1 • Actif</p>
                    </div>
                  </div>

                  {/* Mock Main Content */}
                  <div className="lg:col-span-9 p-5 sm:p-6 space-y-5">
                    {previewTab === 'manager' && (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Point Journalier • Clôturé
                            </p>
                            <h3 className="font-black text-xl text-slate-950">Tableau de bord Gérant</h3>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Caisse vérifiée
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Recette Caisse</p>
                            <p className="mt-1 font-black text-lg text-slate-950 tabular-nums">124 500 F</p>
                            <p className="text-[10px] font-semibold text-emerald-600">+12% vs hier</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Bénéfice Net</p>
                            <p className="mt-1 font-black text-lg text-emerald-600 tabular-nums">+19 850 F</p>
                            <p className="text-[10px] font-semibold text-slate-400">Marge 15.9%</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Vendus</p>
                            <p className="mt-1 font-black text-lg text-slate-950 tabular-nums">1 365 pcs</p>
                            <p className="text-[10px] font-semibold text-slate-400">sur 1 450 reçus</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Invendus</p>
                            <p className="mt-1 font-black text-lg text-amber-600 tabular-nums">85 pcs</p>
                            <p className="text-[10px] font-semibold text-amber-600">5.8% repris</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
                          <div className="grid grid-cols-5 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase text-slate-400">
                            <span className="col-span-2">Produit</span>
                            <span className="text-center">Vendu / Reçu</span>
                            <span className="text-right">Recette</span>
                            <span className="text-right">Bénéfice</span>
                          </div>
                          {[
                            ['Pain 100 F', '680 / 720', '68 000 F', '+10 200 F'],
                            ['Pain 125 F', '340 / 360', '42 500 F', '+5 100 F'],
                            ['Boule 50 F', '280 / 300', '14 000 F', '+1 400 F'],
                          ].map(([name, ratio, rev, prof]) => (
                            <div
                              key={name}
                              className="grid grid-cols-5 items-center border-t border-slate-100 px-4 py-2.5 text-xs"
                            >
                              <span className="col-span-2 font-bold text-slate-900">{name}</span>
                              <span className="text-center font-semibold text-slate-600 tabular-nums">{ratio}</span>
                              <span className="text-right font-bold text-slate-900 tabular-nums">{rev}</span>
                              <span className="text-right font-bold text-emerald-600 tabular-nums">{prof}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {previewTab === 'driver' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-5 text-white shadow-lg">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            Sacoche Livreur • En direct
                          </span>
                          <p className="mt-2 font-black text-3xl tabular-nums">124 500 F</p>
                          <p className="text-xs text-slate-300 mt-1">Espèces à verser à la clôture</p>
                          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-xl bg-white/10 p-2.5">
                              <p className="text-slate-300 text-[10px]">Chargé matin</p>
                              <p className="font-bold">1 450 pcs</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-2.5">
                              <p className="text-amber-300 text-[10px]">Invendus repris</p>
                              <p className="font-bold">85 pcs</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-emerald-600" />
                              Ticket WhatsApp Certifié
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Image HD générée automatiquement avec détail des livraisons, invendus et caisse.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                              <WifiOff className="h-4 w-4 text-amber-600" />
                              Zéro coupure sur la route
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Enregistrement instantané hors-ligne avec synchronisation automatique.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewTab === 'admin' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase text-purple-600">Supervision Réseau</p>
                            <h3 className="font-black text-xl text-slate-950">12 Vendeurs & Dépôts Actifs</h3>
                          </div>
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                            94% taux de clôture
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400">CA Consolidé</p>
                            <p className="mt-1 font-black text-lg text-slate-950">2 840 000 F</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Articles Vendus</p>
                            <p className="mt-1 font-black text-lg text-emerald-600">28 450 pcs</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Actifs (7j)</p>
                            <p className="mt-1 font-black text-lg text-purple-700">11 / 12</p>
                          </div>
                        </div>
                        <div className="flex h-28 items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                          {[45, 62, 58, 78, 84, 72, 95].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                              <div
                                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400"
                                style={{ height: `${h}%` }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-y border-slate-200/80 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="font-black text-3xl text-slate-950 tabular-nums">100%</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Opérationnel hors-ligne (PWA)</p>
          </div>
          <div>
            <p className="font-black text-3xl text-emerald-600 tabular-nums">&lt; 30s</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Pour clôturer la caisse du soir</p>
          </div>
          <div>
            <p className="font-black text-3xl text-slate-950 tabular-nums">0 F</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">D'erreur de calcul d'invendus</p>
          </div>
          <div>
            <p className="font-black text-3xl text-slate-950 tabular-nums">Cloud D1</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Sauvegarde temps réel Cloudflare</p>
          </div>
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-600">
              <Sparkles className="h-3.5 w-3.5" /> Fonctionnalités conçues pour le réel
            </span>
            <h2 className="mt-3 font-black text-3xl sm:text-4xl tracking-tight text-slate-950">
              Fini les cahiers perdus et les écarts de caisse inexpliqués.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-6 gap-5">
            {/* Large Bento Card 1 */}
            <div className="md:col-span-4 card-elevated rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-black text-xl text-slate-950">
                  Moteur de calcul automatique des invendus & marges
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-xl">
                  Distinction automatique entre produits repris par le fournisseur et non-repris. Calcul instantané de la
                  recette caisse attendue, du dû fournisseur, des marges directes et des ristournes.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Invendus déduits', 'Dû fournisseur exact', 'Marges & Ristournes', 'Export CSV'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="md:col-span-2 rounded-3xl bg-slate-950 p-7 text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-400">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-black text-xl">Double Profil & Code PIN</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Vos vendeurs saisissent les livraisons en mode terrain, tandis que vos marges et prix d'achat restent
                  protégés par un code PIN à 4 chiffres.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-400">
                <KeyRound className="h-4 w-4" />
                <span>Sécurité Gérant intégrée</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="md:col-span-2 card-elevated rounded-3xl p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-600/15">
                <WifiOff className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-950">Offline-First & PWA</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Installable sur Android, iPhone et ordinateur. Travaillez sans connexion au marché ou en tournée, la
                synchro cloud suit automatiquement.
              </p>
            </div>

            {/* Bento Card 4 */}
            <div className="md:col-span-2 card-elevated rounded-3xl p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-600/15">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-950">Reçu Image HD WhatsApp</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Un clic génère un bilan visuel propre et lisible, prêt à être envoyé au patron ou au fournisseur sur
                WhatsApp.
              </p>
            </div>

            {/* Bento Card 5 */}
            <div className="md:col-span-2 card-elevated rounded-3xl p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 ring-1 ring-purple-600/15">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-slate-950">Super Admin Multi-Dépôts</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Pilotez toute votre flotte de vendeurs depuis un écran unique : chiffre d'affaires, activité 7j et taux
                de clôture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section id="workflow" className="border-y border-slate-200/80 bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
              Simple comme bonjour
            </span>
            <h2 className="mt-2 font-black text-3xl sm:text-4xl tracking-tight text-slate-950">
              Votre journée maîtrisée en 3 temps
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Matin : Réception & Chargement',
                desc: 'Saisissez en 10 secondes les quantités reçues du fournisseur ou chargées dans le véhicule. Ajoutez des réassorts à tout moment.',
                icon: Package,
              },
              {
                step: '02',
                title: 'Journée : Tournée & Boutiques',
                desc: 'Suivez votre stock en temps réel, contactez vos boutiques clientes en 1 clic et surveillez votre sacoche.',
                icon: Truck,
              },
              {
                step: '03',
                title: 'Soir : Invendus & Clôture WhatsApp',
                desc: 'Indiquez simplement les invendus restants. VendorTracker calcule la caisse exacte et génère votre reçu photo certifié.',
                icon: Wallet,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative rounded-3xl border border-slate-200/80 bg-[#f8fafc] p-7">
                <div className="flex items-center justify-between">
                  <span className="font-black text-3xl text-emerald-600/25">{step}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <h3 className="mt-5 font-black text-lg text-slate-950">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Tarification</span>
            <h2 className="mt-2 font-black text-3xl sm:text-4xl tracking-tight text-slate-950">
              Des offres adaptées à chaque taille d'activité
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Free Tier */}
            <div className="card-elevated rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-950">Indépendant</h3>
                <p className="mt-1 text-xs text-slate-500">Pour démarrer seul sur 1 appareil</p>
                <p className="mt-6 font-black text-4xl text-slate-950">
                  0 F <span className="text-sm font-semibold text-slate-400">/ mois</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  {[
                    'Mode Livreur & Gérant (Code PIN)',
                    'Fonctionnement 100% hors-ligne',
                    'Reçus WhatsApp texte & image HD',
                    'Catalogue produits illimité',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={onStartApp}
                className="mt-8 w-full rounded-2xl border border-slate-300 bg-white py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
              >
                Commencer gratuitement
              </button>
            </div>

            {/* Pro Tier */}
            <div className="relative rounded-3xl bg-slate-950 p-8 text-white shadow-2xl ring-2 ring-emerald-500 flex flex-col justify-between">
              <span className="absolute -top-3.5 right-6 rounded-full bg-emerald-500 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950">
                Le plus populaire
              </span>
              <div>
                <h3 className="font-bold text-lg text-white">Boutique & Dépôt Pro</h3>
                <p className="mt-1 text-xs text-slate-400">Synchronisation cloud & sauvegardes</p>
                <p className="mt-6 font-black text-4xl text-white">
                  5 000 F <span className="text-sm font-semibold text-slate-400">/ mois</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {[
                    'Tout le plan Indépendant',
                    'Synchronisation Cloud Cloudflare D1',
                    'Accès multi-appareils (Desktop + Mobile)',
                    'Exports CSV & Bilans mensuels avancés',
                    'Support prioritaire WhatsApp',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="mt-8 w-full rounded-2xl bg-emerald-500 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-emerald-400 transition"
              >
                Créer mon compte Pro
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="card-elevated rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-950">Réseau & Flotte</h3>
                <p className="mt-1 text-xs text-slate-500">Supervision de plusieurs vendeurs</p>
                <p className="mt-6 font-black text-4xl text-slate-950">
                  Sur mesure
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  {[
                    'Dashboard Super Admin complet',
                    'Vendeurs & points de vente illimités',
                    'Tendances 7j/30j & classement performance',
                    'Accompagnement déploiement terrain',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="mt-8 w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition"
              >
                Explorer le Super Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-slate-200/80 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Questions fréquentes</span>
            <h2 className="mt-2 font-black text-3xl text-slate-950">Tout savoir avant de démarrer</h2>
          </div>

          <div className="mt-10 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left font-bold text-sm text-slate-900"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final Dark CTA Banner */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-black text-3xl sm:text-4xl tracking-tight">
              Prêt à sécuriser vos recettes dès aujourd'hui ?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300">
              Essayez VendorTracker immédiatement en mode local ou créez votre compte synchronisé en moins d'une minute.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={onStartApp}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-7 py-4 text-sm font-extrabold text-slate-950 hover:bg-emerald-400 transition"
              >
                <Zap className="h-4 w-4" />
                <span>Ouvrir l'application maintenant</span>
              </button>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-7 py-4 text-sm font-bold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Voir le Dashboard Super Admin</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Multi-Column Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-emerald-400">
                <Truck className="h-4 w-4" />
              </div>
              <span className="font-black text-base text-slate-950">
                Vendor<span className="text-emerald-600">Tracker</span>
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 max-w-xs">
              Suivi professionnel des livraisons, invendus et recettes de caisse pour les commerces de distribution.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-600">
            <button type="button" onClick={onOpenDriver} className="hover:text-emerald-600 transition">
              Mode Livreur
            </button>
            <button type="button" onClick={onStartApp} className="hover:text-emerald-600 transition">
              Mode Gérant
            </button>
            <button type="button" onClick={onOpenAdmin} className="hover:text-emerald-600 transition">
              Super Admin
            </button>
            <button type="button" onClick={onOpenAuth} className="hover:text-emerald-600 transition">
              Connexion Cloud
            </button>
          </div>
          <p className="text-xs text-slate-400">© 2026 VendorTracker • Propulsé par Cloudflare Workers & D1</p>
        </div>
      </footer>
    </div>
  )
}
