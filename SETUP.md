# ============================================
# MAH.AI — Guide de Setup Complet
# ============================================

## 🚀 SETUP INITIAL (30 minutes)

### 1. Créer les comptes

#### Clerk (Authentification)
1. Aller sur https://clerk.com
2. Sign up avec GitHub/Google
3. Créer une application "Mah.AI"
4. Copier les clés :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

#### Supabase (Base de données)
1. Aller sur https://supabase.com
2. Créer un projet "mah-ai"
3. Aller dans Settings → Database
4. Copier le "Connection string" (URI mode)
5. Remplacer `[PASSWORD]` dans `.env.local`

#### Vercel Blob (Storage)
1. Aller sur Vercel Dashboard
2. Storage → Blob → Connect
3. Copier le token généré

### 2. Configurer .env.local

```bash
# Copier .env.example
cp .env.example .env.local

# Remplir avec vos clés
```

### 3. Setup Base de données

```bash
# Générer Prisma Client
pnpm db:generate

# Pousser le schema vers Supabase
pnpm db:push

# (Optionnel) Ouvrir Prisma Studio
pnpm db:studio
```

### 4. Configurer Clerk

1. Dans Clerk Dashboard → User & Authentication
2. Activer : Email, Google, Facebook
3. Dans Clerk → Webhooks :
   - Endpoint : `https://votre-domaine.com/api/webhooks/clerk`
   - Events : `user.created`, `user.updated`, `user.deleted`
   - Copier le signing secret

### 5. Lancer en dev

```bash
pnpm dev
# → http://localhost:3000
```

---

## 📦 COMMANDES UTILES

```bash
# Développement
pnpm dev              # Next.js + Turbopack

# Build
pnpm build
pnpm start

# Database
pnpm db:generate      # Prisma generate
pnpm db:push          # Push schema
pnpm db:studio        # GUI database

# Linting
pnpm lint
```

---

## 🎯 PROCHAINES ÉTAPES

### Jour 1-2 : Infrastructure
- [x] Setup Next.js 16
- [x] Configuration Tailwind
- [x] Prisma schema
- [ ] Clerk integration
- [ ] Layouts (public, dashboard, admin)

### Jour 3 : Pages publiques
- [ ] Landing Page
- [ ] Catalogue
- [ ] Page Sujet

### Jour 4 : Paiements
- [ ] Page Recharge
- [ ] Upload Vercel Blob
- [ ] Admin transactions

### Jour 5 : Tests
- [ ] Tests E2E
- [ ] Déploiement Vercel
- [ ] Beta testing

---

## 🔗 LIENS UTILES

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Prisma Docs](https://prisma.io/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🆘 SUPPORT

Pour toute question :
- Consulter le README.md
- Vérifier les types dans `src/types/index.ts`
- Voir les logs Prisma : `prisma:query`

---

**Made with ❤️ for Madagascar 🇲🇬**
