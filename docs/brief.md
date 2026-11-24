# Mah.ai v2 — brief produit et technique

> Rédigé le 24/11/2026 à partir de l'entretien avec le propriétaire. On repart de zéro :
> nouveau code, base vide, hébergement 100 % Cloudflare. Ce document deviendra le premier fichier
> de la nouvelle branche `main` (ici, `docs/brief.md`).

## 1. Le produit

**Mah.ai aide les apprenants malgaches à réussir leurs examens**, avec des sujets, des corrigés et
une IA qui corrige et explique. C'est aussi une marketplace : des profs et des établissements y
publient et vendent leurs contenus.

| Sujet | Décision |
|---|---|
| Public | Élèves des examens nationaux (CEPE, BEPC, BAC), étudiants et candidats aux concours, profs contributeurs, établissements |
| Contenus | Équipe Mah.ai (officiel), profs contributeurs (validés puis rémunérés), établissements, IA générative (toujours relue avant publication) |
| Modèle économique | Mixte : une partie gratuite, des sujets achetés à l'unité (solde en ariary) et un abonnement mensuel (IA illimitée, examens blancs) |
| Commission contributeur | Taux par défaut réglable dans l'admin (proposition : 70 % contributeur / 30 % Mah.ai), taux spécial possible par établissement |
| Paiement au départ | Mobile Money manuel (MVola, Orange Money, Airtel Money) : l'utilisateur saisit la référence, un admin valide. Agrégateur automatique branché plus tard sans refaire l'écran |
| Connexion | Email + mot de passe, compte Google, numéro de téléphone (code SMS) |
| Langue | Français uniquement (code prêt pour en ajouter d'autres plus tard) |
| Appareils | Web installable (PWA), mobile d'abord, utilisable hors ligne |
| Ton de la marque | Ludique et énergique |
| Données existantes | Aucune reprise : base vide |

## 2. Livraison en vagues

Chaque vague est mise en ligne et utilisable.

**Vague 1 — le cœur**
- Comptes (3 modes de connexion), rôles : élève, contributeur, établissement, modérateur, admin.
- Catalogue : recherche par examen, niveau, matière, série, année ; fiche sujet ; lecture ; PDF.
- Solde en ariary, recharge Mobile Money manuelle, achat à l'unité, abonnement.
- Espace contributeur : éditeur de sujets (texte riche + formules mathématiques), soumission,
  statistiques de ventes, demandes de retrait.
- Admin : modération, utilisateurs, validation des recharges et des retraits, réglages
  (prix, commission, IA), journal d'audit.
- **Correction IA d'une copie photographiée** : l'élève prend sa copie manuscrite en photo, l'IA la
  lit et la corrige question par question, avec une note estimée.
- Séries quotidiennes, XP (jamais achetables) et badges.

**Vague 2 — s'entraîner mieux**
- Examens blancs chronométrés, avec note et résultats détaillés.
- Tuteur IA par sujet (questions, explications pas à pas) et exercices du même type.
- Mode hors ligne : sujets achetés disponibles sans réseau, synchronisation au retour.
- Parrainage.

**Vague 3 — à plusieurs**
- Duels entre amis, salles de révision de groupe en direct.
- Espace établissement : classes, suivi des élèves, sujets en accès restreint.

## 3. Règles de conception (conservées de septembre)

- Mobile d'abord (360 × 800). Pensé pour les Android d'entrée de gamme, un réseau instable et des
  données mobiles payantes : pages légères, peu d'images, pas d'ombre, de dégradé ni de flou.
- Une seule action colorée par écran.
- Prix toujours affichés en ariary.
- Chaque écran prévoit ses états : chargement, vide, erreur, hors ligne. Hors ligne, on informe sans
  alarmer.
- Majuscule en début de phrase seulement, pas d'emoji dans l'interface, ton direct.
- Accessibilité WCAG AA : contrastes suffisants, contours visibles sur les champs et boutons.
- **Identité « Mosaïque »** (choisie le 24/11/2026 parmi trois pistes) : chaque matière a sa
  couleur, l'app est une mosaïque de tuiles qu'on remplit en progressant. Fond blanc, formes
  rondes, police Lexend. Les couleurs de matières identifient et ne servent jamais de bouton ;
  l'action principale est l'unique pastille sombre de l'écran. Détail dans `DESIGN.md`.

## 4. Architecture technique (100 % Cloudflare)

| Besoin | Choix |
|---|---|
| Application | **React Router 8** (mode framework) + `@cloudflare/vite-plugin`, sur **Workers** |
| Base de données | **D1** + Drizzle ORM, migrations avec `wrangler d1 migrations` |
| Authentification | **Better Auth** (email/mot de passe, Google, téléphone), tables dans D1 |
| Fichiers (images, PDF, photos de copies) | **R2** |
| Cache, sessions, réglages | **KV** |
| Limitation de débit | Binding **Rate Limiting** |
| IA par défaut | **Workers AI** : modèle de vision pour lire les copies, modèle de texte pour corriger, tutorer et générer. On choisit les modèles en les testant sur de vraies copies |
| Passerelle IA | **AI Gateway** devant tous les fournisseurs : cache, journaux, suivi des coûts, bascule automatique |
| Autres fournisseurs IA | Claude, OpenAI, OpenRouter, Perplexity **gardés en option** : champs de clé API et sélection depuis l'admin, désactivés par défaut |
| Recherche par le sens | **Vectorize** (« sujets qui ressemblent à celui-ci ») |
| Corrections longues | **Queues** (l'élève est prévenu quand c'est prêt) |
| Temps réel (duels, salles, notifications) | **Durable Objects** + WebSockets |
| Tâches planifiées (rappels de série, nettoyage) | **Cron Triggers** |
| Emails | Cloudflare Email Service (exige un domaine, voir §6) |
| SMS (code de connexion) | Prestataire SMS à choisir (voir §6) |
| Suivi des erreurs | Workers Observability (journaux et traces intégrés) |
| Adresse au départ | Sous-domaine gratuit `mahai.<compte>.workers.dev` |

## 5. Organisation du code

- Écraser `main` au démarrage : sauvegarde complète de l'ancien code dans
  `Desktop\mah.ai\sauvegarde-branches-2026-11-24.bundle`.
- Environnements : préproduction et production, chacun avec ses ressources D1, R2 et KV.
- Tests : Vitest dans le runtime Workers (`@cloudflare/vitest-pool-workers`), tests de bout en bout
  avec Playwright. Priorité absolue aux tests sur tout ce qui touche l'argent.
- CI GitHub Actions : lint, types, tests, puis déploiement par `wrangler deploy`.

## 6. Ce qui reste à décider ou à faire de ton côté

1. **Connexion Wrangler** : le compte n'est pas encore visible depuis ma session (jeton expiré).
   Relancer `npx wrangler login` dans PowerShell, ou me donner un jeton API Cloudflare dans une
   variable d'environnement.
2. **Domaine** : le sous-domaine `workers.dev` suffit pour démarrer, mais **l'envoi d'emails
   (vérification, mot de passe oublié) exige un domaine à toi** géré par Cloudflare. D'ici là :
   connexion Google et par téléphone, emails désactivés en préproduction.
3. **Prestataire SMS** pour les codes de connexion par téléphone (chaque SMS est payant) : à choisir.
4. **Google** : créer les identifiants OAuth dans Google Cloud Console avec l'adresse de retour du
   nouveau site.
5. **Prix** : prix d'un sujet, de l'abonnement mensuel, d'une correction IA hors abonnement ;
   contenu exact de la partie gratuite.
6. **Numéros marchands** MVola, Orange Money et Airtel Money où les utilisateurs envoient l'argent.
7. **Ancien Supabase** : avec une base vide, il ne sert plus. On le garde le temps de récupérer ce
   qui t'intéresse (contenus, comptes de test), puis on le met en pause.
8. **PR #27 et la branche `claude/loving-mccarthy-yhz98j`** : à fermer et supprimer quand on
   écrase `main` (déjà dans la sauvegarde).
9. Plan **Workers Paid** (5 $/mois) : requis pour Queues, Durable Objects avancés et des quotas
   suffisants.
