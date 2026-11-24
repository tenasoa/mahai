/**
 * Construction d'un email MIME (texte + HTML, UTF-8) pour l'API Gmail.
 * Fonctions pures, testées sans le runtime Workers.
 */

export type Email = {
  a: string;
  sujet: string;
  texte: string;
  html: string;
};

const CRLF = "\r\n";

export function base64Utf8(texte: string): string {
  let s = "";
  for (const b of new TextEncoder().encode(texte)) s += String.fromCharCode(b);
  return btoa(s);
}

export function base64Url(texte: string): string {
  return base64Utf8(texte).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** En-tête encodé RFC 2047 (accents dans le sujet ou le nom). */
export function enteteUtf8(texte: string): string {
  return /^[\x20-\x7e]*$/.test(texte) ? texte : `=?UTF-8?B?${base64Utf8(texte)}?=`;
}

/** Corps base64 découpé en lignes de 76 caractères. */
function corpsBase64(texte: string): string {
  return base64Utf8(texte).replace(/.{76}(?=.)/g, `$&${CRLF}`);
}

/** Refuse tout retour à la ligne dans un en-tête (injection d'en-têtes). */
function sansRetour(valeur: string, champ: string): string {
  if (/[\r\n]/.test(valeur)) throw new Error(`Retour à la ligne interdit dans ${champ}`);
  return valeur;
}

export function construireMime(
  email: Email,
  expediteur: { nom: string; adresse: string },
  frontiere = `mahai-${crypto.randomUUID()}`,
): string {
  const lignes = [
    `From: ${enteteUtf8(sansRetour(expediteur.nom, "From"))} <${sansRetour(expediteur.adresse, "From")}>`,
    `To: ${sansRetour(email.a, "To")}`,
    `Subject: ${enteteUtf8(sansRetour(email.sujet, "Subject"))}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${frontiere}"`,
    "",
    `--${frontiere}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    corpsBase64(email.texte),
    `--${frontiere}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    corpsBase64(email.html),
    `--${frontiere}--`,
    "",
  ];
  return lignes.join(CRLF);
}
