# 🔐 Guide de Régénération des Secrets

> Ce document décrit la procédure de rotation des secrets. Les fichiers `.env*`
> ne doivent jamais être commités ; stocker les vraies valeurs uniquement dans
> le gestionnaire d'environnements de production (Vercel, Supabase, etc.).

## 📋 Inventaire des Secrets à Régénérer

### 1. Supabase (PRIORITÉ MAXIMALE)
**Projet:** `YOUR_PROJECT_REF`

#### À régénérer:
- [ ] **SUPABASE_SERVICE_ROLE_KEY** - Clé la plus critique
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Optionnel mais recommandé

#### Procédure:
1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner le projet
3. Settings → API → "Project API keys"
4. Cliquer sur "Reveal" pour la Service Role Key
5. Cliquer sur "Regenerate" ou créer une nouvelle clé
6. Copier la nouvelle clé et mettre à jour `.env` et `.env.local`

---

### 2. Perplexity API
**Compte:** associé à la clé Perplexity configurée en environnement.

#### À régénérer:
- [ ] **PERPLEXITY_API_KEY**

#### Procédure:
1. Aller sur [Perplexity Dashboard](https://www.perplexity.ai/settings/api)
2. API Keys → "Revoke" l'ancienne clé
3. "Create new key"
4. Copier la nouvelle clé

---

### 3. Anthropic/Claude API
**Compte:** associé à la clé Anthropic configurée en environnement.

#### À régénérer:
- [ ] **ANTHROPIC_API_KEY**

#### Procédure:
1. Aller sur [Anthropic Console](https://console.anthropic.com/)
2. Settings → API Keys
3. Supprimer l'ancienne clé
4. "Create Key"
5. Copier la nouvelle clé

---

### 4. Resend (Email)
**Domaine:** `your-domain.vercel.app`

#### À régénérer:
- [ ] **RESEND_API_KEY**

#### Procédure:
1. Aller sur [Resend Dashboard](https://resend.com/)
2. Settings → API Keys
2. Revoke l'ancienne clé
3. Create API Key
4. Copier la nouvelle clé

---

### 5. Vercel Blob Storage
**Token:** configuré dans l'environnement de production.

#### À régénérer:
- [ ] **BLOB_READ_WRITE_TOKEN**

#### Procédure:
1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet
3. Settings → Environment Variables
4. Regénérer BLOB_READ_WRITE_TOKEN
5. Redéployer le projet

---

### 6. Supabase Database Password
**URL:** `postgresql://postgres.PROJECT_REF:PASSWORD@...`

#### À régénérER:
- [ ] **Password dans DATABASE_URL et DIRECT_URL**

#### Procédure:
1. Supabase Dashboard → Database → "Database Password"
2. "Reset Password"
3. Mettre à jour les URLs dans `.env` avec le nouveau mot de passe

---

## 📝 Template de Mise à Jour

Mettre à jour les variables dans le dashboard de production. Ne pas commiter
un fichier `.env.production`.

```bash
# Variables à mettre à jour côté hébergeur :
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL
# - DIRECT_URL
# - OPENAI_API_KEY / ANTHROPIC_API_KEY / PERPLEXITY_API_KEY selon le provider actif
# - BLOB_READ_WRITE_TOKEN
# - NEXT_PUBLIC_APP_URL
# - NODE_ENV=production
```

---

## 🧹 Nettoyage de l'Historique Git (Si les secrets ont été commités)

Si `.env` a été commité par erreur:

```bash
# 1. Vérifier si .env est dans l'historique
git log --all --full-history -- .env

# 2. Si oui, supprimer de l'historique (⚠️ DANGEREUX - backup d'abord!)
# Utiliser git-filter-repo ou BFG Repo-Cleaner

# 3. Alternative: Changer de repo ou forcer le push après nettoyage
git push --force-with-lease
```

---

## ✅ Checklist Post-Régénération

- [ ] Tous les secrets ont été régénérés
- [ ] Fichiers `.env` et `.env.local` mis à jour
- [ ] Variables d'environnement sur Vercel mises à jour
- [ ] Redéploiement effectué
- [ ] Tests fonctionnels effectués (login, paiement, email)
- [ ] Anciennes clés révoquées dans tous les dashboards

---

## 🆘 En Cas de Problème

Si quelque chose casse après la rotation:
1. Vérifier les variables sur Vercel (Settings → Environment Variables)
2. Redéployer depuis le dashboard Vercel
3. Vérifier les logs (Monitoring → Runtime Logs)
