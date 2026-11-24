/** N'accepte que des chemins internes, pour éviter les redirections vers un autre site. */
export function cheminSur(suite: string | null | undefined, defaut = "/profil") {
  if (!suite || !suite.startsWith("/") || suite.startsWith("//") || suite.startsWith("/\\")) {
    return defaut;
  }
  return suite;
}
