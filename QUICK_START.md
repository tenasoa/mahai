# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## ⚡ COMMANDES À EXÉCUTER

### 1. Installer les dépendances (si pas encore fait)
```bash
cd "C:\Users\Tenasoa\desktop\Mah.AI project\mah-ai_qwen"
pnpm install
```

### 2. Générer Prisma Client
```bash
pnpm db:generate
# OU
npx prisma generate
```

### 3. Configurer .env.local
Remplis avec tes vraies clés :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 4. Pousser le schema vers Supabase
```bash
pnpm db:push
# OU
npx prisma db push
```

### 5. Lancer en développement
```bash
pnpm dev
# → http://localhost:3000
```

---

## 📁 COMMANDES DISPONIBLES

```bash
pnpm dev              # Développement avec Turbopack
pnpm build            # Build production
pnpm start            # Start production server
pnpm lint             # ESLint

pnpm db:generate      # Générer Prisma Client
pnpm db:push          # Pousser schema vers DB
pnpm db:studio        # Ouvrir Prisma Studio (GUI)
pnpm db:migrate       # Créer une migration
```

---

## 🔧 SI ERREUR "Command not found"

Les scripts sont dans `package.json`. Si tu vois cette erreur :

1. Vérifie que `package.json` contient bien les scripts
2. Réinstalle les dépendances : `pnpm install`
3. Utilise `npx` comme alternative :
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## 📊 STRUCTURE CRÉÉE

✅ Next.js 16 + Turbopack
✅ TypeScript strict
✅ Tailwind CSS v4
✅ Prisma schema (7 modèles)
✅ Vercel Blob utils
✅ Types TypeScript
✅ Design system Mah.AI

---

## 🎯 PROCHAINE ÉTAPE

Après avoir généré Prisma :

1. **Configurer Clerk** → https://clerk.com
2. **Configurer Supabase** → https://supabase.com
3. **Configurer Vercel Blob** → Vercel Dashboard

Puis lance `pnpm dev` ! 🚀

---

**Made with ❤️ for Madagascar 🇲🇬**
