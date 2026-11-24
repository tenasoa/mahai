/**
 * Hachage des mots de passe avec PBKDF2-SHA256 (WebCrypto natif).
 *
 * Pourquoi pas le scrypt par défaut de Better Auth : il est écrit en JavaScript et coûte
 * beaucoup de temps CPU, ce qui dépasse vite les limites d'un Worker. PBKDF2 est exécuté
 * nativement par le runtime. Workers plafonne PBKDF2 à 100 000 itérations : on prend ce
 * maximum.
 *
 * Format stocké : pbkdf2-sha256$<itérations>$<sel base64url>$<hash base64url>
 */

const ALGO = "pbkdf2-sha256";
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

function versBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function depuisBase64Url(texte: string): Uint8Array {
  const b64 = texte.replace(/-/g, "+").replace(/_/g, "/");
  const s = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

async function deriver(
  motDePasse: string,
  sel: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const cle = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(motDePasse.normalize("NFKC")),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sel as BufferSource, iterations },
    cle,
    KEY_BYTES * 8,
  );
  return new Uint8Array(bits);
}

/** Comparaison en temps constant. */
function egaux(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function hashPassword(motDePasse: string): Promise<string> {
  const sel = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriver(motDePasse, sel, ITERATIONS);
  return `${ALGO}$${ITERATIONS}$${versBase64Url(sel)}$${versBase64Url(hash)}`;
}

export async function verifyPassword({
  hash,
  password,
}: {
  hash: string;
  password: string;
}): Promise<boolean> {
  const morceaux = hash.split("$");
  if (morceaux.length !== 4 || morceaux[0] !== ALGO) return false;
  const iterations = Number(morceaux[1]);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > ITERATIONS) {
    return false;
  }
  try {
    const sel = depuisBase64Url(morceaux[2]!);
    const attendu = depuisBase64Url(morceaux[3]!);
    const calcule = await deriver(password, sel, iterations);
    return egaux(calcule, attendu);
  } catch {
    return false;
  }
}
