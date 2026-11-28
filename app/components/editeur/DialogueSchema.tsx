import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

import { chargerExcalidraw } from "~/lib/document/charger.client";
import { lireLocal, ecrireLocal } from "~/lib/clavier";
import { FAMILLES_SYMBOLES, type FamilleSymboles } from "~/lib/document/symboles";
import { TAILLE_MAX, urlMedia } from "~/lib/medias/medias";
import { envoyerFichier } from "./blocs";

/**
 * Éditeur de schémas (Excalidraw), plein écran, avec une bibliothèque de symboles au choix
 * (électricité et logique, mécanique et champs ; la dernière choisie est retenue).
 * Le schéma est enregistré en PNG (×2) dans R2, la scène Excalidraw incluse dans le fichier :
 * « Modifier » la relit depuis l'image, sans stockage à part.
 */

export type SchemaEnCours = { cle: string | null; pos?: number };
export type SchemaEnregistre = { cle: string; largeur: number; hauteur: number };

type Module = Awaited<ReturnType<typeof chargerExcalidraw>>;

/** Trait net (pas d'effet « à main levée »), police sans empattement, grille de 20 px. */
const APPARENCE = {
  viewBackgroundColor: "#ffffff",
  currentItemRoughness: 0,
  currentItemFontFamily: 2,
  currentItemStrokeWidth: 2,
  currentItemRoundness: "sharp",
  gridModeEnabled: true,
  gridSize: 20,
  gridStep: 5,
} as const;

const CLE_FAMILLE = "mahai:schema-symboles";

const familleRetenue = (): FamilleSymboles => {
  const f = lireLocal(CLE_FAMILLE);
  return FAMILLES_SYMBOLES.some((x) => x.id === f) ? (f as FamilleSymboles) : "electricite";
};

function bibliotheque(m: Module, famille: FamilleSymboles) {
  const symboles = FAMILLES_SYMBOLES.find((f) => f.id === famille)!.symboles;
  return symboles.map((s) => ({
    id: s.id,
    status: "published" as const,
    created: 1,
    name: s.nom,
    elements: m
      .convertToExcalidrawElements(s.formes as never, { regenerateIds: true })
      .map((e) => ({ ...e, roughness: 0, groupIds: [`symbole-${s.id}`] })),
  }));
}

export function DialogueSchema({
  schema,
  onValider,
  onFermer,
}: {
  schema: SchemaEnCours | null;
  onValider: (r: SchemaEnregistre) => void;
  onFermer: () => void;
}) {
  const [module, setModule] = useState<Module | null>(null);
  const [initial, setInitial] = useState<ExcalidrawInitialDataState | null>(null);
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [famille, setFamille] = useState<FamilleSymboles>("electricite");

  useEffect(() => {
    if (!schema) {
      setInitial(null);
      setApi(null);
      setErreur(null);
      return;
    }
    let annule = false;
    const ancien = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    void (async () => {
      try {
        const m = await chargerExcalidraw();
        let scene: Pick<ExcalidrawInitialDataState, "elements" | "files"> = { elements: [], files: {} };
        if (schema.cle) {
          const fichier = await fetch(urlMedia(schema.cle)).then((r) => r.blob());
          const lu = await m.loadFromBlob(fichier, null, null);
          scene = { elements: lu.elements, files: lu.files };
        }
        if (annule) return;
        const retenue = familleRetenue();
        setFamille(retenue);
        setModule(m);
        setInitial({
          ...scene,
          libraryItems: bibliotheque(m, retenue),
          // Bibliothèque ouverte et ancrée : on enchaîne les symboles sans la rouvrir.
          appState: {
            ...APPARENCE,
            openSidebar: { name: "default", tab: "library" },
            defaultSidebarDockedPreference: true,
          },
          scrollToContent: true,
        } as ExcalidrawInitialDataState);
      } catch {
        if (!annule) setErreur("Impossible d'ouvrir ce schéma.");
      }
    })();
    return () => {
      annule = true;
      document.body.style.overflow = ancien;
    };
  }, [schema]);

  function changerFamille(f: FamilleSymboles) {
    setFamille(f);
    ecrireLocal(CLE_FAMILLE, f);
    if (module && api) void api.updateLibrary({ libraryItems: bibliotheque(module, f), merge: false, openLibraryMenu: true });
  }

  async function enregistrer() {
    if (!module || !api) return;
    const elements = api.getSceneElements();
    if (elements.length === 0) {
      setErreur("Le schéma est vide.");
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      const blob = await module.exportToBlob({
        elements,
        files: api.getFiles(),
        mimeType: "image/png",
        exportPadding: 16,
        appState: {
          ...api.getAppState(),
          exportEmbedScene: true,
          exportBackground: true,
          exportWithDarkMode: false,
          viewBackgroundColor: "#ffffff",
        },
        getDimensions: (largeur: number, hauteur: number) => ({ width: largeur * 2, height: hauteur * 2, scale: 2 }),
      });
      if (blob.size > TAILLE_MAX) throw new Error("Schéma trop grand (5 Mo au plus).");
      const image = await createImageBitmap(blob);
      const largeur = Math.round(image.width / 2);
      const hauteur = Math.round(image.height / 2);
      image.close();
      const { cle } = await envoyerFichier(blob, largeur, hauteur);
      onValider({ cle, largeur, hauteur });
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "L'enregistrement a échoué.");
    } finally {
      setEnvoi(false);
    }
  }

  if (!schema) return null;
  const nouveau = schema.pos === undefined;

  // Portail vers <body> : hors du formulaire du sujet (les boutons d'Excalidraw ne l'envoient pas).
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-schema"
      className="fixed inset-0 z-50 flex flex-col bg-surface text-ink"
    >
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-line px-4 py-2">
        <h2 id="titre-schema" className="text-lg font-extrabold">
          {nouveau ? "Nouveau schéma" : "Modifier le schéma"}
        </h2>
        <label className="flex items-center gap-2 text-sm font-medium">
          Symboles
          <select
            value={famille}
            onChange={(e) => changerFamille(e.target.value as FamilleSymboles)}
            className="h-10 rounded-xl border-2 border-line bg-surface px-2 text-sm focus:border-ink"
          >
            {FAMILLES_SYMBOLES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nom}
              </option>
            ))}
          </select>
        </label>
        <p className="hidden text-sm text-muted xl:block">Bibliothèque à droite ; fils et traits avec l'outil « Ligne ».</p>
        <span className="flex-1" />
        {erreur ? (
          <p role="alert" className="rounded-full bg-erreur px-3 py-1 text-sm font-medium">
            {erreur}
          </p>
        ) : null}
        <button type="button" onClick={onFermer} className="min-h-11 rounded-full bg-soft px-5 font-medium hover:bg-line">
          Annuler
        </button>
        <button
          type="button"
          onClick={enregistrer}
          disabled={!api || envoi}
          className="min-h-11 rounded-full bg-ink px-5 font-bold text-white hover:bg-ink-2 disabled:opacity-50"
        >
          {envoi ? "Enregistrement…" : nouveau ? "Insérer" : "Enregistrer"}
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        {module && initial ? (
          <module.Excalidraw
            initialData={initial}
            excalidrawAPI={setApi}
            langCode="fr-FR"
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                export: false,
                saveAsImage: false,
                toggleTheme: false,
                changeViewBackgroundColor: false,
              },
              tools: { image: false },
              dockedSidebarBreakpoint: 0,
            }}
          />
        ) : erreur ? null : (
          <p className="p-6 text-muted">Chargement de l'éditeur de schémas…</p>
        )}
      </div>
    </div>,
    document.body,
  );
}
