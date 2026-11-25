/** Ordres de tri du catalogue (partagés entre le serveur et la page). */
export const TRIS = ["recent", "matiere", "duree"] as const;
export type Tri = (typeof TRIS)[number];
