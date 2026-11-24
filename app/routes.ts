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
  route("api/sante", "routes/api.sante.ts"),
] satisfies RouteConfig;
