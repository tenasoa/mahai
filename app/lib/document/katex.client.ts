/**
 * Chargement paresseux de KaTeX (+ mhchem pour \ce{…}) côté navigateur : la page ne le
 * télécharge que si elle contient une formule. Une seule promesse partagée par la page.
 */
type Katex = typeof import("katex").default;

let chargement: Promise<Katex> | null = null;

export function chargerKatex(): Promise<Katex> {
  chargement ??= (async () => {
    const [{ default: katex }] = await Promise.all([
      import("katex"),
      import("katex/dist/katex.min.css"),
    ]);
    await import("katex/contrib/mhchem");
    return katex;
  })();
  return chargement;
}

export const OPTIONS_KATEX = {
  throwOnError: false,
  trust: false,
  strict: "ignore",
  maxExpand: 500,
  maxSize: 20,
} as const;

export async function dessinerFormule(el: HTMLElement, latex: string, bloc: boolean) {
  const katex = await chargerKatex();
  katex.render(latex, el, { ...OPTIONS_KATEX, displayMode: bloc });
}
