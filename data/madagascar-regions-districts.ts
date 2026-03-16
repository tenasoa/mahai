// Madagascar Regions and Districts Configuration
// Source: Administrative divisions of Madagascar
// Last updated: 2026-03-16

export interface District {
  name: string;
  code: string;
}

export interface Region {
  name: string;
  code: string;
  districts: District[];
}

export const madagascarRegions: Region[] = [
  {
    name: "Analamanga",
    code: "T",
    districts: [
      { name: "Antananarivo Renivohitra", code: "T-A" },
      { name: "Antananarivo Atsimondrano", code: "T-B" },
      { name: "Ambohidratrimo", code: "T-C" },
      { name: "Andramasina", code: "T-D" },
      { name: "Anjozorobe", code: "T-E" },
      { name: "Ankazobe", code: "T-F" },
      { name: "Arivonimamo", code: "T-G" },
      { name: "Miarinarivo", code: "T-H" },
      { name: "Manjakandriana", code: "T-I" }
    ]
  },
  {
    name: "Anosy",
    code: "D",
    districts: [
      { name: "Tôlanaro", code: "D-A" },
      { name: "Amboasary Sud", code: "D-B" },
      { name: "Betroka", code: "D-C" }
    ]
  },
  {
    name: "Androy",
    code: "F",
    districts: [
      { name: "Ambovombe", code: "F-A" },
      { name: "Bekily", code: "F-B" },
      { name: "Beloha", code: "F-C" },
      { name: "Tsihombe", code: "F-D" }
    ]
  },
  {
    name: "Atsimo-Andrefana",
    code: "G",
    districts: [
      { name: "Toliara I", code: "G-A" },
      { name: "Toliara II", code: "G-B" },
      { name: "Ampanihy", code: "G-C" },
      { name: "Benenitra", code: "G-D" },
      { name: "Betioky", code: "G-E" },
      { name: "Beroroha", code: "G-F" },
      { name: "Morombe", code: "G-G" },
      { name: "Morondava", code: "G-H" },
      { name: "Sakaraha", code: "G-I" }
    ]
  },
  {
    name: "Atsimo-Atsinanana",
    code: "H",
    districts: [
      { name: "Farafangana", code: "H-A" },
      { name: "Vangaindrano", code: "H-B" },
      { name: "Vondrozo", code: "H-C" },
      { name: "Midongy", code: "H-D" },
      { name: "Befotaka", code: "H-E" }
    ]
  },
  {
    name: "Alaotra-Mangoro",
    code: "M",
    districts: [
      { name: "Ambatondrazaka", code: "M-A" },
      { name: "Amparafaravola", code: "M-B" },
      { name: "Andilamena", code: "M-C" },
      { name: "Anosibe An'ala", code: "M-D" },
      { name: "Moramanga", code: "M-E" }
    ]
  },
  {
    name: "Amoron'i Mania",
    code: "J",
    districts: [
      { name: "Ambatofinandrahana", code: "J-A" },
      { name: "Ambositra", code: "J-B" },
      { name: "Fandriana", code: "J-C" },
      { name: "Manandriana", code: "J-D" }
    ]
  },
  {
    name: "Boeny",
    code: "K",
    districts: [
      { name: "Mahajanga I", code: "K-A" },
      { name: "Mahajanga II", code: "K-B" },
      { name: "Ambato-Boeni", code: "K-C" },
      { name: "Marovoay", code: "K-D" },
      { name: "Mitsinjo", code: "K-E" },
      { name: "Soalala", code: "K-F" }
    ]
  },
  {
    name: "Betsiboka",
    code: "L",
    districts: [
      { name: "Maevatanana", code: "L-A" },
      { name: "Kandreho", code: "L-B" }
    ]
  },
  {
    name: "Bongolava",
    code: "N",
    districts: [
      { name: "Fenoarivobe", code: "N-A" },
      { name: "Tsiroanomandidy", code: "N-B" }
    ]
  },
  {
    name: "Diana",
    code: "P",
    districts: [
      { name: "Antsiranana I", code: "P-A" },
      { name: "Antsiranana II", code: "P-B" },
      { name: "Ambilobe", code: "P-C" },
      { name: "Ambanja", code: "P-D" },
      { name: "Sambava", code: "P-E" },
      { name: "Vohemar", code: "P-F" }
    ]
  },
  {
    name: "Haute Matsiatra",
    code: "O",
    districts: [
      { name: "Fianarantsoa I", code: "O-A" },
      { name: "Fianarantsoa II", code: "O-B" },
      { name: "Ambalavao", code: "O-C" },
      { name: "Ambohimahasoa", code: "O-D" },
      { name: "Fianarantsoa III", code: "O-E" },
      { name: "Ikalamavony", code: "O-F" }
    ]
  },
  {
    name: "Ihorombe",
    code: "R",
    districts: [
      { name: "Ihosy", code: "R-A" },
      { name: "Iakora", code: "R-B" },
      { name: "Ivohibe", code: "R-C" }
    ]
  },
  {
    name: "Itasy",
    code: "Q",
    districts: [
      { name: "Miarinarivo", code: "Q-A" },
      { name: "Arivonimamo", code: "Q-B" },
      { name: "Soavinandriana", code: "Q-C" }
    ]
  },
  {
    name: "Melaky",
    code: "S",
    districts: [
      { name: "Maintirano", code: "S-A" },
      { name: "Besalampy", code: "S-B" },
      { name: "Morafenobe", code: "S-C" }
    ]
  },
  {
    name: "Menabe",
    code: "T",
    districts: [
      { name: "Morondava", code: "T-A" },
      { name: "Mahabo", code: "T-B" },
      { name: "Manja", code: "T-C" },
      { name: "Miandrivazo", code: "T-D" }
    ]
  },
  {
    name: "Sofia",
    code: "U",
    districts: [
      { name: "Antsohihy", code: "U-A" },
      { name: "Bealanana", code: "U-B" },
      { name: "Befandriana Nord", code: "U-C" },
      { name: "Boriziny", code: "U-D" },
      { name: "Mandritsara", code: "U-E" },
      { name: "Port-Bergé", code: "U-F" }
    ]
  },
  {
    name: "Sava",
    code: "V",
    districts: [
      { name: "Sambava", code: "V-A" },
      { name: "Andapa", code: "V-B" },
      { name: "Antalaha", code: "V-C" },
      { name: "Vohemar", code: "V-D" }
    ]
  },
  {
    name: "Vakinankaratra",
    code: "W",
    districts: [
      { name: "Antsirabe I", code: "W-A" },
      { name: "Antsirabe II", code: "W-B" },
      { name: "Betafo", code: "W-C" },
      { name: "Ambatolampy", code: "W-D" },
      { name: "Faratsiho", code: "W-E" },
      { name: "Mandoto", code: "W-F" }
    ]
  },
  {
    name: "Vatovavy-Fitovinany",
    code: "X",
    districts: [
      { name: "Manakara", code: "X-A" },
      { name: "Mananjary", code: "X-B" },
      { name: "Nosy Varika", code: "X-C" },
      { name: "Vohipeno", code: "X-D" },
      { name: "Ifanadiana", code: "X-E" }
    ]
  }
];

// Helper functions for region/district operations
export const getRegionByName = (regionName: string): Region | undefined => {
  return madagascarRegions.find(region => 
    region.name.toLowerCase() === regionName.toLowerCase()
  );
};

export const getDistrictsByRegion = (regionName: string): District[] => {
  const region = getRegionByName(regionName);
  return region ? region.districts : [];
};

export const getAllRegionNames = (): string[] => {
  return madagascarRegions.map(region => region.name);
};

export const getAllDistrictNames = (): string[] => {
  return madagascarRegions.flatMap(region => region.districts.map(district => district.name));
};

// Education level configurations
export const educationLevels = [
  { value: 'PRIMAIRE', label: 'Primaire' },
  { value: 'COLLEGE', label: 'Collège' },
  { value: 'LYCEE', label: 'Lycée' },
  { value: 'UNIVERSITE', label: 'Université/Faculté/Institut/Formation' }
];

export const gradeLevels = {
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
    { value: 'L1', label: 'L1' },
    { value: 'L2', label: 'L2' },
    { value: 'L3', label: 'L3' },
    { value: 'M1', label: 'M1' },
    { value: 'M2', label: 'M2' }
  ]
};

// Baccalauréat series (for LYCEE level)
export const bacSeries = [
  { value: 'A1', label: 'Série A1' },
  { value: 'A2', label: 'Série A2' },
  { value: 'B', label: 'Série B' },
  { value: 'C', label: 'Série C' },
  { value: 'D', label: 'Série D' },
  { value: 'L', label: 'Série L' },
  { value: 'S', label: 'Série S' },
  { value: 'OSI', label: 'Série OSI' }
];

// User types
export const userTypes = [
  { value: 'ETUDIANT', label: 'Étudiant' },
  { value: 'PROFESSIONNEL', label: 'Professionnel' },
  { value: 'ENSEIGNANT', label: 'Enseignant' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'AUTRE', label: 'Autre' }
];

// Common subjects for preferences
export const commonSubjects = [
  'Mathématiques',
  'Physique-Chimie',
  'Sciences de la Vie et de la Terre',
  'Histoire-Géographie',
  'Français',
  'Anglais',
  'Philosophie',
  'Économie',
  'Management',
  'Informatique',
  'Comptabilité',
  'Droit'
];

// Study objectives
export const studyObjectives = [
  'Réussir le BAC',
  'Réussir le BEPC',
  'Réussir le CEPE',
  'Préparer un concours',
  'Améliorer mes notes',
  'Approfondir mes connaissances',
  'Obtenir une bourse',
  'Préparer mes études supérieures'
];
