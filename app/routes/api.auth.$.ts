import type { Route } from "./+types/api.auth.$";
import { getAuth } from "~/lib/auth/auth.server";

/** Points d'entrée HTTP de Better Auth (/api/auth/*). */
export function loader({ request }: Route.LoaderArgs) {
  return getAuth().handler(request);
}

export function action({ request }: Route.ActionArgs) {
  return getAuth().handler(request);
}
