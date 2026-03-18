# Migrations Supabase - Mah.AI

Ce dossier contient les fichiers de migration pour la base de données Supabase.

## Comment exécuter les migrations

### Option 1: Via le Dashboard Supabase

1. Connectez-vous à votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet Mah.AI
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. Cliquez sur **"New Query"**
5. Copiez-collez le contenu du fichier de migration (ex: `001_add_birthDate_to_user.sql`)
6. Cliquez sur **"Run"** pour exécuter la migration

### Option 2: Via Supabase CLI

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier au projet (remplacez <project-ref> par votre référence de projet)
supabase link --project-ref <project-ref>

# Exécuter la migration
supabase db push --include-all
```

### Option 3: Manuellement dans l'éditeur SQL

Exécutez directement cette commande dans l'éditeur SQL de Supabase :

```sql
-- Pour ajouter birthDate à la table User
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "birthDate" TEXT;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'birthDate';
```

## Migrations disponibles

### 001_add_birthDate_to_user.sql
- **Date** : 2026-03-18
- **Description** : Ajoute la colonne `birthDate` pour stocker la date de naissance des utilisateurs
- **Colonnes ajoutées** :
  - `birthDate` (TEXT) : Date de naissance au format ISO (YYYY-MM-DD)

### 002_add_nomComplet_pseudo_to_user.sql
- **Date** : 2026-03-18
- **Description** : Ajoute les colonnes `nomComplet` et `pseudo` pour l'affichage personnalisé
- **Colonnes ajoutées** :
  - `nomComplet` (TEXT) : Nom complet affiché publiquement
  - `pseudo` (TEXT) : Pseudonyme pour l'interface
- **Migration automatique** : Remplit les données existantes

### 003_separate_nom_prenom.sql
- **Date** : 2026-03-18
- **Description** : Séparation de nomComplet en champs nom et prenom distincts
- **Index ajoutés** :
  - `idx_user_nom` : Pour les recherches par nom
  - `idx_user_prenom` : Pour les recherches par prénom

### 004_add_profilePicture_to_user.sql
- **Date** : 2026-03-18
- **Description** : Ajoute la colonne `profilePicture` pour stocker l'URL de l'avatar
- **Colonnes ajoutées** :
  - `profilePicture` (TEXT) : URL de l'avatar (Vercel Blob)

### 003_add_user_security_settings.sql
- **Date** : 2026-03-18
- **Description** : Ajoute les paramètres de sécurité utilisateur pour la section Profil > Sécurité
- **Colonnes ajoutées** :
  - `securityTwoFactorEnabled` (BOOLEAN, défaut `false`)
  - `securityLoginAlertEnabled` (BOOLEAN, défaut `true`)
  - `securityUnknownDeviceBlock` (BOOLEAN, défaut `false`)
  - `securityRecoveryEmailEnabled` (BOOLEAN, défaut `true`)
  - `securitySessionTimeoutMinutes` (INTEGER, défaut `120`, borné entre `15` et `1440`)
  - `securitySettingsUpdatedAt` (TIMESTAMPTZ, nullable)

## Vérification

Après avoir exécuté la migration, vous pouvez vérifier que tout fonctionne avec cette requête :

```sql
SELECT id, email, prenom, "birthDate", "createdAt" 
FROM "User" 
LIMIT 5;
```

## Notes importantes

- ✅ Les migrations sont idempotentes (peuvent être exécutées plusieurs fois sans effet néfaste)
- ✅ Les colonnes sont ajoutées avec `IF NOT EXISTS` pour éviter les erreurs
- ✅ Les nouvelles colonnes sont nullable pour ne pas casser les données existantes
- 📝 Pensez à sauvegarder votre base de données avant d'exécuter des migrations en production
