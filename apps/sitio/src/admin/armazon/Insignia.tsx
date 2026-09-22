/** Los tres tonos de DESIGN.md §11: la jerarquía sale del contraste, sin verde ni naranja. */
export type Tono = "fuerte" | "normal" | "apagado";

// Contrastes (DESIGN.md §11): fuerte, blanco sobre `azul-principal` 13,63:1;
// normal, `azul-principal` sobre blanco con el borde `azul-medio` 5,11:1;
// apagado, `gris-texto` sobre blanco 4,83:1.
const TONOS: Record<Tono, string> = {
  fuerte: "border-azul-principal bg-azul-principal text-white",
  normal: "border-azul-medio text-azul-principal",
  apagado: "border-gris-texto text-gris-texto",
};

/**
 * Una pastilla de estado. Lleva siempre texto: el color acompaña, no informa
 * solo. No sabe de páginas: quien la usa elige el tono y lo que dice.
 */
export function Insignia({ tono, children }: { tono: Tono; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-admin-meta font-medium whitespace-nowrap ${TONOS[tono]}`}>
      {tono === "normal" ? <span aria-hidden="true" className="size-1.5 rounded-full bg-azul-medio" /> : null}
      {children}
    </span>
  );
}
