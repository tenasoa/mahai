
export interface RegionInfo {
  name: string;
  districts: string[];
}

export const MADAGASCAR_REGIONS: RegionInfo[] = [
  {
    name: "Alaotra-Mangoro",
    districts: ["Ambatondrazaka", "Amparafaravola", "Andilamena", "Anosibe An'ala", "Moramanga"]
  },
  {
    name: "Amoron'i Mania",
    districts: ["Ambatofinandrahana", "Ambositra", "Fandriana", "Manandriana"]
  },
  {
    name: "Analamanga",
    districts: ["Antananarivo Atsimondrano", "Antananarivo Avaradrano", "Antananarivo Renivohitra", "Ambohidratrimo", "Andramasina", "Anjozorobe", "Ankazobe", "Manjakandriana"]
  },
  {
    name: "Analanjirofo",
    districts: ["Fenerive Est", "Mananara Nord", "Maroantsetra", "Nosy Boraha", "Soanierana Ivongo", "Vavatenina"]
  },
  {
    name: "Androy",
    districts: ["Ambovombe-Androy", "Bekily", "Beloha", "Tsiombe"]
  },
  {
    name: "Anosy",
    districts: ["Amboasary Sud", "Betroka", "Taolagnaro"]
  },
  {
    name: "Atsimo-Andrefana",
    districts: ["Ampanihy", "Ankazoabo", "Benenitra", "Beroroha", "Betioky Sud", "Morombe", "Sakaraha", "Toliara I", "Toliara II"]
  },
  {
    name: "Atsimo-Atsinanana",
    districts: ["Befotaka", "Farafangana", "Midongy Sud", "Vangaindrano", "Vondrozo"]
  },
  {
    name: "Atsinanana",
    districts: ["Antanambao Manampotsy", "Mahanoro", "Marolambo", "Toamasina I", "Toamasina II", "Vatomandry", "Vohibinany"]
  },
  {
    name: "Betsiboka",
    districts: ["Kandreho", "Maevatanana", "Tsaratanana"]
  },
  {
    name: "Boeny",
    districts: ["Ambato-Boeny", "Mahajanga I", "Mahajanga II", "Marovoay", "Mitsinjo", "Soalala"]
  },
  {
    name: "Bongolava",
    districts: ["Fenoarivobe", "Tsiroanomandidy"]
  },
  {
    name: "Diana",
    districts: ["Antsiranana I", "Antsiranana II", "Ambilobe", "Ambanja", "Nosy Be"]
  },
  {
    name: "Haute Matsiatra",
    districts: ["Ambalavao", "Ambohimahasoa", "Fianarantsoa", "Ikalamavony", "Isandra", "Lalangina", "Vohibato"]
  },
  {
    name: "Ihorombe",
    districts: ["Iakora", "Ihosy", "Ivohibe"]
  },
  {
    name: "Itasy",
    districts: ["Arivonimamo", "Miarinarivo", "Soavinandriana"]
  },
  {
    name: "Melaky",
    districts: ["Ambatomainty", "Antsalova", "Besalampy", "Maintirano", "Morafenobe"]
  },
  {
    name: "Menabe",
    districts: ["Belo sur Tsiribihina", "Mahabo", "Manja", "Miandrivazo", "Morondava"]
  },
  {
    name: "Sava",
    districts: ["Andapa", "Antalaha", "Sambava", "Vohemar"]
  },
  {
    name: "Sofia",
    districts: ["Analalava", "Antsohihy", "Bealanana", "Befandriana Nord", "Boriziny-Vaovao", "Mampikony", "Mandritsara"]
  },
  {
    name: "Vakinankaratra",
    districts: ["Ambatolampy", "Antanifotsy", "Antsirabe I", "Antsirabe II", "Betafo", "Faratsiho", "Mandoto"]
  },
  {
    name: "Vatovavy",
    districts: ["Ifanadiana", "Mananjary", "Nosy Varika"]
  },
  {
    name: "Fitovinany",
    districts: ["Ikongo", "Manakara", "Vohipeno"]
  }
];

export const getRegions = () => MADAGASCAR_REGIONS.map(r => r.name);

export const getDistrictsByRegion = (regionName: string) => {
  const region = MADAGASCAR_REGIONS.find(r => r.name === regionName);
  return region ? region.districts : [];
};
