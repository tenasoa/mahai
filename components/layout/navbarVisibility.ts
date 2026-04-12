const NAVBAR_HIDDEN_PREFIXES = ["/admin", "/contributeur", "/auth"] as const;

export function shouldShowNavbar(pathname: string | null | undefined) {
  if (!pathname) {
    return true;
  }

  return !NAVBAR_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}