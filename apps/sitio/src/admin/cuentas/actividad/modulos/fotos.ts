import type { Lecturas } from "./comun";

// Una foto no lleva a ningún lado: se puede haber borrado.
export const DE_LAS_FOTOS = {
  "subio-una-foto": { modulo: "contenido" },
  "reemplazo-una-foto": { modulo: "contenido" },
  "borro-una-foto": { modulo: "contenido" },
} satisfies Lecturas;
