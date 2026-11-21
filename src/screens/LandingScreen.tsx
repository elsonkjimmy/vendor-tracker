import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Lock,
  Receipt,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  WifiOff,
} from 'lucide-react'

interface LandingScreenProps {
  onStartApp: () => void
  onOpenAdmin: () => void
  onOpenDriver: () => void
}

export function LandingScreen({ onStartApp, onOpenAdmin, onOpenDriver }: LandingScreenProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
              <Truck className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-zinc-900">
                Vendor<span className="text-emerald-600">Tracker</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition"
            >
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              Espace Admin
            </button>
            <button
              type="button"
              onClick={onStartApp}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
            >
              <span>Ouvrir l'App</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-12 pb-20 sm:px-6 lg:pt-20 lg:pb-28">
        <div className="pointer-events-none absolute -top-40 right-1/2 h-96 w-96 translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-20 h-80 w-80 rounded-full bg-teal-400/15 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Le SaaS tout-en-un pour le commerce de distribution</span>
          </div>

          <h1 className="mt-6 font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-zinc-950 leading-[1.12]">
            Gérez vos <span className="text-emerald-600">livraisons</span>, invendus et{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              recettes de caisse
            </span>{' '}
            sans calculatrice.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-600 font-medium leading-relaxed">
            Spécialement pensé pour les livreurs en tournée, dépôts de pain et points de vente.
            Enregistrez les chargements du matin, les invendus du soir, et obtenez instantanément
            le montant exact de la caisse à verser.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenDriver}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-extrabold text-white shadow-xl shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95"
            >
              <Truck className="h-5 w-5" />
              <span>Accéder à ma Caisse Livreur</span>
            </button>
            <button
              type="button"
              onClick={onStartApp}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-base font-bold text-zinc-800 shadow-xs transition hover:bg-zinc-50 active:scale-95"
            >
              <Store className="h-5 w-5 text-teal-600" />
              <span>Mode Gérant & Stocks</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-zinc-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Fonctionne 100% hors-ligne</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Zéro perte d'argent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Export WhatsApp automatique</span>
            </div>
          </div>
        </div>

        {/* Visual App Preview Banner */}
        <div className="mx-auto mt-14 max-w-5xl rounded-3xl border border-zinc-200/90 bg-white p-3 sm:p-5 shadow-2xl ring-1 ring-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Mockup Card */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Point du Jour</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">Livreur</span>
              </div>
              <p className="mt-3 text-2xl font-black">124 500 F</p>
              <p className="text-xs text-emerald-100 font-medium">Recette Caisse à Verser</p>
              <div className="mt-4 space-y-2 rounded-xl bg-black/20 p-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Reçu le matin :</span>
                  <span className="font-bold">1 450 pcs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Invendus retournés :</span>
                  <span className="font-bold text-amber-300">85 pcs</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1">
                  <span className="text-white/70">Vendus effectifs :</span>
                  <span className="font-bold text-emerald-300">1 365 pcs</span>
                </div>
              </div>
            </div>

            {/* Middle Mockup Card */}
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span>Ticket WhatsApp Clôture</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Génération en 1 clic d'une image certifiée envoyée au patron avec la recette, les invendus et les signatures.
              </p>
              <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white p-3 text-center text-xs text-zinc-400">
                📸 Image Canvas HD prête pour WhatsApp
              </div>
            </div>

            {/* Right Mockup Card */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-5">
              <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <span>Dashboard Super Admin</span>
              </div>
              <p className="mt-2 text-xs text-purple-900/70">
                Supervision centralisée : comparez les performances de chaque livreur et magasin en direct.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-3 shadow-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400">Points Actifs</p>
                  <p className="text-lg font-black text-purple-950">12 boutiques</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                >
                  Voir
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="border-t border-zinc-200/80 bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Fonctionnalités clés</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              Tout ce dont vous avez besoin pour sécuriser votre activité
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-zinc-200/70 bg-[#fafafa] p-7 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-zinc-900">Mode Tournée & Sacoche</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Suivez en continu les livraisons aux boutiques clientes, les dépôts d'espèces et le stock restant dans le camion.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-[#fafafa] p-7 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-zinc-900">Déduction Intelligente des Invendus</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Les invendus retournés au fournisseur ou périmés sont automatiquement soustraits de la caisse attendue.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-[#fafafa] p-7 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <WifiOff className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-zinc-900">Mode 100% Hors-Ligne</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Pas de réseau sur la route ? L'application stocke tout en local et synchronise silencieusement dès la reconnexion.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-[#fafafa] p-7 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-zinc-900">Protection par Code PIN</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Verrouillez l'accès aux marges, aux prix de revient et à la gestion du catalogue par un code PIN à 4 chiffres.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-[#fafafa] p-7 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-zinc-900">Rapports Visuels WhatsApp</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Exportez un ticket professionnel illustré en un seul clic directement dans la discussion WhatsApp de votre gérant.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-[#fafafa] p-7 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-bold text-lg text-zinc-900">Super Admin Multi-Comptes</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Pour les propriétaires de dépôts : suivez en direct l'activité de tous vos livreurs et leurs taux de clôture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
          <p>© 2026 VendorTracker. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={onOpenAdmin} className="hover:text-zinc-900 transition">
              Espace Super Admin
            </button>
            <span>•</span>
            <button type="button" onClick={onStartApp} className="hover:text-zinc-900 transition">
              Accès Application
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
