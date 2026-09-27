/** Los tres tonos de DESIGN.md §11: la jerarquía sale del contraste, sin verde ni naranja. */
export type Tono = "fuerte" | "normal" | "apagado";

// Contrastes (DESIGN.md §11). Sobre blanco: fuerte, blanco sobre
// `azul-principal` 13,63:1; normal, `azul-principal` con el borde
// `azul-medio` 5,11:1; apagado, `gris-texto` 4,83:1. Sobre `azul-principal`
// se invierten: el blanco 13,63:1 y el `azul-claro` 7,68:1.
const SOBRE_BLANCO: Record<Tono, string> = {
  fuerte: "border-azul-principal bg-azul-principal text-white",
  normal: "border-azul-medio text-azul-principal",
  apagado: "border-gris-texto text-gris-texto",
};

const SOBRE_AZUL: Record<Tono, string> = {
  fuerte: "border-white bg-white text-azul-principal",
  normal: "border-azul-claro text-white",
  apagado: "border-azul-claro text-azul-claro",
};

type Props = {
  tono: Tono;
  /** Está sobre `azul-principal`. */
  sobreAzul?: boolean;
  children: React.ReactNode;
};

/**
 * Una pastilla de estado. Lleva siempre texto: el color acompaña, no informa
 * solo. No sabe de páginas: quien la usa elige el tono y lo que dice.
 */
export function Insignia({ tono, sobreAzul = false, children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-admin-meta font-medium whitespace-nowrap transition-colors ${(sobreAzul ? SOBRE_AZUL : SOBRE_BLANCO)[tono]}`}
    >
      {tono === "normal" ? <span aria-hidden="true" className={`size-1.5 rounded-full ${sobreAzul ? "bg-azul-claro" : "bg-azul-medio"}`} /> : null}
      {children}
    </span>
  );
}
