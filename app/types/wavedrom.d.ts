/** Types minimaux de WaveDrom (le paquet n'en fournit pas). */
declare module "wavedrom" {
  type Onml = [string, Record<string, unknown>, ...unknown[]];
  const wavedrom: {
    renderAny: (index: number, source: unknown, skin: unknown) => Onml;
    waveSkin: unknown;
    onml: { stringify: (arbre: Onml) => string };
  };
  export default wavedrom;
}
