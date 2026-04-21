-- =====================================================
-- MAH.AI - Seed Blog Posts
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- pour créer des articles de blog initiaux
-- =====================================================

INSERT INTO "BlogPost" (
  id, title, slug, excerpt, content, category, author_id, author_name,
  cover_image, read_time, is_published, is_featured, published_at
) VALUES
  (
    gen_random_uuid(),
    'Comment réussir son BAC de mathématiques : guide complet',
    'comment-reussir-bac-mathematiques',
    'Découvrez nos stratégies éprouvées pour exceller en mathématiques au BAC. Analyse des sujets des 5 dernières années, conseils de méthodologie et astuces pour maximiser votre note.',
    '# Introduction

Le BAC de mathématiques est souvent considéré comme l''épreuve la plus redoutée. Pourtant, avec une bonne préparation et les bonnes méthodes, il est tout à fait possible de viser l''excellence.

## Analyse des sujets récents

En analysant les sujets des 5 dernières années, nous avons identifié les thématiques les plus fréquentes :
- Algèbre : polynômes, équations différentielles
- Analyse : intégration, suites numériques
- Géométrie : espaces vectoriels, transformations
- Probabilités : lois continues, statistiques

## Méthodologie de travail

1. **Comprendre le cours** avant de faire des exercices
2. **Varier les types d''exercices** pour ne pas se spécialiser
3. **Travailler en temps limité** pour s''habituer au stress
4. **Revoir les erreurs** pour ne pas les reproduire

## Ressources Mah.AI

Notre plateforme propose des centaines de sujets corrigés par IA pour vous entraîner efficacement.',
    'conseils-bac',
    'admin',
    'Admin Mah.AI',
    null,
    8,
    true,
    true,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Nouveau : Correction IA propulsée par Perplexity',
    'nouveau-correction-ia-perplexity',
    'Notre système de correction IA utilise maintenant l''API Perplexity pour une précision améliorée de 90%. Découvrez cette innovation majeure.',
    '# Une avancée technologique majeure

Nous sommes fiers d''annoncer l''intégration de l''API Perplexity dans notre système de correction IA. Cette amélioration permet une précision de 90% dans les corrections de sujets d''examen.

## Pourquoi Perplexity ?

Perplexity est un moteur de recherche IA avancé qui :
- Comprend le contexte éducatif malgache
- Accède à des ressources pédagogiques actualisées
- Fournit des explications détaillées et pédagogiques
- S''adapte au niveau de l''élève

## Bénéfices pour les utilisateurs

- Corrections plus précises
- Explications plus détaillées
- Meilleure compréhension des erreurs
- Progression plus rapide',
    'actualites',
    'admin',
    'Admin Mah.AI',
    null,
    5,
    true,
    false,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Guide complet : Recharger vos crédits',
    'guide-recharger-credits',
    'Tout ce que vous devez savoir sur la recharge de crédits via Mobile Money (MVola, Orange, Airtel).',
    '# Comment recharger vos crédits sur Mah.AI

La recharge de crédits est simple et sécurisée grâce à notre intégration Mobile Money.

## Étapes de recharge

1. Connectez-vous à votre compte
2. Allez dans la section "Recharge"
3. Choisissez le montant à recharger
4. Sélectionnez votre opérateur (MVola, Orange, Airtel)
5. Effectuez le transfert vers notre numéro
6. Attendez la validation (généralement sous 12h)

## Opérateurs supportés

- **MVola** : 034 77 130 85
- **Orange Money** : 032 17 560 02
- **Airtel Money** : Bientôt disponible

## Sécurité

Tous les paiements sont sécurisés et tracés. En cas de problème, notre support est disponible 7j/7.',
    'tutoriel',
    'admin',
    'Admin Mah.AI',
    null,
    4,
    true,
    false,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Devenir contributeur : Guide complet',
    'devenir-contributeur-mahai',
    'Rejoignez notre communauté d''enseignants et gagnez des revenus en partageant vos sujets d''examen.',
    '# Pourquoi devenir contributeur ?

En tant qu''enseignant, vous possédez des ressources précieuses. Mah.AI vous permet de les monétiser tout en aidant des milliers d''élèves.

## Avantages

- **Revenus passifs** : Gagnez de l''argent à chaque téléchargement
- **Impact** : Aidez des élèves à réussir
- **Visibilité** : Mettez en valeur votre expertise
- **Communauté** : Rejoignez un réseau d''enseignants

## Comment ça marche ?

1. Créez votre compte contributeur
2. Uploadez vos sujets et corrections
3. Définissez votre prix par téléchargement
4. Recevez vos gains chaque mois

## Exigences

- Être enseignant certifié
- Proposer du contenu original
- Respecter les programmes officiels',
    'carriere',
    'admin',
    'Admin Mah.AI',
    null,
    6,
    true,
    false,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Stratégies pour le BEPC 2026',
    'strategies-bepc-2026',
    'Préparez-vous efficacement au BEPC avec nos conseils d''experts et nos sujets de qualité.',
    '# Le BEPC : une étape cruciale

Le Brevet d''Études du Premier Cycle est la première certification officielle. Une bonne préparation est essentielle.

## Matières clés

- **Mathématiques** : Algèbre, géométrie, statistiques
- **Français** : Grammaire, conjugaison, expression écrite
- **Histoire-Géographie** : Madagascar et le monde
- **SVT** : Biologie et géologie
- **Physique-Chimie** : Les bases

## Planning de révision

- **2 mois avant** : Révision complète du cours
- **1 mois avant** : Exercices d''application
- **2 semaines avant** : Sujets d''annales
- **1 semaine avant** : Révisions ciblées

## Ressources Mah.AI

Notre plateforme propose des centaines de sujets BEPC corrigés pour vous préparer efficacement.',
    'conseils-bepc',
    'admin',
    'Admin Mah.AI',
    null,
    5,
    true,
    false,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Histoires de succès : Nos utilisateurs témoignent',
    'histoires-succes-utilisateurs',
    'Découvrez les témoignages d''élèves qui ont réussi leurs examens grâce à Mah.AI.',
    '# Témoignages de nos utilisateurs

## Marie R., 18 ans - Admise au BAC

"Mah.AI m''a permis de progresser en mathématiques de manière spectaculaire. Les corrections détaillées m''ont aidé à comprendre mes erreurs."

## Jean-Luc M., 16 ans - BEPC avec mention

"Grâce aux sujets d''annales disponibles sur Mah.AI, je me sentais prêt le jour de l''examen. J''ai obtenu ma mention très bien !"

## Fara R., enseignante

"En tant que contributeuse, je peux partager mes ressources et aider les élèves tout en gagnant un revenu complémentaire. C''est gagnant-gagnant !"

## Rejoignez la communauté

Des milliers d''élèves utilisent déjà Mah.AI pour réussir. Pourquoi pas vous ?',
    'communaute',
    'admin',
    'Admin Mah.AI',
    null,
    8,
    true,
    false,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- Vérifier l'insertion
SELECT title, slug, category, is_published, is_featured
FROM "BlogPost"
ORDER BY "createdAt" DESC;
