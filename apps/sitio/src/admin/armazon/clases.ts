/** Las cuatro variantes de botón de DESIGN.md §11. Un solo `primario` por pantalla. */
export type Variante = "primario" | "secundario" | "terciario" | "destructivo";

const BASE =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-admin-meta font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio disabled:cursor-not-allowed disabled:opacity-60 aria-busy:cursor-wait aria-busy:opacity-100";

// Contrastes medidos (DESIGN.md §11): el primario 4,54:1 (5,07:1 en hover),
// el secundario 13,63:1 (11,63:1 en hover), el terciario 5,11:1 y el
// destructivo 6,57:1. Los dos últimos subrayan en hover: con el fondo
// `azul-claro/30`, el `azul-medio` baja a 4,36:1.
const VARIANTES: Record<Variante, string> = {
  primario: "bg-naranja-accion text-azul-principal hover:bg-naranja-accion/90",
  secundario: "border border-azul-principal text-azul-principal hover:bg-azul-claro/30",
  terciario: "text-azul-medio underline-offset-2 hover:underline",
  destructivo: "text-rojo-error underline-offset-2 hover:underline",
};

/**
 * Las clases de un botón del admin (`Boton.tsx`). Viven en un `.ts` para que
 * las usen también los elementos que no son un `Boton`, como el CTA de las
 * pantallas de acceso.
 */
export function claseDeBoton(variante: Variante) {
  return `${BASE} ${VARIANTES[variante]}`;
}
