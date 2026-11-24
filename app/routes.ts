import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_app.tsx", [
    index("routes/accueil.tsx"),
    route("sujets", "routes/sujets.tsx"),
    route("corriger", "routes/corriger.tsx"),
    route("profil", "routes/profil.tsx"),
  ]),
  layout("routes/_auth.tsx", [
    route("connexion", "routes/connexion.tsx"),
    route("inscription", "routes/inscription.tsx"),
    route("confidentialite", "routes/confidentialite.tsx"),
    route("conditions", "routes/conditions.tsx"),
  ]),
  route("connexion/google", "routes/connexion.google.ts"),
  route("deconnexion", "routes/deconnexion.ts"),
  route("api/auth/*", "routes/api.auth.$.ts"),
  route("api/sante", "routes/api.sante.ts"),
] satisfies RouteConfig;
