# 📚 Mah.AI - Catalogue & Pages Sujets

> **Pages production-ready Next.js 14** pour le catalogue et le détail des sujets d'examens

## 🎯 Ce qui a été créé

### ✅ Pages principales
- **`/catalogue`** - Catalogue complet avec filtres, recherche, tri et pagination
- **`/catalogue/[id]`** - Page détail d'un sujet avec système d'achat par crédits

### ✅ Intégrations complètes
- ✅ **Clerk** - Authentification complète avec middleware et webhook
- ✅ **Supabase** - Base de données PostgreSQL via Prisma
- ✅ **Cloudflare R2** - Stockage des PDFs et fichiers
- ✅ **Système de crédits** - Achat, déduction et distribution automatique

### ✅ Infrastructure
```
app/
├── (public)/
│   └── catalogue/
│       ├── page.tsx              # Catalogue (Server Component)
│       ├── CatalogueClient.tsx   # Filtres et interactivité (Client)
│       └── [id]/
│           ├── page.tsx          # Détail sujet (Server)
│           └── SujetDetailClient.tsx # Achat et tabs (Client)
│
├── api/
│   ├── achats/route.ts          # POST/GET achats
│   ├── user/route.ts            # GET user info
│   └── webhooks/
│       └── clerk/route.ts       # Sync Clerk → DB
│
components/
├── shared/
│   ├── Navigation.tsx           # Nav + compteur crédits
│   └── SubjectCard.tsx          # Carte sujet
│
lib/
├── db/
│   ├── prisma.ts                # Client Prisma
│   └── queries/
│       └── sujets.ts            # Queries sujets
├── auth/
│   └── clerk.ts                 # Utilitaires Clerk
├── storage/
│   └── r2.ts                    # Client R2
└── utils/
    └── credits.ts               # Système de crédits
```

---

## 🚀 Installation

### 1. Prérequis
- Node.js 18+
- pnpm (recommandé) ou npm
- Comptes : Clerk, Supabase, Cloudflare R2

### 2. Dépendances

```bash
pnpm install
```

**Packages principaux** :
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "@clerk/nextjs": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/s3-request-presigner": "^3.0.0",
    "svix": "^1.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### 3. Configuration des variables

Copier `.env.example` → `.env.local` et remplir :

```bash
# DATABASE (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# CLERK
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# R2
CLOUDFLARE_R2_ENDPOINT="https://...r2.cloudflarestorage.com"
CLOUDFLARE_R2_ACCESS_KEY="..."
CLOUDFLARE_R2_SECRET_KEY="..."
CLOUDFLARE_R2_BUCKET="mahai-assets"
```

### 4. Base de données

```bash
# Appliquer les migrations Prisma
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio (optionnel)
npx prisma studio
```

### 5. Configurer Clerk

1. Créer une app sur [clerk.com](https://clerk.com)
2. Activer **Email + Google + Facebook** dans Providers
3. Créer un webhook :
   - URL : `https://votre-domaine.com/api/webhooks/clerk`
   - Events : `user.created`, `user.updated`, `user.deleted`
   - Copier le **Signing Secret** → `CLERK_WEBHOOK_SECRET`

### 6. Configurer Cloudflare R2

1. Créer un bucket `mahai-assets`
2. Générer un API token avec R2 permissions
3. Copier `access_key_id` et `secret_access_key`

---

## 🏃 Lancement

```bash
# Développement
pnpm dev

# Production
pnpm build
pnpm start
```

---

## 📋 Schéma de base de données (Prisma)

**Modèles principaux** :

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  prenom    String
  credits   Int      @default(10)
  roles     String[] @default(["ETUDIANT"])
  
  achats    Achat[]
  sujets    Sujet[]
}

model Sujet {
  id            String   @id @default(cuid())
  titre         String
  contenu       Json     // JSON Tiptap
  typeExamen    String   // CEPE, BEPC, BAC, etc.
  matiere       String   // MATHEMATIQUES, etc.
  annee         Int
  prixCredits   Int
  statut        String   @default("BROUILLON")
  
  contributeurId String
  contributeur   User    @relation(...)
  achats         Achat[]
}

model Achat {
  id            String   @id @default(cuid())
  userId        String
  sujetId       String
  typeAcces     String   // SUJET, CORRECTION_IA, etc.
  creditsPaies  Int
  
  user   User   @relation(...)
  sujet  Sujet  @relation(...)
}
```

---

## 🔧 Points techniques clés

### Server Components vs Client Components
- **Server Components** : Fetch de données, auth check
- **Client Components** : Interactivité, états, événements

### Système de crédits
```typescript
// Exemple d'achat
const result = await acheterSujet(userId, sujetId, 'SUJET');
// → Vérifie crédits
// → Crée transaction
// → Distribue revenus (70% contributeur, 30% plateforme)
// → Incrémente compteur achats
```

### Protection des routes
```typescript
// middleware.ts
const isPublicRoute = createRouteMatcher([
  '/',
  '/catalogue(.*)',  // Catalogue public
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();  // Redirect vers sign-in si non connecté
  }
});
```

---

## 🎨 Design System

**Couleurs Mah.AI** :
```css
--teal: #0AFFE0
--green: #00FF88
--gold: #FFD166
--rose: #FF6B9D
--bg: #060910
--bg2: #0C1220
```

**Composants réutilisables** :
- `<Navigation>` - Nav avec compteur crédits
- `<SubjectCard>` - Carte sujet dans le catalogue
- Badges, filtres, pagination, etc.

---

## 📊 API Routes

### POST `/api/achats`
Acheter un accès à un sujet

**Body** :
```json
{
  "sujetId": "clxxxx",
  "typeAcces": "SUJET" // ou CORRECTION_IA, EXAMEN_BLANC
}
```

**Response** :
```json
{
  "success": true,
  "message": "Achat réussi",
  "achatId": "clxxxx"
}
```

### GET `/api/user`
Récupérer les infos de l'utilisateur connecté

**Response** :
```json
{
  "id": "clxxxx",
  "email": "user@example.com",
  "credits": 15,
  "roles": ["ETUDIANT"]
}
```

---

## 🔐 Sécurité

✅ **Row Level Security** sur Supabase
✅ **Middleware Clerk** sur toutes les routes protégées
✅ **Validation** des données côté serveur
✅ **Watermarking** des PDFs (TODO: implémenter avec pdf-lib)
✅ **Rate limiting** sur les API routes (TODO)

---

## 🚧 TODO / Améliorations

- [ ] Implémenter le watermarking PDF avec `pdf-lib`
- [ ] Ajouter rate limiting sur les API routes
- [ ] Implémenter le mode offline (Service Worker)
- [ ] Ajouter des tests unitaires (Jest + React Testing Library)
- [ ] Optimiser les images avec Next.js Image
- [ ] Ajouter l'internationalisation (i18n)
- [ ] Monitoring avec Sentry
- [ ] Analytics avec PostHog

---

## 📝 License

Propriétaire - Mah.AI © 2026

---

## 🤝 Support

Pour toute question : contact@mah-ai.mg
