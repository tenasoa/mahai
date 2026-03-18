# Configuration de Vercel Blob pour les Avatars

## 📋 Prérequis

- Projet déployé sur Vercel
- Compte Vercel actif

## 🚀 Configuration

### 1. Activer Vercel Blob

Dans le dashboard Vercel de votre projet :
1. Allez dans **Storage**
2. Cliquez sur **Add Database** → **Blob**
3. Cliquez sur **Create** pour créer le store Blob

### 2. Récupérer le token

Après avoir créé le store Blob :
1. Allez dans l'onglet **Tokens**
2. Cliquez sur **Create Token**
3. Donnez un nom (ex: `production-token`)
4. Copiez le token généré

### 3. Ajouter la variable d'environnement

Dans le dashboard Vercel :
1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez une nouvelle variable :
   - Nom : `BLOB_READ_WRITE_TOKEN`
   - Valeur : [le token copié]
   - Environnements : Production, Preview, Development

### 4. Configuration locale (.env.local)

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## 📁 Structure des fichiers

Les avatars sont stockés dans :
```
avatars/
  └── {userId}/
      └── avatar.jpg
```

## 🔒 Sécurité

- Validation des types de fichiers (JPEG, PNG, WebP, GIF)
- Taille maximale : 5MB
- Accès public en lecture uniquement
- Token requis pour écriture/suppression

## 🎨 Utilisation

### Dans le profil utilisateur

1. Cliquez sur l'icône 📷 dans le coin de l'avatar
2. Sélectionnez une image
3. Preview automatique
4. Cliquez sur "Enregistrer"

### API Actions

```typescript
// Upload
import { uploadAvatarAction } from '@/actions/avatar'
const result = await uploadAvatarAction(userId, file)

// Delete
import { deleteAvatarAction } from '@/actions/avatar'
const result = await deleteAvatarAction(userId)
```

## 📝 Notes

- Les avatars sont automatiquement optimisés par Vercel
- URL publique générée automatiquement
- Suppression de l'ancien avatar lors du remplacement
- Revalidation automatique des pages après upload

## 🔍 Dépannage

### Erreur : "BLOB_READ_WRITE_TOKEN n'est pas configuré"
→ Vérifiez que la variable d'environnement est bien définie

### Erreur : "Type de fichier non supporté"
→ Utilisez uniquement JPG, PNG, WebP ou GIF

### Erreur : "Fichier trop volumineux"
→ La taille maximale est de 5MB

## 📚 Ressources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob SDK](https://github.com/vercel/storage/tree/main/packages/blob)
