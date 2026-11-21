# VendorTracker 🚚📊

Application SaaS de gestion de tournées, livraisons, invendus et recette caisse pour livreurs, dépôts et commerces.

## ✨ Fonctionnalités Principales

- **Mode Grand Écran & Mobile First** : Barre latérale desktop rétractable et barre de navigation mobile optimisée.
- **Page de Présentation SaaS (Landing Page)** : Découverte des fonctionnalités, propositions de valeur et accès directs.
- **Mode Livreur (Terrain / Tournée)** :
  - Saisie des réceptions du matin et réassorts en journée.
  - Saisie des invendus du soir avec déduction automatique.
  - Calcul instantané de la **Recette Caisse à verser**.
  - Génération de reçus imagés certifiés et partage en 1 clic sur WhatsApp.
  - Suivi des clients et boutiques de la tournée.
- **Mode Gérant (Protégé par Code PIN)** :
  - Consultation détaillée des marges directes et ristournes fournisseurs.
  - Historique complet et bilans mensuels consolidés.
  - Gestion du catalogue de produits (prix d'achat, prix de vente, ristournes).
  - Code PIN personnalisable à 4 chiffres.
- **Dashboard Super Admin** :
  - KPIs consolidés : Chiffre d'affaires total, vendeurs actifs, articles vendus, taux de clôture.
  - Graphique d'évolution des recettes sur 7 jours.
  - Répertoire complet des vendeurs et dépôts avec fiches récentes et recherche dynamique.
- **Architecture Offline-First & Cloudflare Workers** :
  - Fonctionnement 100% hors-ligne avec IndexedDB.
  - Backend Cloudflare Worker + base D1 (`vendor-tracker`).

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite 8, PWA (vite-plugin-pwa), IndexedDB (`idb`).
- **Backend** : Cloudflare Workers, Cloudflare D1 Database.

## 🚀 Commandes

```bash
# Lancer le serveur de développement
npm run dev

# Compiler le projet
npm run build

# Déployer sur Cloudflare Workers
npm run deploy
```
