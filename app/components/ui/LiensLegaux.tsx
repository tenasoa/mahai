import { Link } from "react-router";

/** Liens vers les pages légales (exigés par Google sur la page d'accueil). */
export function LiensLegaux({ intro }: { intro?: string }) {
  return (
    <p className="text-center text-xs leading-relaxed text-muted">
      {intro ? `${intro} ` : null}
      <Link to="/conditions" className="underline underline-offset-4">
        Conditions d'utilisation
      </Link>
      {" · "}
      <Link to="/confidentialite" className="underline underline-offset-4">
        Confidentialité
      </Link>
    </p>
  );
}
