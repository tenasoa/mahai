# Activer l'envoi d'emails (Gmail, gratuit)

Mah.ai envoie ses emails (mot de passe oublié, confirmation d'email) depuis un **compte Gmail
dédié**, par l'API Gmail. Gratuit, environ 500 emails par jour au maximum : largement assez pour
démarrer. Plus tard, avec un nom de domaine, on passera à un vrai service d'envoi.

Le code est déjà en place : tout s'active dès que les 4 secrets sont posés. Sans eux, le lien
« Mot de passe oublié ? » est caché et la page propose d'écrire à l'adresse de contact.

Compter 15 minutes.

## 1. Créer le compte Gmail dédié

Créer un nouveau compte Gmail réservé à Mah.ai (par exemple une adresse avec « mahai »). C'est
l'adresse que les élèves verront comme expéditeur. Ne pas utiliser ton Gmail perso.

## 2. Activer l'API Gmail

Dans <https://console.cloud.google.com/>, projet **Mah-ai** (celui de la connexion Google) :
menu ☰ → **API et services** → **Bibliothèque** → chercher **Gmail API** → **Activer**.
Gratuit, pas de facturation.

## 3. Créer un identifiant pour l'envoi

**Google Auth Platform** → **Clients** → **Créer un client** :

- Type : **Application Web**
- Nom : `Mah.ai envoi Gmail`
- **URI de redirection autorisés** : `https://developers.google.com/oauthplayground`

**Créer**, puis garder l'**ID client** et le **code secret** (télécharger le JSON).

C'est un identifiant séparé de celui de la connexion Google : on peut révoquer l'un sans toucher
à l'autre.

## 4. Autoriser l'envoi depuis le compte dédié

1. Ouvrir <https://developers.google.com/oauthplayground>.
2. Roue dentée ⚙ en haut à droite → cocher **Use your own OAuth credentials** → coller l'ID
   client et le code secret de l'étape 3.
3. À gauche, dans la case **Input your own scopes**, écrire :
   `https://www.googleapis.com/auth/gmail.send` → **Authorize APIs**.
4. Se connecter avec le **compte Gmail dédié** (pas ton Gmail perso).
5. Google affiche « Google n'a pas validé cette application » : **Paramètres avancés** →
   **Accéder à Mah-ai (non sécurisé)**. C'est normal : c'est ta propre application, et seul ce
   compte donne cette autorisation. Puis **Continuer** / **Autoriser**.
6. Étape 2 du Playground : **Exchange authorization code for tokens** → copier le
   **Refresh token** (commence souvent par `1//`).

L'autorisation ne permet que d'**envoyer** des emails : Mah.ai ne peut pas lire la boîte.

## 5. Donner les secrets à Mah.ai

Dans PowerShell, dans le dossier `mahai`. Chaque commande demande la valeur : la coller puis
Entrée (rien ne s'affiche, c'est normal). `GMAIL_EXPEDITEUR` est l'adresse du compte dédié.

```powershell
npx wrangler secret put GMAIL_CLIENT_ID
npx wrangler secret put GMAIL_CLIENT_SECRET
npx wrangler secret put GMAIL_REFRESH_TOKEN
npx wrangler secret put GMAIL_EXPEDITEUR
```

Puis les mêmes avec `--env preprod` à la fin.

## 6. Essayer

Sur <https://mahai.tenasoa.workers.dev/connexion> → **Mot de passe oublié ?** → ton email.
L'email arrive en quelques minutes ; la première fois, il peut tomber dans les spams : le marquer
« Non spam » aide pour la suite.

## Si les emails n'arrivent plus

Le refresh token cesse de marcher si le mot de passe du compte dédié change, si l'accès est
retiré dans <https://myaccount.google.com/permissions>, ou après 6 mois sans aucun envoi. Refaire
l'étape 4 et reposer `GMAIL_REFRESH_TOKEN`. Les échecs apparaissent dans les journaux du Worker
(tableau de bord Cloudflare → Workers → mahai → Logs, message « Échec d'envoi d'email »).
