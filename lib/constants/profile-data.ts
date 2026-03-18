
export const USER_TYPES = [
  { value: 'ETUDIANT', label: 'Étudiant' },
  { value: 'PROFESSIONNEL', label: 'Professionnel' },
  { value: 'ENSEIGNANT', label: 'Enseignant' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'AUTRE', label: 'Autre (Saisir)' }
];

export const EDUCATION_LEVELS = [
  { value: 'PRIMAIRE', label: 'Primaire' },
  { value: 'COLLEGE', label: 'Collège' },
  { value: 'LYCEE', label: 'Lycée' },
  { value: 'UNIVERSITE', label: 'Université' },
  { value: 'FACULTE', label: 'Faculté' },
  { value: 'INSTITUT', label: 'Institut' },
  { value: 'FORMATION', label: 'Formation' }
];

export const GRADE_LEVELS = [
  // Primaire
  '11EME', '10EME', '9EME', '8EME', '7EME',
  // Collège
  '6EME', '5EME', '4EME', '3EME',
  // Lycée
  'SECONDE', 'PREMIERE', 'TERMINALE',
  // Supérieur
  'L1', 'L2', 'L3', 'M1', 'M2',
  // Autre
  'AUTRE'
] as const;

export const GRADE_LEVELS_MAP = {
  PRIMAIRE: [
    { value: '11EME', label: '11ème' },
    { value: '10EME', label: '10ème' },
    { value: '9EME', label: '9ème' },
    { value: '8EME', label: '8ème' },
    { value: '7EME', label: '7ème' }
  ],
  COLLEGE: [
    { value: '6EME', label: '6ème' },
    { value: '5EME', label: '5ème' },
    { value: '4EME', label: '4ème' },
    { value: '3EME', label: '3ème' }
  ],
  LYCEE: [
    { value: 'SECONDE', label: 'Seconde' },
    { value: 'PREMIERE', label: 'Première' },
    { value: 'TERMINALE', label: 'Terminale' }
  ],
  UNIVERSITE: [
    { value: 'L1', label: 'Licence 1 (L1)' },
    { value: 'L2', label: 'Licence 2 (L2)' },
    { value: 'L3', label: 'Licence 3 (L3)' },
    { value: 'M1', label: 'Master 1 (M1)' },
    { value: 'M2', label: 'Master 2 (M2)' }
  ],
  FACULTE: [
    { value: 'L1', label: 'Licence 1 (L1)' },
    { value: 'L2', label: 'Licence 2 (L2)' },
    { value: 'L3', label: 'Licence 3 (L3)' },
    { value: 'M1', label: 'Master 1 (M1)' },
    { value: 'M2', label: 'Master 2 (M2)' }
  ],
  INSTITUT: [
    { value: 'L1', label: 'Licence 1 (L1)' },
    { value: 'L2', label: 'Licence 2 (L2)' },
    { value: 'L3', label: 'Licence 3 (L3)' },
    { value: 'M1', label: 'Master 1 (M1)' },
    { value: 'M2', label: 'Master 2 (M2)' }
  ],
  FORMATION: [
    { value: 'L1', label: 'Niveau 1' },
    { value: 'L2', label: 'Niveau 2' },
    { value: 'L3', label: 'Niveau 3' }
  ]
};

export const COMMON_SUBJECTS = [
  'Mathématiques', 'Physique-Chimie', 'SVT', 'Français', 'Anglais', 'Malagasy', 'Histoire-Géo', 'Philosophie', 'EPS'
];

export const STUDY_OBJECTIVES = [
  'Obtenir mon diplôme', 'Améliorer mes notes', 'Préparer un concours', 'Approfondir mes connaissances', 'Reconversion professionnelle'
];
