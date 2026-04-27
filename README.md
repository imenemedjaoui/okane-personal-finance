<div align="center">

# Okane お金

**Gestionnaire de finances personnelles — open source, local-first, sans serveur.**

Vos données restent dans votre navigateur. Aucun compte, aucune inscription, aucun tracking.

[![Voir la démo](https://img.shields.io/badge/Voir_la_démo-4F46E5?style=for-the-badge&logo=github&logoColor=white)](https://imenemedjaoui.github.io/okane-personal-finance/)

[Fonctionnalités](#fonctionnalités) · [Captures d'écran](#captures-décran) · [Installation](#installation) · [Stack technique](#stack-technique) · [Architecture](#architecture-des-données) · [Licence](#licence)

</div>

---

## Fonctionnalités

- **Multi-comptes & multi-devises** — EUR, USD, GBP, MAD, JPY, CHF, CAD, TND et plus
- **Transactions complètes** — Dépenses, revenus et transferts entre comptes avec modification et suppression
- **Import CSV** — Importez vos relevés bancaires avec mapping de colonnes intelligent et auto-détection des champs
- **Export CSV / JSON** — Exportez toutes vos données en un clic
- **Catégorisation automatique** — Les transactions importées sont catégorisées par mots-clés configurables
- **40+ catégories prédéfinies** — Alimentation, Transport, Logement, Santé, Loisirs, etc.
- **Transactions récurrentes** — Programmez des dépenses et revenus automatiques (quotidien, hebdomadaire, mensuel, trimestriel, semestriel, annuel)
- **Liste de souhaits** — Ajoutez des objets ou services à acheter avec prix, catégorie et priorité, puis confirmez l'achat sur un de vos comptes
- **Budgets mensuels** — Définissez des plafonds par catégorie avec barres de progression et alertes de dépassement
- **Dashboard riche** — 6 visualisations interactives : tendance mensuelle, répartition par catégorie (donut), dépenses journalières, taux d'épargne, évolution du solde, suivi des budgets
- **Thème clair / sombre** — Bascule instantanée avec transitions fluides
- **Responsive** — Interface adaptée desktop et mobile avec navigation bottom bar
- **Mode démo** — Données d'exemple pour tester l'application en un clic
- **100% local** — Stockage IndexedDB, aucune donnée ne quitte votre navigateur

## Captures d'écran

### Dashboard

<div align="center">

![Dashboard — thème clair](./public/screenshots/dashboard.png)

</div>

### Dashboard — thème sombre

<div align="center">

![Dashboard — thème sombre](./public/screenshots/dashboard-dark.png)

</div>

### Transactions

<div align="center">

![Liste des transactions avec recherche et filtres](./public/screenshots/transactions.png)

</div>

### Comptes

<div align="center">

![Gestion multi-comptes et multi-devises](./public/screenshots/accounts.png)

</div>

### Budgets

<div align="center">

![Suivi des budgets mensuels par catégorie](./public/screenshots/budgets.png)

</div>

### Catégories

<div align="center">

![40+ catégories avec icônes et mots-clés](./public/screenshots/categories.png)

</div>

### Transactions récurrentes

<div align="center">

![Programmation de dépenses et revenus automatiques](./public/screenshots/recurring.png)

</div>

### Import CSV

<div align="center">

![Import de relevés bancaires avec mapping de colonnes](./public/screenshots/import.png)

</div>

## Installation

```bash
git clone https://github.com/imenmusic/okane.git
cd okane
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

> Cliquez sur **"Charger la démo"** dans la bannière en haut pour explorer avec des données d'exemple.

## Stack technique

| Technologie | Rôle |
|---|---|
| [Next.js 16](https://nextjs.org/) | Framework React (App Router, Turbopack) |
| [React 19](https://react.dev/) | UI |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styles utilitaires |
| [Dexie.js](https://dexie.org/) | Wrapper IndexedDB (stockage local) |
| [Recharts](https://recharts.org/) | Graphiques (Area, Bar, Pie, RadialBar) |
| [PapaParse](https://www.papaparse.com/) | Parsing CSV |
| TypeScript | Typage statique |

## Architecture des données

Aucun serveur requis. Toutes les données sont stockées localement dans IndexedDB via Dexie.js :

```
accounts             Comptes bancaires (nom, devise, solde, icône, couleur)
transactions         Dépenses, revenus, transferts (montant, date, catégorie, notes)
categories           Catégories avec icônes, couleurs et mots-clés d'auto-catégorisation
budgets              Budgets mensuels par catégorie
recurringTransactions  Transactions programmées (fréquence, dates, statut actif/pause)
wishlistItems        Liste de souhaits (nom, prix, catégorie, priorité, statut d'achat)
settings             Préférences utilisateur (devise, thème, locale)
```

## Déploiement

L'application est statique et peut être déployée sur n'importe quel hébergeur :

**Vercel** (recommandé) :
1. Pusher le repo sur GitHub
2. Connecter à [vercel.com](https://vercel.com)
3. Déployer en un clic

**Autres options** : Netlify, Cloudflare Pages, GitHub Pages (avec export statique).

## Auteure

**Imène MEDJAOUI**

## Licence

MIT
