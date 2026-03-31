# Ygrec

Base de projet full-stack avec:
- Frontend React (Vite)
- Backend Express (TypeScript)
- Base de donnees PostgreSQL
- Docker Compose pour frontend + backend + base de donnees

## Prerequis

- Node.js 20+
- npm
- Docker
- Docker Compose

## Installation

1. Installer les dependances a la racine et dans les deux apps:

```bash
npm i
cd backend
npm i
cd ..
cd frontend
npm i
cd ..
```

2. Copier les variables d'environnement:

```bash
linux : cp .env.example .env
winodws : copy .env.example .env
```

IMPORTANT : Prendre en compte qu'une utilisation d'une clé autre que celle par défaut implique
une nécessité de recrée des comptes et l'impossibilité de se connecter au anciens comptes.

Générer une clé pour le JWT_SECRET dans le .env 
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```


## Lancer tout le projet en Docker

Commande recommandee:

```bash
npm run docker:up
```

Services exposes:
- frontend: http://localhost:5173
- backend: http://localhost:3000
- postgres: localhost:5432

Au premier lancement (volume vide), PostgreSQL importe automatiquement le dump SQL versionne dans:

```text
database/init/001_init.sql
```

Arret complet de la stack:

```bash
npm run docker:down
```

Voir les logs des conteneurs:

```bash
npm run docker:logs
```

Reinitialiser completement (supprime le volume DB puis rebuild/restart):

```bash
npm run docker:reset
```

## Lancer uniquement la base PostgreSQL (Docker)

```bash
npm run db:up
```

Cela permet de lancer uniquement la base si tu veux demarrer frontend/backend hors Docker.

Arret de la base:

```bash
npm run db:down
```

Reinitialiser la base (supprime le volume Docker puis reimporte le dump):

```bash
npm run db:reset
```

## Lancer le frontend + backend en local (hors Docker)

Commande unique:

```bash
npm run dev
```

Cette commande lance en local:
- backend sur http://localhost:3000
- frontend sur http://localhost:5173

## Différentes routes

1. Frontend (React Router):

- GET /feed: page principale avec fil d'avis
- GET /connexion: page de connexion
- GET /inscription: page d'inscription
- GET /: redirection vers /feed
- GET *: redirection vers /feed

2. Backend (Express):

- GET /health: etat du backend + connexion base de donnees
- GET /api/ping: test API
- POST /api/create-user: creation d'utilisateur
- POST /api/login: connexion (pose le cookie auth_token)
- POST /api/logout: deconnexion (supprime le cookie auth_token)
- GET /api/avis?page=1&limit=10: liste paginee des avis
- POST /api/create-avis: creation d'un avis (auth requise)
- POST /api/avis/:id/like: ajout/suppression d'un like (auth requise)
- POST /api/avis/:id/comment: ajout d'un commentaire (auth requise)
- DELETE /api/avis/:id: suppression d'un avis par son auteur (auth requise)
- DELETE /api/avis/:avisId/comment/:commentId: suppression d'un commentaire par son auteur (auth requise)

## Comptes Test

1. 
username: Edgar
password: Motdepasse123!
admin: Non

2. 
- username: Adnane
- password: Motdepasse456!
- admin: Non

3. 
- username: Samuel
- password: Motdepasse456!
- admin: Non

4. 
- username: Samuel
- password: Motdepasse456!
- admin: Non

5. 
- username: Admin
- password: Motdepasse789!
- admin: Oui 

## Arborescence

```text
.
├── README.md
├── backend
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── src
│       └── index.ts
├── database
│   └── init
│       └── 001_init.sql
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.js
│   └── src
│       ├── App.jsx
│       ├── components
│       │   └── ReviewCard.tsx
│       ├── main.jsx
│       ├── pages
│       │   ├── ConnexionPage.jsx
│       │   ├── FeedPage.jsx
│       │   └── InscriptionPage.jsx
│       ├── services
│       │   ├── AvisService.ts
│       │   ├── ConnexionService.ts
│       │   └── InscriptionSerivce.ts
│       ├── styles
│       │   ├── FeedPage.css
│       │   └── ReviewCard.css
│       └── styles.css
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
└── package.json
```

## Connexion bdd

docker compose exec db psql -U postgres -d ygrec

## Regenerer le dump SQL de demo

Si tu modifies les donnees et que tu veux mettre a jour le dump fourni au projet:

```bash
mkdir -p database/init
docker compose exec -T db sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges --inserts --column-inserts' > database/init/001_init.sql
```
