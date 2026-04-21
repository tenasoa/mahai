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
    '<h2>Introduction</h2>
<p>Le BAC de mathématiques est souvent considéré comme l''épreuve la plus redoutée. Pourtant, avec une bonne préparation et les bonnes méthodes, il est tout à fait possible de viser l''excellence et d''obtenir une mention.</p>

<h2>Analyse des sujets récents</h2>
<p>En analysant les sujets des 5 dernières années, nous avons identifié les thématiques les plus fréquentes qui tombent presque à chaque session :</p>
<ul>
  <li><strong>Algèbre</strong> : polynômes complexes, équations différentielles</li>
  <li><strong>Analyse</strong> : intégration, étude de suites numériques et de fonctions logarithmiques</li>
  <li><strong>Géométrie</strong> : espaces vectoriels, transformations dans le plan</li>
  <li><strong>Probabilités</strong> : lois continues, statistiques et probabilités conditionnelles</li>
</ul>

<blockquote>
  "Le secret n''est pas de tout savoir par cœur, mais de comprendre la logique derrière chaque théorème pour pouvoir l''appliquer à n''importe quel problème."
</blockquote>

<h2>Méthodologie de travail</h2>
<ol>
  <li><strong>Comprendre le cours</strong> avant de faire des exercices : un théorème incompris est inutile.</li>
  <li><strong>Varier les types d''exercices</strong> pour ne pas se spécialiser sur un seul type de problème.</li>
  <li><strong>Travailler en temps limité</strong> pour s''habituer au stress de l''examen (essayez de faire un problème en 1 heure).</li>
  <li><strong>Revoir systématiquement ses erreurs</strong> pour ne jamais les reproduire le jour J.</li>
</ol>

<img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Mathématiques et calculs" />

<h2>Ressources Mah.AI</h2>
<p>Notre plateforme propose des centaines de sujets corrigés par notre Intelligence Artificielle pour vous entraîner efficacement. Rejoignez dès maintenant les milliers d''élèves qui préparent leur réussite !</p>',
    'conseils-bac',
    (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1),
    'Admin Mah.AI',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    8,
    true,
    true,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Nouveau : Correction IA propulsée par des Modèles Avancés',
    'nouveau-correction-ia-avancee',
    'Notre système de correction IA utilise maintenant des technologies de pointe pour une précision améliorée de 90%. Découvrez cette innovation majeure.',
    '<h2>Une avancée technologique majeure</h2>
<p>Nous sommes fiers d''annoncer l''intégration de nouveaux moteurs d''Intelligence Artificielle dans notre système de correction. Cette amélioration permet une précision de <strong>90%</strong> dans les corrections de sujets d''examen complexes.</p>

<h3>Pourquoi cette nouvelle technologie ?</h3>
<p>Nos nouveaux modèles d''IA avancés ont été entraînés spécifiquement pour :</p>
<ul>
  <li>Comprendre parfaitement le <strong>contexte éducatif malgache</strong>.</li>
  <li>Accéder à des ressources pédagogiques et des barèmes de correction actualisés.</li>
  <li>Fournir des explications détaillées et extrêmement pédagogiques, étape par étape.</li>
  <li>S''adapter au niveau de l''élève pour ne pas le décourager.</li>
</ul>

<blockquote>
  "C''est comme avoir un professeur particulier disponible 24h/24 et 7j/7, prêt à vous expliquer vos erreurs avec une patience infinie."
</blockquote>

<img src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Technologie IA" />

<h2>Bénéfices pour les utilisateurs</h2>
<ol>
  <li>Des corrections beaucoup plus précises et fiables.</li>
  <li>Des explications détaillées pour chaque point perdu.</li>
  <li>Une meilleure compréhension de vos propres erreurs de raisonnement.</li>
  <li>Une progression fulgurante dans vos révisions.</li>
</ol>',
    'actualites',
    (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1),
    'Admin Mah.AI',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
    '<h2>Comment recharger vos crédits sur Mah.AI</h2>
<p>La recharge de crédits est simple, ultra rapide et <strong>100% sécurisée</strong> grâce à notre intégration directe avec les principaux opérateurs Mobile Money de Madagascar.</p>

<h3>Étapes de recharge pas à pas</h3>
<ol>
  <li>Connectez-vous à votre compte Mah.AI.</li>
  <li>Allez dans votre espace profil et cliquez sur le bouton <strong>Recharger</strong>.</li>
  <li>Choisissez le montant ou le pack de crédits que vous souhaitez acheter.</li>
  <li>Sélectionnez votre opérateur préféré (MVola, Orange Money, Airtel Money).</li>
  <li>Effectuez le transfert vers notre numéro affiché à l''écran avec la référence demandée.</li>
  <li>Vos crédits sont validés et ajoutés à votre compte (généralement en moins de 10 minutes).</li>
</ol>

<blockquote>
  Astuce : Conservez toujours le SMS de confirmation de votre opérateur jusqu''à ce que les crédits apparaissent sur votre compte !
</blockquote>

<h2>Opérateurs supportés</h2>
<ul>
  <li><strong>MVola</strong> : Disponible 24/7</li>
  <li><strong>Orange Money</strong> : Disponible 24/7</li>
  <li><strong>Airtel Money</strong> : Disponible 24/7</li>
</ul>

<img src="https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Paiement mobile" />

<h2>Sécurité absolue</h2>
<p>Tous les paiements sont sécurisés et tracés dans notre base de données. En cas du moindre problème, notre support technique est disponible 7j/7 pour vous assister rapidement.</p>',
    'tutoriel',
    (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1),
    'Admin Mah.AI',
    'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
    '<h2>Pourquoi devenir contributeur ?</h2>
<p>En tant qu''enseignant ou professionnel de l''éducation, vous possédez des ressources intellectuelles précieuses. <strong>Mah.AI</strong> vous permet de monétiser vos sujets d''examen tout en aidant des milliers d''élèves malgaches à réussir.</p>

<h3>Vos avantages exclusifs</h3>
<ul>
  <li><strong>Revenus passifs attractifs</strong> : Gagnez de l''argent à chaque fois qu''un élève télécharge l''un de vos sujets (jusqu''à 90% de commission).</li>
  <li><strong>Impact national</strong> : Aidez des élèves venant de toutes les régions de Madagascar à accéder à une éducation de qualité.</li>
  <li><strong>Visibilité et Prestigie</strong> : Mettez en valeur votre expertise et devenez un professeur reconnu sur la plateforme.</li>
  <li><strong>Communauté d''élite</strong> : Rejoignez un réseau exclusif d''enseignants passionnés.</li>
</ul>

<blockquote>
  "Depuis que je partage mes sujets sur Mah.AI, j''ai non seulement un revenu complémentaire stable, mais j''ai aussi l''impression de participer à l''amélioration du niveau éducatif de tout le pays."
</blockquote>

<img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Enseignant et tableau" />

<h2>Comment ça marche ?</h2>
<ol>
  <li>Créez votre compte et remplissez le formulaire de candidature contributeur.</li>
  <li>Une fois validé, uploadez vos sujets officiels et leurs corrections détaillées.</li>
  <li>L''équipe Mah.AI valide la qualité de votre contenu.</li>
  <li>Vous recevez vos gains chaque mois directement par Mobile Money !</li>
</ol>

<h2>Critères d''éligibilité</h2>
<p>Pour garantir la qualité de la plateforme, nous demandons à nos contributeurs d''être des <strong>enseignants certifiés</strong> ou des étudiants en fin de cycle, de proposer un contenu strictement original, et de respecter à la lettre les programmes officiels de l''Éducation Nationale Malgache.</p>',
    'carriere',
    (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1),
    'Admin Mah.AI',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
    '<h2>Le BEPC : une étape cruciale</h2>
<p>Le Brevet d''Études du Premier Cycle est la première certification officielle majeure pour un élève malgache. Une bonne préparation n''est pas seulement recommandée, elle est absolument essentielle pour s''assurer une place au lycée.</p>

<h3>Les matières clés à maîtriser</h3>
<ul>
  <li><strong>Mathématiques</strong> : Algèbre de base, géométrie plane, et statistiques simples. Ne négligez pas les théorèmes classiques (Thalès, Pythagore).</li>
  <li><strong>Français</strong> : Grammaire stricte, conjugaison, et surtout la méthodologie de l''expression écrite.</li>
  <li><strong>Histoire-Géographie</strong> : Connaître l''histoire de Madagascar et les grands enjeux géographiques mondiaux.</li>
  <li><strong>SVT</strong> : Biologie humaine, géologie et environnement.</li>
  <li><strong>Physique-Chimie</strong> : Les bases de la mécanique et des réactions chimiques.</li>
</ul>

<blockquote>
  Le secret pour le BEPC est de ne faire aucune impasse. Une note catastrophique dans une matière peut difficilement être rattrapée par les autres.
</blockquote>

<img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Étudiant au bureau" />

<h2>Le planning de révision idéal</h2>
<ol>
  <li><strong>2 mois avant</strong> : Révision complète et méthodique de tous les cours de l''année. Fiches de synthèse obligatoires.</li>
  <li><strong>1 mois avant</strong> : Exercices d''application pour vérifier la bonne compréhension des fiches.</li>
  <li><strong>2 semaines avant</strong> : Sujets d''annales chronométrés. C''est la phase la plus importante !</li>
  <li><strong>1 semaine avant</strong> : Révisions ciblées uniquement sur vos points faibles et repos psychologique.</li>
</ol>

<h2>Ressources Mah.AI</h2>
<p>Notre plateforme propose des centaines de sujets BEPC corrigés pour vous préparer efficacement. Bonne chance à tous les candidats 2026 !</p>',
    'conseils-bepc',
    (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1),
    'Admin Mah.AI',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
    '<h2>Témoignages de nos utilisateurs</h2>
<p>Rien ne nous rend plus fiers que de voir nos utilisateurs accomplir leurs rêves académiques. Voici quelques histoires de succès de la session précédente.</p>

<h3>Marie R., 18 ans - Admise au BAC Scientifique</h3>
<blockquote>
  "Mah.AI m''a permis de progresser en mathématiques de manière spectaculaire. Les corrections détaillées de l''Intelligence Artificielle m''ont aidé à comprendre mes erreurs à mon propre rythme, sans avoir honte de poser des questions."
</blockquote>

<h3>Jean-Luc M., 16 ans - BEPC avec Mention Très Bien</h3>
<blockquote>
  "Grâce aux sujets d''annales disponibles sur Mah.AI, je me sentais parfaitement prêt le jour de l''examen. Je connaissais déjà la structure des épreuves. J''ai obtenu ma mention très bien et je rentre dans le lycée de mes rêves !"
</blockquote>

<img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Étudiants célébrant" />

<h3>Fara R., Enseignante et Contributeuse</h3>
<blockquote>
  "En tant que contributeuse depuis le début de l''année, je peux partager mes ressources pédagogiques et aider des élèves de tout Madagascar tout en gagnant un revenu complémentaire très appréciable. C''est un système gagnant-gagnant exceptionnel !"
</blockquote>

<h2>Rejoignez la communauté de l''excellence</h2>
<p>Des milliers d''élèves utilisent déjà <strong>Mah.AI</strong> pour assurer leur réussite aux examens nationaux. N''attendez plus la veille des épreuves : inscrivez-vous aujourd''hui et commencez à préparer votre avenir !</p>',
    'communaute',
    (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1),
    'Admin Mah.AI',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
