import type { Email } from "./mime";

/*
 * Modèles d'emails. Les clients mail n'acceptent que des styles en ligne : les couleurs
 * reprennent les jetons Mosaïque (ink #17171C, ink-2 #3A3A45, soft #F4F4F6, muted #55555F).
 */

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gabarit(titre: string, paragraphes: string[], bouton: { texte: string; url: string }, pied: string) {
  const url = echapper(bouton.url);
  return `<!doctype html>
<html lang="fr"><body style="margin:0;padding:24px;background:#F4F4F6;font-family:Lexend,Arial,sans-serif;color:#17171C">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:18px;padding:28px">
<tr><td style="font-size:18px;font-weight:800;padding-bottom:20px">Mah.ai</td></tr>
<tr><td style="font-size:24px;font-weight:800;line-height:1.25;padding-bottom:12px">${echapper(titre)}</td></tr>
${paragraphes.map((p) => `<tr><td style="font-size:16px;line-height:1.5;color:#3A3A45;padding-bottom:12px">${echapper(p)}</td></tr>`).join("")}
<tr><td style="padding:12px 0 20px"><a href="${url}" style="display:inline-block;background:#17171C;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:999px">${echapper(bouton.texte)}</a></td></tr>
<tr><td style="font-size:13px;line-height:1.5;color:#55555F">${echapper(pied)}<br><br>Si le bouton ne marche pas, copie ce lien :<br><a href="${url}" style="color:#55555F;word-break:break-all">${url}</a></td></tr>
</table></td></tr></table></body></html>`;
}

export function emailReinitialisation(a: { email: string; prenom: string }, url: string): Email {
  const titre = "Choisis un nouveau mot de passe";
  const intro = `Salut ${a.prenom}, tu as demandé à changer ton mot de passe Mah.ai.`;
  const duree = "Ce lien marche pendant 1 heure et une seule fois.";
  const pied = "Tu n'as rien demandé ? Ignore cet email : ton mot de passe reste le même.";
  return {
    a: a.email,
    sujet: "Ton nouveau mot de passe Mah.ai",
    texte: `${titre}\n\n${intro}\n${duree}\n\n${url}\n\n${pied}\n`,
    html: gabarit(titre, [intro, duree], { texte: "Changer mon mot de passe", url }, pied),
  };
}

export function emailVerification(a: { email: string; prenom: string }, url: string): Email {
  const titre = "Confirme ton email";
  const intro = `Salut ${a.prenom}, bienvenue sur Mah.ai ! Un clic pour confirmer que cet email est bien le tien.`;
  const utilite = "Ça permet de récupérer ton compte si tu oublies ton mot de passe.";
  const pied = "Tu n'as pas créé de compte ? Ignore cet email.";
  return {
    a: a.email,
    sujet: "Confirme ton email Mah.ai",
    texte: `${titre}\n\n${intro}\n${utilite}\n\n${url}\n\n${pied}\n`,
    html: gabarit(titre, [intro, utilite], { texte: "Confirmer mon email", url }, pied),
  };
}
