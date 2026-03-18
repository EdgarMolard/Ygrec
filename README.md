# NotationJV

Base de projet full-stack avec:
- Frontend React (Vite)
- Backend Express (TypeScript)
- Base de donnees PostgreSQL
- Docker Compose uniquement pour la base de donnees

## Prerequis

- Node.js 20+
- npm
- Docker
- Docker Compose

## Installation

1. Installer les dependances a la racine et dans les deux apps:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

2. Copier les variables d'environnement:

```bash
cp .env.example .env
```

## Lancer la base PostgreSQL (Docker)

```bash
npm run db:up
```

Arret de la base:

```bash
npm run db:down
```

## Lancer le frontend + backend en local

Commande unique:

```bash
npm run dev
```

Cette commande lance:
- backend sur http://localhost:3000
- frontend sur http://localhost:5173

## Verification rapide

- Backend health: http://localhost:3000/health
- Frontend: page de connexion React

## Arborescence

```text
.
├── backend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src
│       └── index.ts
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── .env.example
├── .gitignore
├── docker-compose.yml
└── package.json
```

## Connexion bdd

docker compose exec db psql -U postgres -d notationjv