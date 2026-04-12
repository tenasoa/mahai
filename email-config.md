# Configuration Email pour Mah.AI

## Email Natif Supabase

Mah.AI utilise le service d'envoi d'email natif de Supabase Auth pour tous les emails transactionnels.

### Comment ça marche

Supabase envoie automatiquement des emails pour les actions suivantes :

1. **Inscription** - Email de confirmation avec lien magique
2. **Réinitialisation mot de passe** - Email avec lien de réinitialisation
3. **Renvoi de confirmation** - Email de confirmation à nouveau

### Configuration dans Supabase Dashboard

1. **Activer la confirmation d'email** :
   - Allez dans Supabase Dashboard
   - Navigation → Authentication → Settings
   - Section "Email Auth" → Activez "Enable email confirmations"

2. **Personnaliser les templates d'email** :
   - Navigation → Authentication → Email Templates
   - Modifiez les templates :
     - `Confirm signup` - Email de confirmation d'inscription
     - `Reset password` - Email de réinitialisation de mot de passe
     - `Email OTP` - Email avec code OTP (si utilisé)

3. **Configurer l'expéditeur** (optionnel pour production) :
   - Navigation → Authentication → Settings
   - Section "SMTP Settings"
   - Configurez un serveur SMTP personnalisé pour utiliser votre propre domaine

### Limites du plan gratuit

- **30 000 emails/mois** maximum
- Suffisant pour ~10 000 utilisateurs actifs/mois

### Utilisation dans le code

#### 1. Inscription (envoi automatique)

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      prenom,
      nom,
      role,
    },
  },
})

// Supabase envoie automatiquement l'email de confirmation
```

#### 2. Réinitialisation du mot de passe

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://mah-ai.mg/auth/reset-password',
})

// Supabase envoie automatiquement l'email de réinitialisation
```

#### 3. Renvoi de l'email de confirmation

```typescript
const { error } = await supabase.auth.resend({
  type: 'signup',
  email,
})

// Supabase renvoie l'email de confirmation
```

### Emails implémentés dans Mah.AI

| Action | Fonction | Méthode Supabase |
|--------|----------|------------------|
| Inscription | `registerUser()` | `signUp()` + email auto |
| Forgot Password | `requestPasswordReset()` | `resetPasswordForEmail()` |
| Resend Verification | `resendVerificationEmail()` | `resend({ type: 'signup' })` |
| Password Change | `requestPasswordChangeCodeAction()` | `resetPasswordForEmail()` |

### Avantages

- ✅ **Gratuit** - Inclus dans le plan gratuit Supabase (30K emails/mois)
- ✅ **Simple** - Aucune configuration supplémentaire requise
- ✅ **Fiable** - Géré par Supabase
- ✅ **Sécurisé** - Utilise l'infrastructure d'authentification Supabase
- ✅ **Personnalisable** - Templates modifiables dans le Dashboard

### Inconvénients

- ❌ **Personnalisation limitée** - Le contenu des emails est limité aux templates Supabase
- ❌ **Pas d'OTP personnalisé** - Supabase utilise des liens magiques, pas des codes OTP
- ❌ **Domaine partagé** - En gratuit, les emails viennent de `noreply@your-project.supabase.co`

### Solution pour les OTP personnalisés

Mah.AI utilise une approche hybride :

1. **Supabase** envoie l'email de confirmation natif (avec lien magique)
2. **Mah.AI** stocke un code OTP à 6 chiffres dans la table `EmailVerification`
3. L'utilisateur peut :
   - Cliquer sur le lien dans l'email Supabase, OU
   - Saisir le code OTP à 6 chiffres sur le site

Cela permet d'avoir une expérience utilisateur flexible tout en utilisant l'infrastructure email de Supabase.

### Notes importantes

- Pour la production, configurez un **domaine d'envoi personnalisé** dans Supabase
- Les emails peuvent mettre quelques minutes à arriver
- Vérifiez le dossier spam si les emails n'arrivent pas en boîte de réception
- Pour tester en local, utilisez des emails réels (pas de domaine jetable)
