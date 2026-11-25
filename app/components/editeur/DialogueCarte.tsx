import { useEffect, useRef, useState, type PointerEvent } from "react";

import { CarteDessin } from "~/components/document/CarteDessin";
import {
  CARTE_DEFAUT,
  COULEURS_CARTE,
  LIMITES_CARTE,
  MIN_POINTS,
  MOTIFS,
  NOMS_GENRES_CARTE,
  NOMS_STYLES,
  STYLES_NOMS,
  echangerEntrees,
  normaliserCarte,
  retirerEntree,
  type Carte,
  type GenreCarte,
  type GenreTrace,
  type StyleNom,
} from "~/lib/document/carte";
import { envoyerImage } from "./blocs";
import { DialogueDessin } from "./DialogueDessin";
import { Section, Supprimer, champ, ligne, petit } from "./DialogueGraphique";

/**
 * Éditeur d'une carte à légender : fond de carte, légende (chaque ligne définit un figuré),
 * noms de lieux. On choisit un figuré puis on clique sur la carte : un clic par point, et
 * « Terminer » (ou double-clic) pour une zone, une ligne ou une flèche. Les points se déplacent
 * en les faisant glisser ; un clic sur un point choisit son figuré (pour le supprimer).
 */

export type CarteEnCours = { attrs: Record<string, unknown> | null; pos?: number };

/** Outil actif : une ligne de la légende, ou la pose d'un nom de lieu. */
type Actif = number | "nom" | null;
type Glisse = { quoi: "trace" | "nom"; i: number; k: number; bouge: boolean };

const AJOUTS: GenreCarte[] = ["zone", "ligne", "fleche", "point", "titre"];
const PROCHE = 0.006;

export function DialogueCarte({
  carte,
  onValider,
  onFermer,
}: {
  carte: CarteEnCours | null;
  onValider: (c: Carte) => void;
  onFermer: () => void;
}) {
  const [c, setC] = useState<Carte>(CARTE_DEFAUT);
  const [actif, setActif] = useState<Actif>(null);
  const [enCours, setEnCours] = useState<number | null>(null);
  const [choisi, setChoisi] = useState<number | null>(null);
  const [glisse, setGlisse] = useState<Glisse | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [nomNeuf, setNomNeuf] = useState<number | null>(null);
  const conteneur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!carte) return;
    const depart = carte.attrs ? normaliserCarte(carte.attrs) : CARTE_DEFAUT;
    setC(depart);
    setActif(depart.legende.findIndex((e) => e.genre !== "titre") >= 0 ? depart.legende.findIndex((e) => e.genre !== "titre") : null);
    setEnCours(null);
    setChoisi(null);
    setErreur("");
  }, [carte]);

  // Ferme le tracé en cours : points doublés retirés (double-clic), supprimé s'il est incomplet.
  function terminer() {
    if (enCours === null) return;
    setC((a) => {
      const t = a.traces[enCours];
      if (!t) return a;
      const pts: number[] = [];
      for (let k = 0; k + 1 < t.pts.length; k += 2) {
        const n = pts.length;
        if (n && Math.hypot(t.pts[k]! - pts[n - 2]!, t.pts[k + 1]! - pts[n - 1]!) < PROCHE) continue;
        pts.push(t.pts[k]!, t.pts[k + 1]!);
      }
      const g = a.legende[t.e]!.genre as GenreTrace;
      return pts.length / 2 >= MIN_POINTS[g]
        ? { ...a, traces: a.traces.map((x, i) => (i === enCours ? { ...x, pts } : x)) }
        : { ...a, traces: a.traces.filter((_, i) => i !== enCours) };
    });
    setEnCours(null);
  }

  const choisirOutil = (o: Actif) => {
    terminer();
    setChoisi(null);
    setActif(o);
    setErreur("");
  };

  const position = (e: PointerEvent) => {
    const r = conteneur.current!.getBoundingClientRect();
    const f = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 10_000) / 10_000;
    return [f((e.clientX - r.left) / r.width), f((e.clientY - r.top) / r.height)] as const;
  };

  function surAppui(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || glisse) return;
    const [x, y] = position(e);
    setChoisi(null);
    if (actif === "nom") {
      if (c.noms.length >= LIMITES_CARTE.noms) return;
      setNomNeuf(c.noms.length);
      setC((a) => ({ ...a, noms: [...a.noms, { x, y, texte: "", style: "lieu" }] }));
      return;
    }
    const entree = actif === null ? undefined : c.legende[actif];
    if (actif === null || !entree || entree.genre === "titre") {
      setErreur("Choisissez d'abord un figuré de la légende (bouton « Dessiner »).");
      return;
    }
    setErreur("");
    if (entree.genre === "point" || enCours === null) {
      if (c.traces.length >= LIMITES_CARTE.traces) return;
      if (entree.genre !== "point") setEnCours(c.traces.length);
      setC((a) => ({ ...a, traces: [...a.traces, { e: actif, pts: [x, y] }] }));
    } else {
      setC((a) => ({
        ...a,
        traces: a.traces.map((t, i) => (i === enCours && t.pts.length < LIMITES_CARTE.points * 2 ? { ...t, pts: [...t.pts, x, y] } : t)),
      }));
    }
  }

  function surPoignee(e: PointerEvent, quoi: Glisse["quoi"], i: number, k: number) {
    if (e.button !== 0) return;
    e.stopPropagation();
    conteneur.current?.setPointerCapture(e.pointerId);
    setGlisse({ quoi, i, k, bouge: false });
  }

  function surDeplacement(e: PointerEvent<HTMLDivElement>) {
    if (!glisse) return;
    const [x, y] = position(e);
    setGlisse({ ...glisse, bouge: true });
    setC((a) =>
      glisse.quoi === "nom"
        ? { ...a, noms: a.noms.map((n, i) => (i === glisse.i ? { ...n, x, y } : n)) }
        : {
            ...a,
            traces: a.traces.map((t, i) =>
              i === glisse.i ? { ...t, pts: t.pts.map((v, j) => (j === glisse.k * 2 ? x : j === glisse.k * 2 + 1 ? y : v)) } : t,
            ),
          },
    );
  }

  function surFin() {
    if (glisse && !glisse.bouge) {
      if (glisse.quoi === "trace" && glisse.i !== enCours) {
        terminer();
        setChoisi(glisse.i);
      }
      // Un clic sur le premier point d'une zone en cours la ferme.
      if (glisse.quoi === "trace" && glisse.i === enCours && glisse.k === 0) terminer();
      if (glisse.quoi === "nom") document.getElementById(`nom-carte-${glisse.i}`)?.focus();
    }
    setGlisse(null);
  }

  async function choisirFond() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/gif";
    input.onchange = async () => {
      const fichier = input.files?.[0];
      if (!fichier) return;
      setEnvoi(true);
      setErreur("");
      try {
        const { cle, largeur, hauteur } = await envoyerImage(fichier);
        setC((a) => ({ ...a, cle, largeur, hauteur }));
      } catch (err) {
        setErreur(err instanceof Error ? err.message : "L'envoi de l'image a échoué.");
      } finally {
        setEnvoi(false);
      }
    };
    input.click();
  }

  const ajouterEntree = (genre: GenreCarte) => {
    if (c.legende.length >= LIMITES_CARTE.legende) return;
    const i = c.legende.length;
    const couleur = c.legende.filter((e) => e.genre !== "titre").length % (COULEURS_CARTE.length - 1);
    setC((a) => ({ ...a, legende: [...a.legende, { genre, motif: genre === "titre" ? "" : MOTIFS[genre][0]!.id, couleur, texte: "" }] }));
    if (genre !== "titre") choisirOutil(i);
  };
  const majEntree = (i: number, p: Partial<Carte["legende"][number]>) =>
    setC((a) => ({ ...a, legende: a.legende.map((x, j) => (j === i ? { ...x, ...p } : x)) }));
  const majNom = (i: number, p: Partial<Carte["noms"][number]>) =>
    setC((a) => ({ ...a, noms: a.noms.map((x, j) => (j === i ? { ...x, ...p } : x)) }));

  const decompte = (i: number) => c.traces.filter((t, k) => t.e === i && k !== enCours).length;
  // Aperçu : le tracé en cours n'est dessiné qu'une fois assez de points posés ; les noms sont
  // dessinés par les poignées (déplaçables).
  const assez = (i: number) => {
    const t = c.traces[i]!;
    return t.pts.length / 2 >= MIN_POINTS[c.legende[t.e]!.genre as GenreTrace];
  };
  const apercu: Carte = { ...c, noms: [], traces: c.traces.filter((_, i) => i !== enCours || assez(i)) };
  const entreeActive = typeof actif === "number" ? c.legende[actif] : undefined;
  const consigne =
    actif === "nom"
      ? "Cliquez sur la carte pour placer un nom, puis écrivez-le dans la liste."
      : entreeActive
        ? entreeActive.genre === "point"
          ? `Cliquez sur la carte pour placer « ${entreeActive.texte || "point"} ».`
          : enCours === null
            ? `Cliquez sur la carte pour commencer : ${NOMS_GENRES_CARTE[entreeActive.genre].toLowerCase()} « ${entreeActive.texte || "sans titre"} ».`
            : "Un clic par point ; « Terminer » ou double-clic pour finir."
        : "Ajoutez un figuré à la légende, puis dessinez-le sur la carte.";

  return (
    <DialogueDessin
      ouvert={Boolean(carte)}
      titre={carte?.pos === undefined ? "Nouvelle carte" : "Modifier la carte"}
      nouveau={carte?.pos === undefined}
      formulaire={
        <>
          <Section titre="Fond de carte">
            <div className={ligne}>
              <button type="button" onClick={choisirFond} disabled={envoi} className={petit}>
                {envoi ? "Envoi…" : c.cle ? "Changer l'image" : "Choisir une image…"}
              </button>
              {c.cle ? (
                <button type="button" onClick={() => setC((a) => ({ ...a, cle: null, largeur: 1000, hauteur: 750 }))} className={petit}>
                  Fond blanc
                </button>
              ) : null}
            </div>
            <p className="text-xs text-muted">
              {c.cle
                ? `Image de ${c.largeur} × ${c.hauteur} px. Les figurés restent à la même place si vous la changez.`
                : "Fond de carte libre de droits ou dessiné par vous (5 Mo max.). Sans image, le croquis est dessiné sur fond blanc."}
            </p>
          </Section>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Titre du croquis
            <input value={c.titre} onChange={(e) => setC((a) => ({ ...a, titre: e.target.value }))} maxLength={150} className={champ} />
          </label>

          <Section titre="Légende">
            {c.legende.map((e, i) => (
              <div key={i} className={`${ligne} ${e.genre === "titre" ? "mt-1" : ""}`}>
                {e.genre === "titre" ? (
                  <span className="w-20 text-xs font-bold text-muted">Partie</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => choisirOutil(actif === i ? null : i)}
                    aria-pressed={actif === i}
                    title="Dessiner ce figuré sur la carte"
                    className={`min-h-9 w-20 rounded-full px-2 text-sm font-medium ${actif === i ? "bg-ink text-white" : "bg-soft hover:bg-line"}`}
                  >
                    {NOMS_GENRES_CARTE[e.genre]}
                  </button>
                )}
                {e.genre !== "titre" ? (
                  <>
                    <select value={e.motif} onChange={(ev) => majEntree(i, { motif: ev.target.value })} aria-label="Motif" className={champ}>
                      {MOTIFS[e.genre].map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nom}
                        </option>
                      ))}
                    </select>
                    <select value={e.couleur} onChange={(ev) => majEntree(i, { couleur: Number(ev.target.value) })} aria-label="Couleur" className={champ}>
                      {COULEURS_CARTE.map((nom, k) => (
                        <option key={k} value={k}>
                          {nom}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
                <input
                  value={e.texte}
                  onChange={(ev) => majEntree(i, { texte: ev.target.value })}
                  maxLength={LIMITES_CARTE.texte}
                  aria-label={e.genre === "titre" ? "Titre de la partie" : "Ce que représente le figuré"}
                  placeholder={e.genre === "titre" ? "I. Titre de la partie" : "Ce qu'il représente"}
                  className={`${champ} min-w-32 flex-1 ${e.genre === "titre" ? "font-bold" : ""}`}
                />
                {e.genre !== "titre" ? <span className="w-6 text-center text-xs text-muted tabular-nums" title="Figurés posés">{decompte(i)}</span> : null}
                <button
                  type="button"
                  onClick={() => {
                    terminer();
                    setChoisi(null);
                    setC((a) => echangerEntrees(a, i, i - 1));
                    if (actif === i) setActif(i - 1);
                    else if (actif === i - 1) setActif(i);
                  }}
                  disabled={i === 0}
                  aria-label={`Monter ${e.texte || "cette ligne"}`}
                  title="Monter"
                  className="min-h-9 min-w-9 rounded-full text-muted hover:bg-soft disabled:opacity-30"
                >
                  ↑
                </button>
                <Supprimer
                  onClick={() => {
                    terminer();
                    setChoisi(null);
                    setC((a) => retirerEntree(a, i));
                    setActif((o) => (o === i ? null : typeof o === "number" && o > i ? o - 1 : o));
                  }}
                  quoi={`${e.texte || "cette ligne de la légende"}${decompte(i) ? " et ses figurés" : ""}`}
                />
              </div>
            ))}
            {c.legende.length < LIMITES_CARTE.legende ? (
              <div className={ligne}>
                {AJOUTS.map((g) => (
                  <button key={g} type="button" onClick={() => ajouterEntree(g)} className={petit}>
                    + {NOMS_GENRES_CARTE[g]}
                  </button>
                ))}
              </div>
            ) : null}
          </Section>

          <Section titre="Noms de lieux">
            <button
              type="button"
              onClick={() => choisirOutil(actif === "nom" ? null : "nom")}
              aria-pressed={actif === "nom"}
              className={`min-h-9 self-start rounded-full px-3 text-sm font-medium ${actif === "nom" ? "bg-ink text-white" : "bg-soft hover:bg-line"}`}
            >
              Placer des noms sur la carte
            </button>
            {c.noms.map((n, i) => (
              <div key={i} className={ligne}>
                <input
                  id={`nom-carte-${i}`}
                  value={n.texte}
                  onChange={(ev) => majNom(i, { texte: ev.target.value })}
                  autoFocus={nomNeuf === i}
                  maxLength={LIMITES_CARTE.texte}
                  aria-label="Nom du lieu"
                  placeholder="Nom du lieu"
                  className={`${champ} flex-1`}
                />
                <select value={n.style} onChange={(ev) => majNom(i, { style: ev.target.value as StyleNom })} aria-label="Style" className={champ}>
                  {STYLES_NOMS.map((s) => (
                    <option key={s} value={s}>
                      {NOMS_STYLES[s]}
                    </option>
                  ))}
                </select>
                <Supprimer onClick={() => setC((a) => ({ ...a, noms: a.noms.filter((_, k) => k !== i) }))} quoi={`le nom ${n.texte || i + 1}`} />
              </div>
            ))}
          </Section>
        </>
      }
      apercu={
        <div className="flex flex-col gap-2">
          {/* Hauteur fixe (boutons toujours là, masqués quand inutiles) : la carte ne bouge pas sous la souris. */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setC((a) => ({ ...a, traces: a.traces.map((t, i) => (i === enCours ? { ...t, pts: t.pts.slice(0, -2) } : t)) }))}
              disabled={enCours === null}
              className={`${petit} disabled:invisible`}
            >
              Retirer le point
            </button>
            <button type="button" onClick={terminer} disabled={enCours === null} className={`${petit} disabled:invisible`}>
              Terminer
            </button>
            <button
              type="button"
              onClick={() => {
                setC((a) => ({ ...a, traces: a.traces.filter((_, i) => i !== choisi) }));
                setChoisi(null);
              }}
              disabled={choisi === null || enCours !== null}
              className={`${petit} disabled:invisible`}
            >
              Supprimer ce figuré
            </button>
          </div>
          <p className={`line-clamp-2 min-h-10 text-sm ${erreur ? "text-ink-2" : "text-muted"}`} role={erreur ? "alert" : undefined} aria-live="polite">
            {erreur || consigne}
          </p>
          <div onDoubleClick={terminer}>
            <CarteDessin
              c={apercu}
              edition={{
                conteneur,
                surAppui,
                surDeplacement,
                surFin,
                enCours: enCours !== null ? c.traces[enCours]?.pts : undefined,
                choisi,
                poignees: (
                  <>
                    {c.traces.flatMap((t, i) =>
                      Array.from({ length: t.pts.length / 2 }, (_, k) => (
                        <span
                          key={`${i}-${k}`}
                          className={`poignee-croquis${i === choisi || i === enCours ? " active" : ""}`}
                          style={{ left: `${t.pts[k * 2]! * 100}%`, top: `${t.pts[k * 2 + 1]! * 100}%` }}
                          onPointerDown={(e) => surPoignee(e, "trace", i, k)}
                        />
                      )),
                    )}
                    {c.noms.map((n, i) => (
                      <span
                        key={`n${i}`}
                        className={n.texte ? `nom-croquis ${n.style}` : "nom-vide"}
                        style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
                        onPointerDown={(e) => surPoignee(e, "nom", i, 0)}
                      >
                        {n.texte || "Nom ?"}
                      </span>
                    ))}
                  </>
                ),
              }}
            />
          </div>
        </div>
      }
      alt={c.alt}
      onAlt={(alt) => setC((a) => ({ ...a, alt }))}
      exempleAlt="Croquis de Madagascar : régions agricoles, ports et axes de transport"
      onValider={() => onValider(normaliserCarte(c as unknown as Record<string, unknown>))}
      onFermer={onFermer}
    />
  );
}
