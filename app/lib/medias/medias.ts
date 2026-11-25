/**
 * Vérification des images envoyées (sans accès à R2 : testable seul).
 * Le type est déduit des premiers octets du fichier, jamais du nom ni de l'en-tête envoyé.
 */

export const TAILLE_MAX = 5 * 1024 * 1024;

const TYPES = [
  { ext: "png", type: "image/png", test: (o: Uint8Array) => o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4e && o[3] === 0x47 },
  { ext: "jpg", type: "image/jpeg", test: (o: Uint8Array) => o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff },
  {
    ext: "webp",
    type: "image/webp",
    test: (o: Uint8Array) =>
      String.fromCharCode(...o.slice(0, 4)) === "RIFF" && String.fromCharCode(...o.slice(8, 12)) === "WEBP",
  },
  { ext: "gif", type: "image/gif", test: (o: Uint8Array) => String.fromCharCode(...o.slice(0, 4)) === "GIF8" },
] as const;

export type TypeImage = { ext: string; type: string };

/** Type réel d'une image d'après ses premiers octets, ou `null` si ce n'est pas une image acceptée. */
export function typeImage(debut: Uint8Array): TypeImage | null {
  const t = TYPES.find((x) => x.test(debut));
  return t ? { ext: t.ext, type: t.type } : null;
}

/** Adresse publique d'un fichier à partir de sa clé R2. */
export const urlMedia = (cle: string) => `/medias/${cle}`;
