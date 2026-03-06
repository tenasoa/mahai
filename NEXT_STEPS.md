# 🎯 PROCHAINES ÉTAPES — Mah.AI_qwen

**Statut actuel** : ✅ Infrastructure créée
**Prochain objectif** : MVP fonctionnel dans 5 jours

---

## 📅 JOUR 1 : AUTH & LAYOUTS

### **1. Installer Clerk** (déjà fait ✅)
```bash
pnpm add @clerk/nextjs
```

### **2. Configurer Clerk**
Dans `.env.local` :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### **3. Créer le provider** (`src/app/layout.tsx`)
```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#0AFFE0',
          colorBackground: '#060910',
          colorText: '#F0F4FF',
          borderRadius: '16px',
        },
      }}
    >
      {/* ... */}
    </ClerkProvider>
  )
}
```

### **4. Créer layouts**
- `src/app/(public)/layout.tsx` — Nav + Footer
- `src/app/(dashboard)/layout.tsx` — Sidebar
- `src/app/(admin)/layout.tsx` — Admin sidebar

### **5. Créer composants layout**
- `src/components/layout/nav.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/sidebar.tsx`

---

## 📅 JOUR 2 : PAGES PUBLIQUES

### **1. Landing Page** (`src/app/page.tsx`)
- Hero avec stats
- Features bento grid
- How it works
- Pricing
- CTA

### **2. Catalogue** (`src/app/(public)/catalogue/page.tsx`)
- Grille de sujets
- Filtres (type, matière, année)
- Recherche
- Tri

### **3. Page Sujet** (`src/app/(public)/catalogue/[id]/page.tsx`)
- Détails sujet
- Aperçu (blur si non acheté)
- Options d'achat
- Modal achat

---

## 📅 JOUR 3 : PAIEMENTS MANUELS

### **1. Page Recharge** (`src/app/(dashboard)/recharge/page.tsx`)
```typescript
// Formulaire :
// - Sélection pack (5K, 20K, 50K Ar)
// - Numéro MVola/Orange
// - Upload capture (Vercel Blob)
```

### **2. API Upload** (`src/app/api/upload/route.ts`)
```typescript
import { uploadPreuvePaiement } from '@/lib/storage/blob'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  
  const { url } = await uploadPreuvePaiement(file, userId)
  
  return Response.json({ url })
}
```

### **3. Admin Transactions** (`src/app/(admin)/transactions/page.tsx`)
- Liste des transactions en attente
- Boutons : ✅ Valider / ❌ Rejeter
- Voir capture d'écran

---

## 📅 JOUR 4 : TESTS

### **1. Tests manuels**
- [ ] Inscription Clerk
- [ ] Upload sujet
- [ ] Achat crédits
- [ ] Validation admin
- [ ] Téléchargement PDF

### **2. Optimisation**
```bash
# Lighthouse score
pnpm build

# Vérifier performance
```

### **3. Déploiement Vercel**
```bash
# Push sur GitHub
git push

# Deploy sur Vercel
vercel --prod
```

---

## 📅 JOUR 5 : BETA TESTING

### **1. Inviter 10 utilisateurs**
- Étudiants (5)
- Contributeurs (3)
- Vérificateurs (2)

### **2. Collecter feedback**
- Temps de chargement
- UX/UI
- Bugs rencontrés

### **3. Itérer**
- Corriger bugs critiques
- Améliorer UX
- Ajouter features manquantes

---

## 🎯 CRITÈRES DE SUCCÈS (MVP)

- [ ] 50+ sujets dans le catalogue
- [ ] 10+ utilisateurs inscrits
- [ ] 5+ paiements validés manuellement
- [ ] Lighthouse score > 85
- [ ] 0 bug critique

---

## 📚 FICHIERS À CRÉER

### **Layouts**
- [ ] `src/app/(public)/layout.tsx`
- [ ] `src/app/(dashboard)/layout.tsx`
- [ ] `src/app/(admin)/layout.tsx`

### **Composants**
- [ ] `src/components/layout/nav.tsx`
- [ ] `src/components/layout/footer.tsx`
- [ ] `src/components/layout/sidebar.tsx`
- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/ui/badge.tsx`
- [ ] `src/components/ui/input.tsx`

### **Pages**
- [ ] `src/app/(public)/catalogue/page.tsx`
- [ ] `src/app/(public)/catalogue/[id]/page.tsx`
- [ ] `src/app/(dashboard)/recharge/page.tsx`
- [ ] `src/app/(admin)/transactions/page.tsx`

### **API Routes**
- [ ] `src/app/api/auth/proxy/route.ts`
- [ ] `src/app/api/upload/route.ts`
- [ ] `src/app/api/credits/route.ts`
- [ ] `src/app/api/transactions/route.ts`

---

## 🔧 COMMANDES UTILES

```bash
# Développement
pnpm dev --turbo

# Build
pnpm build

# Database
pnpm db:generate
pnpm db:push
pnpm db:studio

# Linting
pnpm lint
```

---

## 🆘 BESOIN D'AIDE ?

1. **Consulter** :
   - `README.md` — Documentation générale
   - `SETUP.md` — Guide de setup
   - `SETUP_COMPLETE.md` — Résumé du setup

2. **Vérifier** :
   - Types dans `src/types/index.ts`
   - Utils dans `src/lib/utils/format.ts`
   - Schema dans `prisma/schema.prisma`

3. **Logs** :
   - Terminal : erreurs Next.js
   - Browser Console : erreurs client
   - Prisma : `log: ['query', 'error']`

---

## 🎉 OBJECTIF

**MVP fonctionnel dans 5 jours** pour :
- ✅ Commencer les tests utilisateurs
- ✅ Encaisser les premiers paiements
- ✅ Valider le business model
- ✅ Itérer rapidement

---

**Let's go ! 🚀**

**Made with ❤️ for Madagascar 🇲🇬**
