import type { Lecturas } from "./comun";

// Una novedad no lleva a ningún lado: se puede haber borrado.
export const DE_LAS_NOVEDADES = {
  "publico-una-novedad": { modulo: "novedades" },
  "despublico-una-novedad": { modulo: "novedades" },
  "descarto-cambios-de-una-novedad": { modulo: "novedades" },
  "borro-una-novedad": { modulo: "novedades" },
} satisfies Lecturas;
