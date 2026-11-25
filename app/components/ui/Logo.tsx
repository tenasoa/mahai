/** Marque Mah.ai : quatre tuiles de matières et le nom (`seul` : les tuiles sans le nom). */
export function Logo({ seul = false }: { seul?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight">
      <span aria-hidden="true" className="grid w-[22px] grid-cols-2 gap-[2px]">
        <span className="h-[10px] rounded-[3px] bg-maths" />
        <span className="h-[10px] rounded-[3px] bg-histoire" />
        <span className="h-[10px] rounded-[3px] bg-francais" />
        <span className="h-[10px] rounded-[3px] bg-svt" />
      </span>
      {seul ? null : "Mah.ai"}
    </span>
  );
}
