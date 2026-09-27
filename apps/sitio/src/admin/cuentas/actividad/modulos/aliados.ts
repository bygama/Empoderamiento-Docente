import type { Lecturas } from "./comun";

// Un aliado no lleva a ningún lado: se puede haber borrado.
export const DE_LOS_ALIADOS = {
  "autorizo-un-aliado": { modulo: "contenido" },
  "quito-la-autorizacion-de-un-aliado": { modulo: "contenido" },
  "publico-un-aliado": { modulo: "contenido" },
  "despublico-un-aliado": { modulo: "contenido" },
  "borro-un-aliado": { modulo: "contenido" },
} satisfies Lecturas;
