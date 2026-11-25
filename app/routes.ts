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
    route("sujets/:slug", "routes/sujets.$slug.tsx"),
    route("corriger", "routes/corriger.tsx"),
    route("profil", "routes/profil.tsx"),
  ]),
  layout("routes/_auth.tsx", [
    route("connexion", "routes/connexion.tsx"),
    route("inscription", "routes/inscription.tsx"),
    route("mot-de-passe-oublie", "routes/mot-de-passe-oublie.tsx"),
    route("nouveau-mot-de-passe", "routes/nouveau-mot-de-passe.tsx"),
    route("confidentialite", "routes/confidentialite.tsx"),
    route("conditions", "routes/conditions.tsx"),
  ]),
  route("admin/medias", "routes/admin.medias.ts"),
  route("medias/*", "routes/medias.$.ts"),
  route("admin", "routes/admin.tsx", [
    index("routes/admin._index.ts"),
    route("sujets", "routes/admin.sujets.tsx"),
    route("sujets/nouveau", "routes/admin.sujet.tsx", { id: "admin-sujet-nouveau" }),
    route("sujets/:id", "routes/admin.sujet.tsx", { id: "admin-sujet" }),
    route("listes", "routes/admin.listes.tsx"),
    route("images", "routes/admin.images.tsx"),
  ]),
  route("connexion/google", "routes/connexion.google.ts"),
  route("deconnexion", "routes/deconnexion.ts"),
  route("api/auth/*", "routes/api.auth.$.ts"),
  route("api/sante", "routes/api.sante.ts"),
  route("api/apercu/:slug", "routes/api.apercu.$slug.ts"),
] satisfies RouteConfig;
