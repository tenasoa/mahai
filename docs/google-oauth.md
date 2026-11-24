# Activer « Continuer avec Google »

Gratuit : pas de carte bancaire, pas de facturation à activer. Compter 10 minutes.
Le code est déjà en place : le bouton apparaît tout seul dès que les deux secrets sont posés.

## 1. Créer le projet Google

1. Ouvrir <https://console.cloud.google.com/> avec le compte Google qui gérera Mah.ai.
2. En haut, sélecteur de projet → **Nouveau projet** → nom `Mah.ai` → **Créer**.
   Si Google propose d'activer la facturation, refuser : ce n'est pas nécessaire.

## 2. Écran de consentement (ce que voit l'élève)

Menu ☰ → **Google Auth Platform** (ou « API et services » → « Écran de consentement OAuth »)
→ **Commencer** :

| Champ | Valeur |
| --- | --- |
| Nom de l'application | `Mah.ai` |
| Adresse e-mail d'assistance | ton email |
| Audience | **Externe** |
| Coordonnées | ton email |

Accepter les règles, **Créer**.

Dans **Accès aux données**, ne rien ajouter : `email`, `profile` et `openid` suffisent et ne
demandent aucune validation de Google.

## 3. Créer l'identifiant

**Clients** → **Créer un client** → type **Application Web**, nom `Mah.ai Web`.

**Origines JavaScript autorisées** :

```
https://mahai.tenasoa.workers.dev
https://mahai-preprod.tenasoa.workers.dev
http://localhost:5173
```

**URI de redirection autorisés** :

```
https://mahai.tenasoa.workers.dev/api/auth/callback/google
https://mahai-preprod.tenasoa.workers.dev/api/auth/callback/google
http://localhost:5173/api/auth/callback/google
```

**Créer**. Google affiche un **ID client** (finit par `.apps.googleusercontent.com`) et un
**code secret**. Télécharger le JSON ou garder la fenêtre ouverte : le secret peut ne plus être
affiché ensuite.

## 4. Publier l'application

**Audience** → **Publier l'application** → confirmer. Sans cette étape, seuls les « utilisateurs
test » ajoutés à la main (100 maximum) peuvent se connecter. Avec seulement nom, email et photo,
la publication ne passe pas par une validation.

## 5. Donner les identifiants à Mah.ai

Dans PowerShell, dans le dossier `mahai`. Chaque commande demande la valeur : la coller puis
Entrée (rien ne s'affiche, c'est normal).

```powershell
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID --env preprod
npx wrangler secret put GOOGLE_CLIENT_SECRET --env preprod
```

Le bouton apparaît aussitôt sur `/connexion` et `/inscription`, sans redéploiement.

En local, ajouter les deux lignes à `.dev.vars` (jamais commité) puis relancer `pnpm dev` :

```
GOOGLE_CLIENT_ID=…
GOOGLE_CLIENT_SECRET=…
```

## Bon à savoir

- Un élève inscrit par email + mot de passe qui tente ensuite « Continuer avec Google » avec la
  même adresse voit : « Un compte existe déjà avec cet email. Connecte-toi avec ton mot de passe. »
  C'est voulu : tant que les emails ne sont pas vérifiés, rattacher automatiquement les deux
  comptes permettrait à quelqu'un de créer un compte au nom d'un autre et d'en garder l'accès.
- Pour retirer Google : `npx wrangler secret delete GOOGLE_CLIENT_ID` (et `--env preprod`).
- Afficher le logo de Mah.ai sur l'écran Google demande une vérification de la marque ; ce n'est
  pas nécessaire pour que la connexion fonctionne.
